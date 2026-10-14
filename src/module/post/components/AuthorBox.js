import { db } from "config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image } from "components/image";
import { avatarDefault } from "utils/constants";
import FollowButton from "module/follow/FollowButton";
import { Link } from "react-router-dom";
import styled from "styled-components";

const AuthorBoxStyles = styled.section`
  display: flex;
  gap: 16px;
  margin: 40px 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  .author-image img {
    width: 64px;
    height: 64px;
    border-radius: 100rem;
    object-fit: cover;
  }
  .author-content {
    flex: 1;
    min-width: 0;
  }
  .author-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  .author-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .author-name {
    font-size: 18px;
    font-weight: 700;
  }
  .author-desc {
    margin-top: 6px;
    color: var(--color-muted);
    line-height: 1.6;
  }
`;

const AuthorBox = ({ userId = "" }) => {
  const [user, setUser] = useState({});
  useEffect(() => {
    if (!userId) return;
    async function fetchUserData() {
      const docRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.data()) {
        setUser(docSnapshot.data());
      }
    }
    fetchUserData();
  }, [userId]);
  if (!userId || !user.username) return null;
  return (
    <AuthorBoxStyles className="author" aria-label="About the author">
      <Link to={`/profile/${user.username}`} className="author-image">
        <Image src={user?.avatar} fallback={avatarDefault} resizeTo={128} />
      </Link>
      <div className="author-content">
        <p className="author-label">Written by</p>
        <div className="author-heading">
          <Link to={`/profile/${user.username}`} className="author-name">
            {user?.fullname}
          </Link>
          <FollowButton authorId={userId}></FollowButton>
        </div>
        {user?.description && <p className="author-desc">{user.description}</p>}
      </div>
    </AuthorBoxStyles>
  );
};

export default AuthorBox;
