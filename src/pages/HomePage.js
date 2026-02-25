import React from "react";
import { db } from "config/firebase-config";
import Heading from "components/layout/Heading";
import PostItem from "module/post/PostItem";
import PostsByCategory from "module/home/PostsByCategory";
import HomeSection from "module/home/HomeSection";
import HomeFeature from "module/home/HomeFeature";
import styled from "styled-components";
import { useState } from "react";
import { useEffect } from "react";
import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

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

const postsPerPage = 9;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const colRef = collection(db, "posts");
    const q = query(
      colRef,
      where("status", "==", 1),
      limit(postsPerPage)
      // orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      let result = [];
      snapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPosts(result);
    });
  }, []);
  if (posts.length <= 0) return;
  return (
    <>
      <HomeFeature></HomeFeature>
      <HomeSection>
        <Heading>Random Posts</Heading>
        <RandomPostsStyles>
          {posts.slice(0, 4).map((post) => (
            <PostItem data={post} key={post.id}></PostItem>
          ))}
        </RandomPostsStyles>
      </HomeSection>
      <div
        style={{
          width: "100%",
          backgroundColor: "#fef7e3",
        }}
      >
        <HomeSection>
          <Heading>Công nghệ</Heading>
          <PostsByCategory></PostsByCategory>
        </HomeSection>
      </div>
      <HomeSection>
        <HomeMainStyles>
          <div className="home__main">
            <Heading>Recent Posts</Heading>
            <div className="home__recent-posts">
              {posts.map((post) => (
                <PostItem data={post} key={post.id}></PostItem>
              ))}
            </div>
          </div>
          <div className="home__sidebar">
            <div>
              <Heading>Fanpage</Heading>
              <iframe
                title="My fanpage"
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FAnhbia247&tabs=timeline&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                style={{ border: "none", overflow: "hidden" }}
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </div>
        </HomeMainStyles>
      </HomeSection>
    </>
  );
};

export default HomePage;
