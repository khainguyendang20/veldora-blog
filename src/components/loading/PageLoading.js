import React from "react";
import styled from "styled-components";
import { theme } from "utils/constants";
import LoadingSpinner from "./LoadingSpinner";

const PageLoadingStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

// Full-width spinner for pages waiting on their first Firestore snapshot
const PageLoading = () => {
  return (
    <PageLoadingStyles>
      <LoadingSpinner size="48px" color={theme.primary}></LoadingSpinner>
    </PageLoadingStyles>
  );
};

export default PageLoading;
