import { ActionDelete, ActionEdit } from "components/actions";
import { Toggle } from "components/checkbox";
import { FieldCheckboxes } from "components/field";
import { IconSearch } from "components/icons";
import Heading from "components/layout/Heading";
import { Table } from "components/table";
import { db } from "config/firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styled from "styled-components";
import { getRoleName, userRole, userStatus } from "utils/constants";
import { useAuthStore } from "store";

const InfoColStyles = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .avt {
    width: 50px;
    height: 50px;
    padding: 6px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    border-radius: 100rem;
    img {
      border-radius: 100rem;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  img {
    width: 100%;
  }
  p {
    font-size: 13px;
    color: gray;
  }
`;

const RoleBadge = styled.span`
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  &.admin {
    background-color: #e74c3c;
  }
  &.mod {
    background-color: #f39c12;
  }
  &.user {
    background-color: #3498db;
  }
`;

const RoleSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const UserManagePage = () => {
  const { user: currentUser } = useAuthStore((state) => state);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");

  const handleFilterChange = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  useEffect(() => {
    const colRef = collection(db, "users");
    onSnapshot(colRef, (snapshot) => {
      const result = [];
      snapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setUsers(result);
    });
  }, []);

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
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const colRef = doc(db, "users", userId);
        await deleteDoc(colRef);
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

  // Only show this page for Admin
  if (currentUser?.role !== userRole.ADMIN) {
    return (
      <>
        <Heading>Access Denied</Heading>
        <p>You do not have permission to access this page.</p>
      </>
    );
  }

  return (
    <>
      <FieldCheckboxes>
        <Heading>User Manager</Heading>
        <div
          className="search"
          style={{ marginBottom: "30px", marginLeft: "auto" }}
        >
          <input
            type="text"
            className="search-input"
            placeholder="Type to search..."
            onChange={handleFilterChange}
          />
          <span className="search-icon">
            <IconSearch></IconSearch>
          </span>
        </div>
      </FieldCheckboxes>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Info</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td title={user.id}>{user.id.slice(0, 10) + "..."}</td>
              <td>
                <InfoColStyles>
                  <div className="avt">
                    <img src={user.avatar} alt="" />
                  </div>
                  <div>
                    <h3>{user.fullname}</h3>
                    <p>@{user.username}</p>
                  </div>
                </InfoColStyles>
              </td>
              <td>{user.email}</td>
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
                  <FieldCheckboxes>
                    <ActionEdit></ActionEdit>
                    <ActionDelete
                      onClick={() => handleDeleteUser(user.id)}
                    ></ActionDelete>
                  </FieldCheckboxes>
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
