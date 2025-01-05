import React from "react";
import {
  HeaderContainer,
  LogoAndNav,
  Logo,
  Nav,
  NavItem,
  AuthSection,
  AuthButton,
  UserSection,
  UserName,
} from "./Header.styles";

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username }) => {
  return (
    <HeaderContainer>
      {/* 로고와 네비게이션 */}
      <LogoAndNav>
        <Logo>HUN:ter</Logo>
        <Nav>
          <NavItem>판매하기</NavItem>
          <NavItem>나의 거래</NavItem>
          <NavItem>채팅</NavItem>
        </Nav>
      </LogoAndNav>

      {/* 인증 섹션 */}
      {isLoggedIn ? (
        <UserSection>
          <UserName>{username} 님</UserName>
          <AuthButton>Log Out</AuthButton>
        </UserSection>
      ) : (
        <AuthSection>
          <AuthButton>
            <span>N</span> Sign Up
          </AuthButton>
          <AuthButton>
            <span>N</span> Login
          </AuthButton>
        </AuthSection>
      )}
    </HeaderContainer>
  );
};

export default Header;
