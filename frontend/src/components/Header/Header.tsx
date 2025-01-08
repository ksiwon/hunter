import React, { useState, createContext, useContext } from "react";
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
  LogoFrame,
} from "./Header.styles";
import { useNavigate, useLocation } from "react-router-dom";

// 로그인 상태 관리를 위한 Context 생성
const AuthContext = createContext<{
  isLoggedIn: boolean;
  username?: string;
  login: (username: string) => void;
  logout: () => void;
}>({
  isLoggedIn: false,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);


const Header: React.FC = () => {

  function loginWithKakao() {
    const REDIRECT_URI = `${process.env.REACT_APP_KAKAO_REDIRECT_URL}`

    const CLIENT_ID = `${process.env.REACT_APP_RESTAPI_KAKAO_APP_KEY}`
    const KAKAO_AUTH_URL = `https:kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL
  }

  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/"); // Home 페이지로 이동
  };

  const handleSellNavigation = () => {
    navigate("/sell"); // Sell 페이지로 이동
  };

  const handleContentNavigation = () => {
    navigate("/content/all"); // Content 페이지로 이동
  };

  const handleMyDealClick = () => {
    navigate("/mydeal"); // My Deal 페이지로 이동
  };

  return (
    <HeaderContainer>
      {/* 로고와 네비게이션 */}
      <LogoAndNav>
        <Logo onClick={handleHome}>HUN:ter</Logo>
        <Nav>
          <NavItem onClick={handleContentNavigation}>둘러보기</NavItem>
          <NavItem onClick={handleSellNavigation}>판매하기</NavItem>
          <NavItem onClick={handleMyDealClick}>나의 거래</NavItem>
        </Nav>
      </LogoAndNav>

      {/* 인증 섹션 */}
      {isLoggedIn ? (
        <UserSection>
          <UserName>{username} 님</UserName>

          <AuthButton
            onClick={() => {
              logout();
              window.location.href = "http://localhost:3000";
            }}
          >
            Log Out
          </AuthButton>

        </UserSection>
      ) : (
        <AuthSection>
          <AuthButton>
            <LogoFrame />
            Sign Up
          </AuthButton>

          <AuthButton onClick={loginWithKakao}>
            <LogoFrame />
            Login
          </AuthButton>
        </AuthSection>
      )}
    </HeaderContainer>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | undefined>();

  const login = (username: string) => {
    setIsLoggedIn(true);
    setUsername(username);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(undefined);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default Header;
