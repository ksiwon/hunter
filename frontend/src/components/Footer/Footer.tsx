import React from "react";
import { FooterContainer, FooterLogo, FooterNav, FooterNavItem } from "./Footer.styles";

const Footer = () => {
  return (
    <FooterContainer>
      <FooterLogo>HUN:ter</FooterLogo>
      <FooterNav>
        <FooterNavItem>만든 사람들</FooterNavItem>
        <FooterNavItem>라이센스</FooterNavItem>
        <FooterNavItem>이용 약관</FooterNavItem>
      </FooterNav>
    </FooterContainer>
  );
};

export default Footer;
