import PostItemLarge from "module/post/PostItemLarge";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation, Pagination } from "swiper/modules";

// Loaded lazily by HomeFeature so desktop visitors never download Swiper.
const FeatureCarousel = ({ posts, slidesPerView }) => {
  return (
    <Swiper
      style={{ width: "100%" }}
      modules={[Navigation, Pagination, A11y]}
      slidesPerView={slidesPerView}
      navigation
      pagination={{ clickable: true }}
    >
      {posts.map((post) => (
        <SwiperSlide key={post.id}>
          <PostItemLarge data={post}></PostItemLarge>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default FeatureCarousel;
