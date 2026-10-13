import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const AuthenticationStyles = styled.div`
  min-height: 100vh;
  padding: 40px;
  .logo {
    margin: 0 auto 20px;
  }
  .heading {
    text-align: center;
    color: ${(props) => props.theme.primary};
    margin-bottom: 40px;
  }
  form {
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
  }
`;

const LayoutAuthentication = ({ children }) => {
  return (
    <AuthenticationStyles>
      <div className="container">
        <Link to="/">
          <img srcSet="/logo.png 2x" alt="Veldora Blog" className="logo" />
        </Link>
        <h1 className="heading">Veldora Blog</h1>
        {children}
      </div>
    </AuthenticationStyles>
  );
};

export default LayoutAuthentication;
