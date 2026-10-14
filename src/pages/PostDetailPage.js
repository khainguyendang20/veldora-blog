import { db } from "config/firebase-config";
import { collection, query, where } from "firebase/firestore";
import DOMPurify from "dompurify";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import React, { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import NotFoundPage from "./NotFoundPage";
import { PostDetailSkeleton } from "module/post/PostSkeletons";
import PostThumbnail from "module/post/components/PostThumbnail";
import PostMeta from "module/post/components/PostMeta";
import AuthorBox from "module/post/components/AuthorBox";
import PostCategory from "module/post/components/PostCategory";
import PostRelated from "module/post/PostRelated";
import CommentSection from "module/comment/CommentSection";
import PostActions from "module/post/PostActions";
import TableOfContents from "module/post/TableOfContents";
import { highlightCode } from "module/post/highlightCode";
import { addHeadingIds } from "utils/headings";
import { formatDate } from "utils/formatDate";
import { readingTime } from "utils/readingTime";
import { postSummary } from "utils/postSummary";
import { useAuthStore } from "store";
import { isStaffRole, postStatus } from "utils/constants";
import useDocumentMeta from "hooks/useDocumentMeta";

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
    &-categories {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    &-edit {
      display: inline-block;
      margin-top: 16px;
      padding: 6px 16px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 14px;
    }
    &-info {
      text-align: center;
    }
    &-info .post-meta {
      margin: 0 auto;
      padding: 8px 0;
      width: fit-content;
      border: 1px solid;
      border-color: var(--color-border) transparent var(--color-border)
        transparent;
      & .post-auth-name {
        color: var(--color-text);
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
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const isStaff = useAuthStore((state) => isStaffRole(state.user?.role));
  const uid = useAuthStore((state) => state.user?.uid);
  // Firestore rules only let everyone else read approved posts, and reject
  // any query that could return something else. Wait for the session so
  // staff don't briefly see "not found" for an unapproved post.
  const { data: posts, loading } = useFirestoreQuery(() => {
    if (!slug || isAuthLoading) return null;
    const bySlug = query(collection(db, "posts"), where("slug", "==", slug));
    return isStaff
      ? bySlug
      : query(bySlug, where("status", "==", postStatus.APPROVED));
  }, [slug, isStaff, isAuthLoading]);
  const postInfo = posts[posts.length - 1];
  useDocumentMeta({
    title: postInfo?.title,
    description: postInfo ? postSummary(postInfo) : undefined,
  });
  useEffect(() => {
    document.body.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [slug]);
  // Content is user-authored HTML, so sanitize it to prevent XSS, then
  // give its headings ids for the table of contents
  const content = useMemo(
    () => addHeadingIds(DOMPurify.sanitize(postInfo?.content || "")),
    [postInfo?.content]
  );
  const contentRef = useRef(null);
  useEffect(() => {
    if (contentRef.current) highlightCode(contentRef.current);
  }, [content.html]);
  if (slug && (isAuthLoading || loading)) {
    return <PostDetailSkeleton></PostDetailSkeleton>;
  }
  if (!postInfo) return <NotFoundPage></NotFoundPage>;
  const { user } = postInfo;
  const canEdit = isStaff || (uid && user?.id === uid);
  return (
    <PostDetailStyles className="container">
      <div className="container">
        <div className="post-header">
          <PostThumbnail
            url={postInfo.thumbnail}
            className="post-feature"
            imageWidth={1280}
          ></PostThumbnail>
          <div className="post-info">
            {postInfo.categories?.length > 0 && (
              <div className="post-categories">
                {postInfo.categories.map((category) => (
                  <PostCategory
                    key={category.id}
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </PostCategory>
                ))}
              </div>
            )}
            <h1 className="post-heading">{postInfo.title}</h1>
            <PostMeta
              date={formatDate(postInfo.createdAt)}
              auth={postInfo.user}
              minutesToRead={readingTime(postInfo.content)}
            ></PostMeta>
            {canEdit && (
              <Link
                to={`/manage/update-post?id=${postInfo.id}`}
                className="post-edit"
              >
                Edit post
              </Link>
            )}
          </div>
        </div>
        <div className="post-content">
          <TableOfContents headings={content.headings}></TableOfContents>
          <div
            ref={contentRef}
            className="entry-content"
            dangerouslySetInnerHTML={{ __html: content.html }}
          ></div>
          {postInfo.status === postStatus.APPROVED && (
            <PostActions post={postInfo}></PostActions>
          )}
          <AuthorBox userId={user?.id}></AuthorBox>
          <CommentSection post={postInfo}></CommentSection>
        </div>
        <PostRelated
          categoryId={postInfo.categories?.[0]?.id}
          postId={postInfo.id}
        ></PostRelated>
      </div>
    </PostDetailStyles>
  );
};

export default PostDetailPage;
