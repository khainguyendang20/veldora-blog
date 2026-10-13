import { Button } from "components/button";
import React from "react";
import styled from "styled-components";
import useDocumentMeta from "hooks/useDocumentMeta";

const NotFoundStyles = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NotFoundPage = () => {
  useDocumentMeta({ title: "Page not found" });
  return (
    <NotFoundStyles>
      <img src="/404.png" alt="" />
      <Button href="/">Back to home</Button>
    </NotFoundStyles>
  );
};

export default NotFoundPage;
