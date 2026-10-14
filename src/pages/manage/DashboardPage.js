import { PageHeader } from "components/admin";
import { Button } from "components/button";
import { db } from "config/firebase-config";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "store";
import { isStaffRole, postStatus, userRole } from "utils/constants";

const DashboardStyles = styled.div`
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .stat-card {
    display: block;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    transition:
      border-color 0.15s,
      transform 0.15s;
    &:hover {
      border-color: ${(props) => props.theme.primary};
      transform: translateY(-1px);
    }
    &__label {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-muted);
    }
    &__number {
      margin-top: 8px;
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
    }
    &--highlight .stat-card__number {
      color: ${(props) => props.theme.primary};
    }
  }
`;

// Which counts each role sees; Firestore rules only let staff read other
// users' unpublished posts
const statCards = [
  {
    key: "myPosts",
    label: "My posts",
    to: "/manage/post",
    visible: () => true,
  },
  {
    key: "pending",
    label: "Pending review",
    to: "/manage/post?status=pending",
    visible: isStaffRole,
    highlight: true,
  },
  {
    key: "posts",
    label: "All posts",
    to: "/manage/post",
    visible: isStaffRole,
  },
  {
    key: "categories",
    label: "Categories",
    to: "/manage/category",
    visible: isStaffRole,
  },
  {
    key: "users",
    label: "Users",
    to: "/manage/user",
    visible: (role) => role === userRole.ADMIN,
  },
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

  const name = user?.fullname || user?.displayName || "there";
  return (
    <DashboardStyles>
      <PageHeader title="Dashboard" description={`Welcome back, ${name}.`}>
        {isStaffRole(role) && stats.pending > 0 && (
          <Button
            size="md"
            variant="secondary"
            href="/manage/post?status=pending"
          >
            Review {stats.pending} pending
          </Button>
        )}
        <Button size="md" href="/manage/add-post">
          New post
        </Button>
      </PageHeader>
      <div className="stats">
        {statCards
          .filter((card) => card.visible(role))
          .map((card) => (
            <Link
              to={card.to}
              key={card.key}
              className={
                card.highlight && stats[card.key] > 0
                  ? "stat-card stat-card--highlight"
                  : "stat-card"
              }
            >
              <div className="stat-card__label">{card.label}</div>
              <div className="stat-card__number">{stats[card.key] ?? "–"}</div>
            </Link>
          ))}
      </div>
    </DashboardStyles>
  );
};

export default DashboardPage;
