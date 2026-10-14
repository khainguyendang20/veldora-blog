import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "store";
import { isStaffRole, postStatus, userRole } from "utils/constants";

const DashboardStyles = styled.div`
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  .stat-card {
    background: var(--color-surface);
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
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
  .welcome {
    margin-bottom: 20px;
    p {
      color: var(--color-muted);
      margin-top: 8px;
    }
  }
`;

// Which counts each role sees; Firestore rules only let staff read other
// users' unpublished posts
const statCards = [
  { key: "myPosts", label: "My Posts", visible: () => true },
  { key: "pending", label: "Pending review", visible: isStaffRole },
  { key: "posts", label: "Total Posts", visible: isStaffRole },
  { key: "categories", label: "Categories", visible: isStaffRole },
  { key: "users", label: "Users", visible: (role) => role === userRole.ADMIN },
];

const DashboardPage = () => {
  const { user } = useAuthStore((state) => state);
  const uid = user?.uid;
  const role = user?.role;
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const postsRef = collection(db, "posts");
    const queries = {
      myPosts: query(postsRef, where("user.id", "==", uid)),
      pending: query(postsRef, where("status", "==", postStatus.PENDING)),
      posts: postsRef,
      categories: collection(db, "categories"),
      users: collection(db, "users"),
    };
    // Count aggregations cost one read per 1000 documents, where a
    // listener on the whole collection read every document
    const visible = statCards.filter((card) => card.visible(role));
    Promise.all(
      visible.map(async ({ key }) => {
        const snapshot = await getCountFromServer(queries[key]);
        return [key, snapshot.data().count];
      })
    )
      .then((counts) => {
        if (!cancelled) setStats(Object.fromEntries(counts));
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [uid, role]);

  return (
    <DashboardStyles>
      <div className="welcome">
        <Heading>Dashboard</Heading>
        <p>Welcome back, {user?.fullname || user?.displayName || "User"}!</p>
      </div>
      <div className="stats">
        {statCards
          .filter((card) => card.visible(role))
          .map((card) => (
            <div className="stat-card" key={card.key}>
              <div className="stat-card__number">{stats[card.key] ?? "–"}</div>
              <div className="stat-card__label">{card.label}</div>
            </div>
          ))}
      </div>
    </DashboardStyles>
  );
};

export default DashboardPage;
