import { useWindowSize } from "@uidotdev/usehooks";
import { db } from "config/firebase-config";
import { collection, limit, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import PostItemLarge from "module/post/PostItemLarge";
import React from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

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
  const { width } = useWindowSize();
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
      {width > 1024 ? (
        <HomeFeatureStyles>
          {posts.map((post) => (
            <PostItemLarge key={post.id} data={post}></PostItemLarge>
          ))}
        </HomeFeatureStyles>
      ) : (
        <Swiper
          style={{ width: "100%" }}
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={width <= 640 ? 1 : 2}
          navigation
          pagination={{ clickable: true }}
          // scrollbar={{ draggable: true }}
          // onSwiper={(swiper) => console.log(swiper)}
          // onSlideChange={() => console.log("slide change")}
        >
          {posts.map((post) => (
            <SwiperSlide key={post.id}>
              <PostItemLarge data={post}></PostItemLarge>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};

export default HomeFeature;
