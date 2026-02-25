import { db } from "config/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import NotFoundPage from "./NotFoundPage";
import PostThumbnail from "module/post/components/PostThumbnail";
import PostMeta from "module/post/components/PostMeta";
import AuthorBox from "module/post/components/AuthorBox";
import { formatDate } from "utils/formatDate";

const PostDetailStyles = styled.div`
  padding-bottom: 100px;
  .post {
    &-header {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      gap: 40px;
      margin: 40px 0;
    }
    &-feature {
      width: 100%;
      max-width: 640px;
      height: 466px;
      border-radius: 20px;
    }
    &-heading {
      font-weight: bold;
      font-size: 36px;
      margin-bottom: 16px;
    }
    &-info .post-meta {
      margin: 0 auto;
      padding: 8px 0;
      width: fit-content;
      border: 1px solid;
      border-color: #ddd transparent #ddd transparent;
      & .post-auth-name {
        color: black;
      }
    }
    &-content {
      max-width: 700px;
      margin: 40px auto 80px auto;
    }
  }
  .author {
    margin-top: 40px;
    margin-bottom: 80px;
    display: flex;
    border-radius: 20px;
    background: ${(props) => props.theme.gray1};
    &-image {
      width: 200px;
      height: 200px;
      flex-shrink: 0;
      border-radius: inherit;
    }
    &-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
    &-content {
      flex: 1;
      padding: 20px;
    }
    &-name {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 20px;
    }
    &-desc {
      font-size: 14px;
      line-height: 2;
    }
  }
  @media screen and (max-width: 1023.98px) {
    padding-bottom: 40px;
    .post {
      &-header {
        flex-direction: column;
      }
      &-feature {
        height: auto;
      }
      &-heading {
        font-size: 26px;
        padding: 24px;
      }
      &-content {
        margin: 40px auto;
      }
    }
    .author {
      flex-direction: column;
      &-image {
        width: 100%;
        height: auto;
      }
    }
  }
`;

const PostDetailPage = () => {
  const { slug } = useParams();
  const [postInfo, setPostInfo] = useState({});
  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      const colRef = query(collection(db, "posts"), where("slug", "==", slug));

      onSnapshot(colRef, (snapshot) => {
        snapshot.forEach((doc) => {
          doc.data() &&
            setPostInfo({
              id: doc.id,
              ...doc.data(),
            });
        });
      });
    }
    fetchData();
  }, [slug]);
  useEffect(() => {
    document.body.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [slug]);
  if (!slug) return <NotFoundPage></NotFoundPage>;
  if (!postInfo.title) return null;
  const { user } = postInfo;
  return (
    <PostDetailStyles className="container">
      <div className="container">
        <div className="post-header">
          <PostThumbnail
            url={postInfo.thumbnail}
            className="post-feature"
          ></PostThumbnail>
          <div className="post-info">
            {/* <PostCategory className="mb-6" to={postInfo.category?.slug}>
              {postInfo.category?.name}
            </PostCategory> */}
            <h1 className="post-heading">{postInfo.title}</h1>
            <PostMeta
              date={formatDate(postInfo.createdAt)}
              auth={postInfo.user}
            ></PostMeta>
            {/* Check if user role is ADMIN then can edit the post */}
            {/* {userInfo?.role === userRole.ADMIN && (
              <Link
                to={`/manage/update-post?id=${postInfo.id}`}
                className="inline-block px-4 py-2 mt-5 text-sm border border-gray-400 rounded-md"
              >
                Edit post
              </Link>
            )} */}
          </div>
        </div>
        <div className="post-content">
          <div
            className="entry-content"
            // Prevent XSS Attack recommen from React Docs
            dangerouslySetInnerHTML={{
              __html: postInfo.content || "",
            }}
          ></div>
          <AuthorBox userId={user.id}></AuthorBox>
        </div>
        {/* <PostRelated categoryId={postInfo?.category?.id}></PostRelated> */}
      </div>
    </PostDetailStyles>
  );
};

export default PostDetailPage;
