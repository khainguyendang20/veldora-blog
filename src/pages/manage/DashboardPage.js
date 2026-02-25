import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";

const DashboardStyles = styled.div`
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    text-align: center;
    &__number {
      font-size: 36px;
      font-weight: 700;
      color: ${(props) => props.theme.primary};
      margin-bottom: 8px;
    }
    &__label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
  .welcome {
    margin-bottom: 20px;
    p {
      color: #666;
      margin-top: 8px;
    }
  }
`;

const DashboardPage = () => {
  const { user } = useAuthStore((state) => state);
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    users: 0,
    myPosts: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Get posts count
    const postsRef = collection(db, "posts");
    const unsubscribePosts = onSnapshot(postsRef, (snapshot) => {
      setStats((prev) => ({ ...prev, posts: snapshot.size }));
    });

    // Get user's posts count
    const myPostsRef = query(postsRef, where("user.id", "==", user.uid));
    const unsubscribeMyPosts = onSnapshot(myPostsRef, (snapshot) => {
      setStats((prev) => ({ ...prev, myPosts: snapshot.size }));
    });

    // Get categories count
    const categoriesRef = collection(db, "categories");
    const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
      setStats((prev) => ({ ...prev, categories: snapshot.size }));
    });

    // Get users count (Admin only)
    if (user.role === userRole.ADMIN) {
      const usersRef = collection(db, "users");
      const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        setStats((prev) => ({ ...prev, users: snapshot.size }));
      });
      return () => {
        unsubscribePosts();
        unsubscribeMyPosts();
        unsubscribeCategories();
        unsubscribeUsers();
      };
    }

    return () => {
      unsubscribePosts();
      unsubscribeMyPosts();
      unsubscribeCategories();
    };
  }, [user]);

  return (
    <DashboardStyles>
      <div className="welcome">
        <Heading>Dashboard</Heading>
        <p>Welcome back, {user?.fullname || user?.displayName || "User"}!</p>
      </div>
      <div className="stats">
        <div className="stat-card">
          <div className="stat-card__number">{stats.myPosts}</div>
          <div className="stat-card__label">My Posts</div>
        </div>
        {(user?.role === userRole.ADMIN || user?.role === userRole.MOD) && (
          <>
            <div className="stat-card">
              <div className="stat-card__number">{stats.posts}</div>
              <div className="stat-card__label">Total Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__number">{stats.categories}</div>
              <div className="stat-card__label">Categories</div>
            </div>
          </>
        )}
        {user?.role === userRole.ADMIN && (
          <div className="stat-card">
            <div className="stat-card__number">{stats.users}</div>
            <div className="stat-card__label">Users</div>
          </div>
        )}
      </div>
    </DashboardStyles>
  );
};

export default DashboardPage;
