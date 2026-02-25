import { ActionDelete, ActionEdit, ActionView } from "components/actions";
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
  query,
  where,
} from "firebase/firestore";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styled from "styled-components";
import { shortId } from "utils/shortId";
import { postStatus, userRole } from "utils/constants";
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
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("");

  const handleFilterChange = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  useEffect(() => {
    if (!currentUser) return;

    const colRef = collection(db, "posts");
    let queryRef;

    // Admin and Mod can see all posts, regular users only see their own
    if (
      currentUser.role === userRole.ADMIN ||
      currentUser.role === userRole.MOD
    ) {
      queryRef = colRef;
    } else {
      queryRef = query(colRef, where("user.id", "==", currentUser.uid));
    }

    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const result = [];
      snapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPosts(result);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredPosts = posts.filter((post) => {
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
      if (result.isConfirmed) {
        const colRef = doc(db, "posts", postId);
        await deleteDoc(colRef);
        Swal.fire("Deleted!", "Post has been deleted.", "success");
      }
    });
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
                  <img src={post.thumbnail} alt="" />
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
              <td>{getStatusBadge(post.status)}</td>
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
