import { db } from "config/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { avatarDefault } from "utils/constants";

const ProfilePageStyles = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .profile-cover {
    width: 100%;
    height: 240px;
    background: ${(props) => props.theme.primary};
  }
  .profile-avt {
    transform: translateY(-50%);
    width: 200px;
    height: 200px;
    border-radius: 100rem;
    border: 4px solid ${(props) => props.theme.grayLight};
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .profile-info {
    margin-top: -100px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    &__name {
      font-size: 24px;
      font-weight: bold;
    }
    &__username {
      color: ${(props) => props.theme.grayDark};
    }
    &__item {
      display: flex;
      align-items: center;
      gap: 4px;
      span svg {
        width: 24px;
        height: 24px;
      }
    }
  }
`;

const ProfilePage = () => {
  const { username } = useParams();
  const [info, setInfo] = useState({});
  // const [posts, setPosts] = useState();
  useEffect(() => {
    onSnapshot(
      query(collection(db, "users"), where("username", "==", username)),
      (snapShot) => snapShot.forEach((doc) => setInfo(doc.data()))
    );
    // onSnapshot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);
  return (
    <ProfilePageStyles className="container">
      <div className="profile-cover"></div>
      <div className="profile-avt">
        <img src={info.avatar || avatarDefault} alt="" />
      </div>
      <div className="profile-info">
        <div className="profile-info__name">{info?.fullname}</div>
        <div className="profile-info__username">@{info?.username}</div>
        {/* <div className="profile-info__item">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={32}
              height={32}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5l-8-5h16zm0 12H4V8l8 5l8-5v10z"
              />
            </svg>
          </span>
          <p>{info.email}</p>
        </div>
        <div className="profile-info__item">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={32}
              height={32}
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M224 48h-64a40 40 0 0 0-32 16a40 40 0 0 0-32-16H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h64a24 24 0 0 1 24 24a8 8 0 0 0 16 0a24 24 0 0 1 24-24h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16ZM96 192H32V64h64a24 24 0 0 1 24 24v112a39.81 39.81 0 0 0-24-8Zm128 0h-64a39.81 39.81 0 0 0-24 8V88a24 24 0 0 1 24-24h64ZM160 88h40a8 8 0 0 1 0 16h-40a8 8 0 0 1 0-16Zm48 40a8 8 0 0 1-8 8h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8Zm0 32a8 8 0 0 1-8 8h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8Z"
              />
            </svg>
          </span>
          <p>52 posts</p>
        </div> */}
      </div>
    </ProfilePageStyles>
  );
};

export default ProfilePage;
