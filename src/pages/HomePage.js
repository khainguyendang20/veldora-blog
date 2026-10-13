import React, { useMemo } from "react";
import { db } from "config/firebase-config";
import Heading from "components/layout/Heading";
import PostItem from "module/post/PostItem";
import PostsByCategory from "module/home/PostsByCategory";
import HomeSection from "module/home/HomeSection";
import HomeFeature from "module/home/HomeFeature";
import CategoryList from "module/home/CategoryList";
import styled from "styled-components";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import shuffle from "lodash/shuffle";
import { PageLoading } from "components/loading";
import useCachedQuery from "hooks/useCachedQuery";
import { homeCategory, postStatus } from "utils/constants";
import useDocumentMeta from "hooks/useDocumentMeta";

const RandomPostsStyles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  @media only screen and (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const HomeMainStyles = styled.div`
  display: flex;
  gap: 16px;
  .home__main {
    flex: 1;
    .home__recent-posts {
      gap: 8px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  .home__sidebar {
    width: 240px;
  }
  @media only screen and (max-width: 1024px) {
    flex-direction: column;
    .home__main {
      flex: 1;
      .home__recent-posts {
        gap: 24px 8px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }
  @media only screen and (max-width: 640px) {
    flex-direction: column;
    .home__main {
      flex: 1;
      .home__recent-posts {
        gap: 24px 8px;
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
    }
  }
`;

const recentCount = 9;
const randomCount = 4;
// Recent posts take the newest; random ones are drawn from the rest of the
// pool, so the two sections never show the same post
const poolSize = 24;

const HomePage = () => {
  useDocumentMeta();
  const {
    data: posts,
    loading,
    error,
  } = useCachedQuery(
    "home:posts",
    () =>
      query(
        collection(db, "posts"),
        where("status", "==", postStatus.APPROVED),
        orderBy("createdAt", "desc"),
        limit(poolSize)
      ),
    []
  );
  const recentPosts = posts.slice(0, recentCount);
  const randomPosts = useMemo(
    () => shuffle(posts.slice(recentCount)).slice(0, randomCount),
    [posts]
  );
  if (loading) return <PageLoading></PageLoading>;
  if (error) {
    return (
      <HomeSection>
        <Heading>Could not load posts</Heading>
        <p>Please try again in a moment.</p>
      </HomeSection>
    );
  }
  if (!posts.length) {
    return (
      <HomeSection>
        <Heading>No posts yet</Heading>
        <p>Check back soon for new articles.</p>
      </HomeSection>
    );
  }
  return (
    <>
      <HomeFeature></HomeFeature>
      {randomPosts.length > 0 && (
        <HomeSection>
          <Heading>Random Posts</Heading>
          <RandomPostsStyles>
            {randomPosts.map((post) => (
              <PostItem data={post} key={post.id}></PostItem>
            ))}
          </RandomPostsStyles>
        </HomeSection>
      )}
      <div
        style={{
          width: "100%",
          backgroundColor: "#fef7e3",
        }}
      >
        <HomeSection>
          <Heading>Công nghệ</Heading>
          <PostsByCategory
            categoryId={homeCategory.TECHNOLOGY}
          ></PostsByCategory>
        </HomeSection>
      </div>
      <HomeSection>
        <HomeMainStyles>
          <div className="home__main">
            <Heading>Recent Posts</Heading>
            <div className="home__recent-posts">
              {recentPosts.map((post) => (
                <PostItem data={post} key={post.id}></PostItem>
              ))}
            </div>
          </div>
          <div className="home__sidebar">
            <CategoryList></CategoryList>
          </div>
        </HomeMainStyles>
      </HomeSection>
    </>
  );
};

export default HomePage;
