import { Button } from "components/button";
import { PostGridSkeleton } from "./PostSkeletons";
import React from "react";
import styled from "styled-components";
import PostItem from "./PostItem";

const PostListStyles = styled.div`
  .post-list__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 8px;
    margin-bottom: 40px;
  }
  .post-list__message {
    margin: 40px 0;
    text-align: center;
  }
  @media only screen and (max-width: 1024px) {
    .post-list__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media only screen and (max-width: 640px) {
    .post-list__grid {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
`;

// Grid of posts with loading, error and empty states and a "Load more"
// button; pairs with usePaginatedQuery
const PostList = ({
  posts,
  loading,
  error,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  emptyText = "No posts yet.",
}) => {
  if (loading) return <PostGridSkeleton count={6}></PostGridSkeleton>;
  return (
    <PostListStyles>
      {posts.length > 0 ? (
        <div className="post-list__grid">
          {posts.map((post) => (
            <PostItem key={post.id} data={post}></PostItem>
          ))}
        </div>
      ) : (
        !error && <p className="post-list__message">{emptyText}</p>
      )}
      {error && (
        <p className="post-list__message">
          Could not load posts. Please try again in a moment.
        </p>
      )}
      {hasMore && (
        <Button onClick={onLoadMore} disabled={loadingMore} isLoading={loadingMore}>
          Load more
        </Button>
      )}
    </PostListStyles>
  );
};

export default PostList;
