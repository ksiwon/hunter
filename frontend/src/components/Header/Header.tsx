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
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  isLoggedIn?: boolean;
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username }) => {
  // 네이버 로그인 핸들러
  const handleNaverLogin = () => {
    window.location.href = "http://localhost:5001/auth/naver";
  };

  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/"); // Home 페이지로 이동
  }

  const handleSellNavigation = () => {
    navigate("/sell"); // Sell 페이지로 이동
  };

  const handleContentNavigation = () => {
    navigate("/content/all"); // Content 페이지로 이동
  }

  return (
    <HeaderContainer>
      {/* 로고와 네비게이션 */}
      <LogoAndNav>
        <Logo onClick={handleHome}>HUN:ter</Logo>
        <Nav>
          <NavItem onClick={handleContentNavigation}>둘러보기</NavItem>
          <NavItem onClick={handleSellNavigation}>판매하기</NavItem>
          <NavItem>나의 거래</NavItem>
        </Nav>
      </LogoAndNav>

      {/* 인증 섹션 */}
      {isLoggedIn ? (
        <UserSection>
          <UserName>{username} 님</UserName>
            <AuthButton
            onClick={() => {
              isLoggedIn = false;
              window.location.href = "http://localhost:3000";
            }}
            >
            Log Out
            </AuthButton>
        </UserSection>
      ) : (
        <AuthSection>
          <AuthButton>
            <span>N</span> Sign Up
          </AuthButton>
          <AuthButton onClick={handleNaverLogin}>
            <span>N</span> Login
          </AuthButton>
        </AuthSection>
      )}
    </HeaderContainer>
  );
};

export default Header;
