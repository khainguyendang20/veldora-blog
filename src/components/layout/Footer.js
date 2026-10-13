import React from "react";
import styled from "styled-components";

const FooterStyles = styled.div`
  width: 100%;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 16px 0;
`;

const Footer = () => {
  return (
    <FooterStyles>
      <p>© Copyright {new Date().getFullYear()} Veldora Blog</p>
    </FooterStyles>
  );
};

export default Footer;
