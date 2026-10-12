import { useMediaQuery } from "@uidotdev/usehooks";
import { db } from "config/firebase-config";
import { collection, limit, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import PostItemLarge from "module/post/PostItemLarge";
import React, { lazy, Suspense } from "react";
import styled from "styled-components";

const FeatureCarousel = lazy(() => import("./FeatureCarousel"));

const HomeFeatureStyles = styled.div`
  @media only screen and (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 2px;

  .post-large {
    width: unset;
    .post-thumb {
      height: 570px;
    }
  }
`;

const HomeFeature = () => {
  // Re-renders only when a breakpoint is crossed, not on every resize
  const isDesktop = useMediaQuery("only screen and (min-width: 1025px)");
  const isPhone = useMediaQuery("only screen and (max-width: 640px)");
  const { data: posts } = useFirestoreQuery(
    () =>
      query(
        collection(db, "posts"),
        where("status", "==", 1),
        where("featured", "==", true),
        limit(4)
      ),
    []
  );
  if (posts.length <= 0) return;
  return (
    <>
      {isDesktop ? (
        <HomeFeatureStyles>
          {posts.map((post) => (
            <PostItemLarge key={post.id} data={post}></PostItemLarge>
          ))}
        </HomeFeatureStyles>
      ) : (
        <Suspense fallback={null}>
          <FeatureCarousel
            posts={posts}
            slidesPerView={isPhone ? 1 : 2}
          ></FeatureCarousel>
        </Suspense>
      )}
    </>
  );
};

export default HomeFeature;
