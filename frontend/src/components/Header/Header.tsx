import React, { useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { isLoggedIn, username, loginWithKakao, logout } = useUser();

    const handleHome = () => navigate("/");
    const handleSellNavigation = () => navigate("/sell");
    const handleContentNavigation = () => navigate("/content/all");
    const handleMyDealClick = () => navigate("/mydeal");

    return (
        <HeaderContainer>
            <LogoAndNav>
                <Logo onClick={handleHome}>HUN:ter</Logo>
                <Nav>
                    <NavItem onClick={handleContentNavigation}>둘러보기</NavItem>
                    <NavItem onClick={handleSellNavigation}>판매하기</NavItem>
                    <NavItem onClick={handleMyDealClick}>나의 거래</NavItem>
                </Nav>
            </LogoAndNav>
            {isLoggedIn ? (
                <UserSection>
                    <UserName>{username} 님</UserName>
                    <AuthButton onClick={logout}>Log Out</AuthButton>
                </UserSection>
            ) : (
                <AuthSection>
                    <AuthButton onClick={loginWithKakao}>
                        <LogoFrame />
                        Login
                    </AuthButton>
                </AuthSection>
            )}
        </HeaderContainer>
    );
};

export default Header;
