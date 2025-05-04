import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux 스토어에서 auth 상태 조회
  const { isLoggedIn, user } = useAppSelector(state => state.auth);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // 로그아웃 액션 디스패치
    dispatch(logout());
    navigate('/');
  };

  return (
    <HeaderContainer>
      {/* 로고만 있는 헤더 (로그인 전) */}
      {!isLoggedIn && (
        <HeaderWrapper>
          <LogoContainer to="/">
            <LogoIcon>
              <FaUser size={24} color="#A332FF" />
            </LogoIcon>
            <LogoText>HUN:ter</LogoText>
          </LogoContainer>
          <LoginButton onClick={handleLogin}>로그인</LoginButton>
        </HeaderWrapper>
      )}

      {/* 네비게이션 메뉴가 있는 헤더 (로그인 후) */}
      {isLoggedIn && (
        <HeaderWrapper>
          <LogoContainer to="/">
            <LogoIcon>
              <FaUser size={24} color="#A332FF" />
            </LogoIcon>
            <LogoText>HUN:ter</LogoText>
          </LogoContainer>
          
          <NavContainer>
            <NavItem to="/dashboard">둘러보기</NavItem>
            <NavItem to="/sell">판매하기</NavItem>
            <NavItem to="/mypage">나의 거래</NavItem>
            <NavItem to="/chat">채팅</NavItem>
          </NavContainer>
          
          <UserContainer>
            <UserName>{user?.nickname} 님</UserName>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt size={14} />
              <span>로그아웃</span>
            </LogoutButton>
          </UserContainer>
        </HeaderWrapper>
      )}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const HeaderWrapper = styled.div`
  display: flex;
  width: calc(100% - 48px);
  padding: 0 24px;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const LogoText = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 32px;
`;

const NavItem = styled(Link)`
  color: ${({ theme }) => theme.colors.black};
  font-size: ${({ theme }) => theme.typography.T3.fontSize};
  font-weight: ${({ theme }) => theme.typography.T3.fontWeight};
  font-family: ${({ theme }) => theme.typography.T3.fontFamily};
  text-decoration: none;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-size: ${({ theme }) => theme.typography.T3.fontSize};
  font-weight: ${({ theme }) => theme.typography.T3.fontWeight};
  font-family: ${({ theme }) => theme.typography.T3.fontFamily};
`;

const LoginButton = styled.button`
  padding: 8px 24px;
  border-radius: 50px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const LogoutButton = styled.button`
  padding: 8px 24px;
  border-radius: 50px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export default Header;