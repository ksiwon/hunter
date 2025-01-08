import React from "react";
import {
  FooterContainer,
  FooterLogo,
  FooterNav,
  FooterNavItem,
} from "./Footer.styles";
import { useMerchandise } from "../../context/MerchandiseContext";

const Footer = () => {
  const { resetMerchandises } = useMerchandise();

  const handleGithub = () => {
    window.open("https://github.com/ksiwon/hunter", "_blank");
  };

  const handleDeveloper = () => {
    alert("KAIST 전산학부 박정원\nSMMU 인공지능공학부 최인하");
  };

  return (
    <FooterContainer>
      <FooterLogo>HUN:ter</FooterLogo>
      <FooterNav>
        <FooterNavItem onClick={handleDeveloper}>만든 사람들</FooterNavItem>
        <FooterNavItem onClick={handleGithub}>GitHub</FooterNavItem>
        <FooterNavItem onClick={resetMerchandises}>데이터 리셋</FooterNavItem>
      </FooterNav>
    </FooterContainer>
  );
};

export default Footer;
