import { db } from "config/firebase-config";
import { collection, query, where } from "firebase/firestore";
import DOMPurify from "dompurify";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import React, { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import NotFoundPage from "./NotFoundPage";
import { Image } from "components/image";
import { PostDetailSkeleton } from "module/post/PostSkeletons";
import AuthorBox from "module/post/components/AuthorBox";
import PostCategory from "module/post/components/PostCategory";
import PostRelated from "module/post/PostRelated";
import CommentSection from "module/comment/CommentSection";
import PostActions from "module/post/PostActions";
import TableOfContents, {
  hasTableOfContents,
} from "module/post/TableOfContents";
import { highlightCode } from "module/post/highlightCode";
import { addHeadingIds } from "utils/headings";
import { formatDate } from "utils/formatDate";
import { readingTime } from "utils/readingTime";
import { postSummary } from "utils/postSummary";
import { useAuthStore } from "store";
import { avatarDefault, isStaffRole, postStatus } from "utils/constants";
import useDocumentMeta from "hooks/useDocumentMeta";

// The header and cover span the article's full width (1016px). The text
// is a 720px reading column: beside the table-of-contents rail on wide
// screens, or centred when the post is too short to have one.
const PostDetailStyles = styled.div`
  padding: 48px 20px 80px;
  .article {
    max-width: 1016px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "header"
      "cover"
      "toc"
      "body";
  }
  .article__toc,
  .article__body {
    width: 100%;
    max-width: 720px;
    justify-self: center;
  }
  .article__header {
    grid-area: header;
    margin-bottom: 32px;
  }
  .article__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  .article__title {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
  .article__lead {
    max-width: 820px;
    margin-top: 16px;
    font-size: 20px;
    line-height: 1.6;
    color: var(--color-muted);
  }
  .article__byline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 28px;
  }
  .article__author {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    img {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 100rem;
      object-fit: cover;
    }
  }
  .article__edit {
    padding: 8px 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
    font-size: 14px;
    font-weight: 500;
  }
  .article__edit:hover {
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
  .article__author-name {
    font-weight: 600;
  }
  .article__author-meta {
    font-size: 14px;
    color: var(--color-muted);
  }
  .article__cover {
    grid-area: cover;
    margin-bottom: 40px;
    img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      border-radius: 16px;
    }
  }
  .article__toc {
    grid-area: toc;
    margin-bottom: 32px;
  }
  .article__body {
    grid-area: body;
    min-width: 0;
  }
  .article__related {
    max-width: 1016px;
    margin: 64px auto 0;
  }
  /* Wide screens: the table of contents moves into a rail beside the text */
  @media only screen and (min-width: 1200px) {
    .article--with-toc {
      grid-template-columns: minmax(0, 720px) 240px;
      grid-template-areas:
        "header header"
        "cover cover"
        "body toc";
      column-gap: 56px;
    }
    .article--with-toc .article__toc,
    .article--with-toc .article__body {
      justify-self: stretch;
    }
    .article__toc {
      margin-bottom: 0;
    }
    .article__toc > * {
      position: sticky;
      top: calc(${(props) => props.theme.headerHeight} + 24px);
    }
  }
  @media only screen and (max-width: 768px) {
    padding: 28px 16px 64px;
    .article__title {
      font-size: 30px;
    }
    .article__lead {
      font-size: 18px;
    }
    .article__cover img {
      border-radius: 12px;
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
  const withToc = hasTableOfContents(content.headings);
  // Only a hand-written description makes a lead; an excerpt would repeat
  // the opening paragraph
  const lead = (postInfo.desc || "").trim();
  const author = (
    <>
      <Image src={user?.avatar} fallback={avatarDefault} resizeTo={96} />
      <div>
        <div className="article__author-name">
          {user?.fullname || "Unknown author"}
        </div>
        <div className="article__author-meta">
          {formatDate(postInfo.createdAt)} · {readingTime(postInfo.content)} min
          read
        </div>
      </div>
    </>
  );
  return (
    <PostDetailStyles>
      <article
        className={withToc ? "article article--with-toc" : "article"}
      >
        <header className="article__header">
          {postInfo.categories?.length > 0 && (
            <div className="article__categories">
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
          <h1 className="article__title">{postInfo.title}</h1>
          {lead && <p className="article__lead">{lead}</p>}
          <div className="article__byline">
            {user?.username ? (
              <Link
                to={`/profile/${user.username}`}
                className="article__author"
              >
                {author}
              </Link>
            ) : (
              <div className="article__author">{author}</div>
            )}
            {canEdit && (
              <Link
                to={`/manage/update-post?id=${postInfo.id}`}
                className="article__edit"
              >
                Edit post
              </Link>
            )}
          </div>
        </header>
        {postInfo.thumbnail && (
          <figure className="article__cover">
            <Image
              src={postInfo.thumbnail}
              fallback=""
              resizeTo={1600}
              alt=""
            />
          </figure>
        )}
        {withToc && (
          <aside className="article__toc">
            <TableOfContents headings={content.headings}></TableOfContents>
          </aside>
        )}
        <div className="article__body">
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
      </article>
      <div className="article__related">
        <PostRelated
          categoryId={postInfo.categories?.[0]?.id}
          postId={postInfo.id}
        ></PostRelated>
      </div>
    </PostDetailStyles>
  );
};

export default PostDetailPage;
