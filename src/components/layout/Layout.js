import React, { Suspense } from "react";
import Header from "./Header";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const HomeMainStyles = styled.div`
  margin-top: ${(props) => props.theme.headerHeight};
`;

const Layout = ({ children }) => {
  return (
    <>
      <Header></Header>
      <HomeMainStyles className="home-main">
        {children}
        <Suspense fallback={null}>
          <Outlet></Outlet>
        </Suspense>
      </HomeMainStyles>
      <Footer></Footer>
    </>
  );
};

export default Layout;
