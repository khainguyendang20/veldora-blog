import { db } from "config/firebase-config";
import { collection, orderBy, query, where } from "firebase/firestore";
import useCachedQuery from "hooks/useCachedQuery";
import usePaginatedQuery from "hooks/usePaginatedQuery";
import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { avatarDefault, postStatus } from "utils/constants";
import { Image } from "components/image";
import Heading from "components/layout/Heading";
import FollowButton from "module/follow/FollowButton";
import HomeSection from "module/home/HomeSection";
import PostList from "module/post/PostList";
import { ProfileSkeleton } from "module/post/PostSkeletons";
import useDocumentMeta from "hooks/useDocumentMeta";
import NotFoundPage from "./NotFoundPage";

const ProfilePageStyles = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .profile-cover {
    width: 100%;
    height: 240px;
    background: ${(props) => props.theme.primary};
  }
  .profile-avt {
    transform: translateY(-50%);
    width: 200px;
    height: 200px;
    border-radius: 100rem;
    border: 4px solid var(--color-bg);
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .profile-info {
    margin-top: -100px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0 16px;
    &__name {
      font-size: 24px;
      font-weight: bold;
    }
    &__username {
      color: var(--color-muted);
    }
    &__bio {
      max-width: 560px;
      margin-top: 8px;
      line-height: 1.6;
    }
  }
`;

const ProfilePage = () => {
  const { username } = useParams();
  const { data: users, loading } = useCachedQuery(
    `profile:${username}`,
    () => query(collection(db, "users"), where("username", "==", username)),
    [username]
  );
  const info = users[users.length - 1];
  useDocumentMeta({ title: info?.fullname, description: info?.description });
  // The author's published posts, newest first
  const posts = usePaginatedQuery(
    () =>
      info?.id
        ? query(
            collection(db, "posts"),
            where("status", "==", postStatus.APPROVED),
            where("user.id", "==", info.id),
            orderBy("createdAt", "desc")
          )
        : null,
    [info?.id]
  );

  if (loading) return <ProfileSkeleton></ProfileSkeleton>;
  if (!info) return <NotFoundPage></NotFoundPage>;
  return (
    <>
      <ProfilePageStyles className="container">
        <div className="profile-cover"></div>
        <div className="profile-avt">
          <Image src={info.avatar} fallback={avatarDefault} resizeTo={400} />
        </div>
        <div className="profile-info">
          <div className="profile-info__name">{info.fullname}</div>
          <div className="profile-info__username">@{info.username}</div>
          {info.description && (
            <p className="profile-info__bio">{info.description}</p>
          )}
          <div style={{ marginTop: "12px" }}>
            <FollowButton authorId={info.id}></FollowButton>
          </div>
        </div>
      </ProfilePageStyles>
      <HomeSection>
        <Heading>Posts</Heading>
        <PostList
          posts={posts.data}
          loading={posts.loading}
          error={posts.error}
          hasMore={posts.hasMore}
          loadingMore={posts.loadingMore}
          onLoadMore={posts.loadMore}
          emptyText={`${info.fullname || "This author"} hasn't published anything yet.`}
        ></PostList>
      </HomeSection>
    </>
  );
};

export default ProfilePage;
