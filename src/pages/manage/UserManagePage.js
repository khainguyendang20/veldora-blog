import { ActionDelete } from "components/actions";
import { Toggle } from "components/checkbox";
import { Image } from "components/image";
import { PageHeader, SearchInput } from "components/admin";
import { Table } from "components/table";
import { db } from "config/firebase-config";
import { collection, doc, updateDoc, writeBatch } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import debounce from "lodash/debounce";
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import styled from "styled-components";
import {
  avatarDefault,
  getRoleName,
  userRole,
  userStatus,
} from "utils/constants";
import { useAuthStore } from "store";

const InfoColStyles = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  img {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 100rem;
    object-fit: cover;
  }
  h3 {
    font-size: 14px;
    font-weight: 600;
  }
  p {
    font-size: 13px;
    color: var(--color-muted);
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100rem;
  font-size: 12px;
  font-weight: 600;
  &.admin {
    color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.14);
  }
  &.mod {
    color: #e67e22;
    background-color: rgba(230, 126, 34, 0.14);
  }
  &.user {
    color: #2980b9;
    background-color: rgba(41, 128, 185, 0.14);
  }
`;

const RoleSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const UserManagePage = () => {
  const { user: currentUser } = useAuthStore((state) => state);
  const [filter, setFilter] = useState("");
  // Route is admin-only (RequireRole in App.js)
  const { data: profiles } = useFirestoreQuery(
    () => collection(db, "users"),
    []
  );
  // Emails live apart from the public profiles; only admins read them all
  const { data: emails } = useFirestoreQuery(
    () => collection(db, "userEmails"),
    []
  );
  const users = useMemo(() => {
    const emailById = Object.fromEntries(
      emails.map((entry) => [entry.id, entry.email])
    );
    return profiles.map((profile) => ({
      ...profile,
      email: emailById[profile.id] || profile.email,
    }));
  }, [profiles, emails]);

  const handleFilterChange = useMemo(
    () => debounce((e) => setFilter(e.target.value), 500),
    []
  );

  const filteredUsers = users.filter((user) => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      user.fullname?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.username?.toLowerCase().includes(searchTerm)
    );
  });

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.uid) {
      Swal.fire("Error!", "You cannot change your own role.", "error");
      return;
    }
    const colRef = doc(db, "users", userId);
    await updateDoc(colRef, {
      role: Number(newRole),
    });
    Swal.fire("Success!", "User role updated successfully.", "success");
  };

  const handleToggleStatus = async (userData) => {
    if (userData.id === currentUser?.uid) {
      Swal.fire("Error!", "You cannot change your own status.", "error");
      return;
    }
    const colRef = doc(db, "users", userData.id);
    const newStatus =
      userData.status === userStatus.BANNED
        ? userStatus.ACTIVE
        : userStatus.BANNED;
    await updateDoc(colRef, {
      status: newStatus,
    });
    Swal.fire(
      "Success!",
      `User ${newStatus === userStatus.BANNED ? "banned" : "activated"} successfully.`,
      "success"
    );
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser?.uid) {
      Swal.fire("Error!", "You cannot delete your own account.", "error");
      return;
    }
    // The browser cannot delete another user's Firebase Auth account (that
    // needs the Admin SDK). Without a profile the account can no longer
    // write anything, but its sign-in still exists until removed by hand.
    Swal.fire({
      title: "Are you sure?",
      text: "This deletes the user's profile and blocks them from posting. Also delete their sign-in under Firebase Console → Authentication.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // The email lives apart from the profile; remove both together
        const batch = writeBatch(db);
        batch.delete(doc(db, "users", userId));
        batch.delete(doc(db, "userEmails", userId));
        await batch.commit();
        Swal.fire("Deleted!", "User has been deleted.", "success");
      }
    });
  };

  const getRoleClass = (role) => {
    switch (role) {
      case userRole.ADMIN:
        return "admin";
      case userRole.MOD:
        return "mod";
      default:
        return "user";
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Roles and access for everyone who signed up."
      >
        <SearchInput aria-label="Search users" onChange={handleFilterChange} />
      </PageHeader>
      <Table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <InfoColStyles>
                  <Image
                    src={user.avatar}
                    fallback={avatarDefault}
                    resizeTo={96}
                  />
                  <div>
                    <h3>{user.fullname}</h3>
                    <p>@{user.username}</p>
                  </div>
                </InfoColStyles>
              </td>
              <td style={{ color: "var(--color-muted)" }}>{user.email}</td>
              <td>
                {user.id === currentUser?.uid ? (
                  <RoleBadge className={getRoleClass(user.role)}>
                    {getRoleName(user.role)}
                  </RoleBadge>
                ) : (
                  <RoleSelect
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value={userRole.ADMIN}>Admin</option>
                    <option value={userRole.MOD}>Moderator</option>
                    <option value={userRole.USER}>User</option>
                  </RoleSelect>
                )}
              </td>
              <td>
                <Toggle
                  on={user.status !== userStatus.BANNED}
                  onClick={() => handleToggleStatus(user)}
                ></Toggle>
              </td>
              <td>
                {user.id !== currentUser?.uid && (
                  <div className="table-actions">
                    <ActionDelete
                      label="Delete user"
                      onClick={() => handleDeleteUser(user.id)}
                    ></ActionDelete>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default UserManagePage;
