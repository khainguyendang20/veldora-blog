import { Skeleton, SkeletonGroup } from "components/skeleton";
import React from "react";
import styled from "styled-components";

// Placeholders shaped like the post cards and pages they stand in for, so
// the layout doesn't jump when the data arrives

const SkeletonGridStyles = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns}, minmax(0, 1fr));
  gap: 24px 8px;
  @media only screen and (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media only screen and (max-width: 640px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
`;

const CardStyles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const PostItemSkeleton = () => (
  <CardStyles>
    <Skeleton height="200px" radius="8px" />
    <Skeleton width="30%" height="12px" />
    <Skeleton height="18px" />
    <Skeleton width="70%" height="18px" />
    <Skeleton width="45%" height="12px" />
  </CardStyles>
);

export const PostGridSkeleton = ({ count = 6, columns = 3 }) => (
  <SkeletonGroup label="Loading posts">
    <SkeletonGridStyles $columns={columns}>
      {Array.from({ length: count }, (_, i) => (
        <PostItemSkeleton key={i} />
      ))}
    </SkeletonGridStyles>
  </SkeletonGroup>
);

const HomeSkeletonStyles = styled.div`
  .home-skeleton__feature {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2px;
  }
  .home-skeleton__section {
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 0;
  }
  @media only screen and (max-width: 1024px) {
    .home-skeleton__feature {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media only screen and (max-width: 640px) {
    .home-skeleton__feature {
      grid-template-columns: minmax(0, 1fr);
    }
    .home-skeleton__section {
      padding: 40px 10px;
    }
  }
`;

export const HomeSkeleton = () => (
  <SkeletonGroup label="Loading posts">
    <HomeSkeletonStyles>
      <div className="home-skeleton__feature">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} height="420px" radius="0" />
        ))}
      </div>
      <div className="home-skeleton__section">
        <Skeleton
          width="180px"
          height="24px"
          style={{ marginBottom: "24px" }}
        />
        <SkeletonGridStyles $columns={4}>
          {Array.from({ length: 4 }, (_, i) => (
            <PostItemSkeleton key={i} />
          ))}
        </SkeletonGridStyles>
      </div>
    </HomeSkeletonStyles>
  </SkeletonGroup>
);

// Mirrors the post page: header, byline and cover in a 720px column
const DetailSkeletonStyles = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  .detail-skeleton__byline {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 28px 0 32px;
  }
  .detail-skeleton__body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 40px;
  }
`;

export const PostDetailSkeleton = () => (
  <SkeletonGroup label="Loading post">
    <DetailSkeletonStyles>
      <Skeleton width="90px" height="22px" />
      <Skeleton height="40px" style={{ marginTop: "16px" }} />
      <Skeleton width="65%" height="40px" style={{ marginTop: "10px" }} />
      <div className="detail-skeleton__byline">
        <Skeleton width="44px" height="44px" radius="100rem" />
        <div style={{ flex: 1 }}>
          <Skeleton width="160px" height="14px" />
          <Skeleton width="120px" height="12px" style={{ marginTop: "8px" }} />
        </div>
      </div>
      <Skeleton height="auto" radius="16px" style={{ aspectRatio: "16 / 9" }} />
      <div className="detail-skeleton__body">
        {[100, 96, 100, 88, 100, 72].map((width, i) => (
          <Skeleton key={i} width={`${width}%`} height="16px" />
        ))}
      </div>
    </DetailSkeletonStyles>
  </SkeletonGroup>
);

const ProfileSkeletonStyles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  .profile-skeleton__avatar {
    margin-top: -100px;
    border: 4px solid var(--color-bg);
    border-radius: 100rem;
  }
`;

export const ProfileSkeleton = () => (
  <SkeletonGroup label="Loading profile">
    <ProfileSkeletonStyles>
      <Skeleton height="240px" radius="0" />
      <div className="profile-skeleton__avatar">
        <Skeleton width="200px" height="200px" radius="100rem" />
      </div>
      <Skeleton width="200px" height="24px" style={{ marginTop: "16px" }} />
      <Skeleton width="140px" height="16px" style={{ marginTop: "10px" }} />
    </ProfileSkeletonStyles>
  </SkeletonGroup>
);
