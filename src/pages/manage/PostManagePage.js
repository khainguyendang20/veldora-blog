import { ActionDelete, ActionEdit, ActionView } from "components/actions";
import { FieldCheckboxes } from "components/field";
import { IconSearch } from "components/icons";
import { Image } from "components/image";
import Heading from "components/layout/Heading";
import { Table } from "components/table";
import { db } from "config/firebase-config";
import {
  collection,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { deletePost } from "module/post/deletePost";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import debounce from "lodash/debounce";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styled from "styled-components";
import { shortId } from "utils/shortId";
import {
  isStaffRole,
  postStatus,
  thumbnailPlaceholder,
  userRole,
} from "utils/constants";
import { useAuthStore } from "store";

const PostInfoStyles = styled.div`
  display: flex;
  gap: 8px;
  img {
    aspect-ratio: 16/9;
    object-fit: cover;
    width: 120px;
    border-radius: 4px;
  }
  span {
    font-weight: 600;
  }
`;

const StatusTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  button {
    padding: 6px 14px;
    border: 1px solid #ddd;
    border-radius: 100rem;
    background: white;
    cursor: pointer;
    font-size: 14px;
  }
  button[aria-pressed="true"] {
    border-color: ${(props) => props.theme.primary};
    background: ${(props) => props.theme.primary};
    color: white;
  }
`;

const ModerationActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  button {
    padding: 2px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
  }
`;

const statusTabs = [
  { label: "All", value: null },
  { label: "Pending", value: postStatus.PENDING },
  { label: "Approved", value: postStatus.APPROVED },
  { label: "Rejected", value: postStatus.REJECTED },
];

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  &.approved {
    background-color: #27ae60;
  }
  &.pending {
    background-color: #f39c12;
  }
  &.rejected {
    background-color: #e74c3c;
  }
`;

const CategoryBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  background-color: #ecf0f1;
  color: #2c3e50;
  margin-right: 4px;
  display: inline-block;
  margin-bottom: 4px;
`;

const PostManagePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore((state) => state);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const canModerate = isStaffRole(currentUser?.role);
  const uid = currentUser?.uid;
  const role = currentUser?.role;

  const handleFilterChange = useMemo(
    () => debounce((e) => setFilter(e.target.value), 500),
    []
  );

  // Admin and Mod can see all posts, regular users only see their own
  const { data: posts } = useFirestoreQuery(() => {
    if (!uid) return null;
    const colRef = collection(db, "posts");
    if (role === userRole.ADMIN || role === userRole.MOD) return colRef;
    return query(colRef, where("user.id", "==", uid));
  }, [uid, role]);

  const countByStatus = (status) =>
    status === null
      ? posts.length
      : posts.filter((post) => post.status === status).length;
  const filteredPosts = posts.filter((post) => {
    if (statusFilter !== null && post.status !== statusFilter) return false;
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchTerm) ||
      post.user?.fullname?.toLowerCase().includes(searchTerm)
    );
  });

  const handleDeletePost = (postId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await deletePost(postId);
        Swal.fire("Deleted!", "Post has been deleted.", "success");
      } catch (error) {
        toast.error("Could not delete the post, please try again.");
      }
    });
  };

  const handleSetStatus = async (post, status) => {
    try {
      await updateDoc(doc(db, "posts", post.id), { status });
      toast.success(
        status === postStatus.APPROVED
          ? `Approved "${post.title}"`
          : `Rejected "${post.title}"`
      );
    } catch (error) {
      toast.error("Could not update the post, please try again.");
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case postStatus.APPROVED:
        return <StatusBadge className="approved">Approved</StatusBadge>;
      case postStatus.PENDING:
        return <StatusBadge className="pending">Pending</StatusBadge>;
      case postStatus.REJECTED:
        return <StatusBadge className="rejected">Rejected</StatusBadge>;
      default:
        return <StatusBadge className="pending">Unknown</StatusBadge>;
    }
  };

  return (
    <>
      <FieldCheckboxes>
        <Heading>Post Manager</Heading>
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
      <StatusTabs role="group" aria-label="Filter by status">
        {statusTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            aria-pressed={statusFilter === tab.value}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label} ({countByStatus(tab.value)})
          </button>
        ))}
      </StatusTabs>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Info</th>
            <th>Author</th>
            <th>Categories</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPosts.map((post) => (
            <tr key={post.id}>
              <td title={post.id}>{shortId(post.id)}</td>
              <td
                style={{
                  width: "280px",
                }}
              >
                <PostInfoStyles>
                  <Image
                    src={post.thumbnail}
                    fallback={thumbnailPlaceholder}
                    resizeTo={160}
                  />
                  <span title={post.title} className="truncate">
                    {post.title}
                  </span>
                </PostInfoStyles>
              </td>
              <td>{post.user?.fullname}</td>
              <td>
                {post.categories?.map((cat, index) => (
                  <CategoryBadge key={index}>{cat.name || cat}</CategoryBadge>
                ))}
              </td>
              <td>
                {getStatusBadge(post.status)}
                {canModerate && (
                  <ModerationActions>
                    {post.status !== postStatus.APPROVED && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetStatus(post, postStatus.APPROVED)
                        }
                      >
                        Approve
                      </button>
                    )}
                    {post.status !== postStatus.REJECTED && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetStatus(post, postStatus.REJECTED)
                        }
                      >
                        Reject
                      </button>
                    )}
                  </ModerationActions>
                )}
              </td>
              <td>
                <FieldCheckboxes>
                  <ActionView
                    onClick={() => navigate(`/post/${post.slug}`)}
                  ></ActionView>
                  <ActionEdit
                    onClick={() => navigate(`/manage/update-post?id=${post.id}`)}
                  ></ActionEdit>
                  <ActionDelete
                    onClick={() => handleDeletePost(post.id)}
                  ></ActionDelete>
                </FieldCheckboxes>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default PostManagePage;
