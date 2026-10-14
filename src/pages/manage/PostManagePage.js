import { ActionDelete, ActionEdit, ActionView } from "components/actions";
import { PageHeader, SearchInput } from "components/admin";
import { Button } from "components/button";
import { Image } from "components/image";
import { Table, TableSkeletonRows } from "components/table";
import { db } from "config/firebase-config";
import { collection, doc, query, updateDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { deletePost } from "module/post/deletePost";
import { formatDate } from "utils/formatDate";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import debounce from "lodash/debounce";
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import styled from "styled-components";
import {
  isStaffRole,
  postStatus,
  thumbnailPlaceholder,
  userRole,
} from "utils/constants";
import { useAuthStore } from "store";

const PostInfoStyles = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 420px;
  img {
    width: 64px;
    height: 40px;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: 6px;
  }
  .post-info__title {
    font-weight: 600;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const StatusTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  button {
    padding: 6px 14px;
    border: 1px solid var(--color-border);
    border-radius: 100rem;
    background: var(--color-surface);
    color: var(--color-text);
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
    padding: 2px 10px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 12px;
  }
  button:hover {
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
`;

// ?status=pending (from the dashboard) opens that filter
const statusByName = {
  pending: postStatus.PENDING,
  approved: postStatus.APPROVED,
  rejected: postStatus.REJECTED,
  draft: postStatus.DRAFT,
  scheduled: postStatus.SCHEDULED,
};

const statusTabs = [
  { label: "All", value: null },
  { label: "Pending", value: postStatus.PENDING },
  { label: "Approved", value: postStatus.APPROVED },
  { label: "Rejected", value: postStatus.REJECTED },
  { label: "Drafts", value: postStatus.DRAFT },
  { label: "Scheduled", value: postStatus.SCHEDULED },
];

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100rem;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  &.approved {
    color: #27ae60;
    background-color: rgba(39, 174, 96, 0.14);
  }
  &.pending {
    color: #e67e22;
    background-color: rgba(230, 126, 34, 0.14);
  }
  &.draft {
    color: #7f8c8d;
    background-color: rgba(127, 140, 141, 0.16);
  }
  &.scheduled {
    color: #9b59b6;
    background-color: rgba(155, 89, 182, 0.14);
  }
  &.rejected {
    color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.14);
  }
`;

const CategoryBadge = styled.span`
  display: inline-block;
  margin: 0 4px 4px 0;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: var(--color-subtle);
  font-size: 12px;
  white-space: nowrap;
`;

const ScheduledAt = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-muted);
  white-space: nowrap;
`;

const PostManagePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore((state) => state);
  const [filter, setFilter] = useState("");
  const [params] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    statusByName[params.get("status")] ?? null
  );
  const canModerate = isStaffRole(currentUser?.role);
  const uid = currentUser?.uid;
  const role = currentUser?.role;

  const handleFilterChange = useMemo(
    () => debounce((e) => setFilter(e.target.value), 500),
    []
  );

  // Admin and Mod can see all posts, regular users only see their own
  const { data: posts, loading } = useFirestoreQuery(() => {
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
  const getStatusBadge = (status, publishAt) => {
    switch (status) {
      case postStatus.DRAFT:
        return <StatusBadge className="draft">Draft</StatusBadge>;
      case postStatus.SCHEDULED:
        return (
          <>
            <StatusBadge className="scheduled">Scheduled</StatusBadge>
            <ScheduledAt>{formatDate(publishAt)}</ScheduledAt>
          </>
        );
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
      <PageHeader title="Posts" description="Write, review and publish posts.">
        <SearchInput aria-label="Search posts" onChange={handleFilterChange} />
        <Button size="md" href="/manage/add-post">
          New post
        </Button>
      </PageHeader>
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
            <th>Post</th>
            <th>Author</th>
            <th>Categories</th>
            <th>Status</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {loading && <TableSkeletonRows columns={5}></TableSkeletonRows>}
          {!loading && !filteredPosts.length && (
            <tr>
              <td colSpan={5} className="table-empty">
                No posts here yet.
              </td>
            </tr>
          )}
          {filteredPosts.map((post) => (
            <tr key={post.id}>
              <td>
                <PostInfoStyles>
                  <Image
                    src={post.thumbnail}
                    fallback={thumbnailPlaceholder}
                    resizeTo={160}
                  />
                  <span className="post-info__title" title={post.title}>
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
                {getStatusBadge(post.status, post.publishAt)}
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
                <div className="table-actions">
                  <ActionView
                    onClick={() => navigate(`/post/${post.slug}`)}
                  ></ActionView>
                  <ActionEdit
                    onClick={() =>
                      navigate(`/manage/update-post?id=${post.id}`)
                    }
                  ></ActionEdit>
                  <ActionDelete
                    onClick={() => handleDeletePost(post.id)}
                  ></ActionDelete>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default PostManagePage;
