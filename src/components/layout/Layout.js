import React, { Suspense } from "react";
import Header from "./Header";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

// The page fills at least the viewport and the main area takes the spare
// height, so the footer stays at the bottom on short pages
const LayoutStyles = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  .home-main {
    flex: 1;
    margin-top: ${(props) => props.theme.headerHeight};
  }
`;

const Layout = ({ children }) => {
  return (
    <LayoutStyles>
      <Header></Header>
      <main className="home-main">
        {children}
        <Suspense fallback={null}>
          <Outlet></Outlet>
        </Suspense>
      </main>
      <Footer></Footer>
    </LayoutStyles>
  );
};

export default Layout;
