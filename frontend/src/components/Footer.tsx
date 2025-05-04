import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaUser, FaInfoCircle, FaFileAlt, FaShieldAlt } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterLeft>
          <LogoContainer to="/">
            <LogoIcon>
              <FaUser size={20} color="#A332FF" />
            </LogoIcon>
            <LogoText>HUN:ter</LogoText>
          </LogoContainer>
        </FooterLeft>
        
        <FooterCenter>
          <FooterNav>
            <FooterNavItem to="/about">
              <FaInfoCircle size={14} />
              <span>만든 사람들</span>
            </FooterNavItem>
            <FooterNavItem to="/terms">
              <FaFileAlt size={14} />
              <span>이용약관</span>
            </FooterNavItem>
            <FooterNavItem to="/privacy">
              <FaShieldAlt size={14} />
              <span>개인정보처리방침</span>
            </FooterNavItem>
          </FooterNav>
        </FooterCenter>
        
        <FooterRight>
          <Copyright>
            © {new Date().getFullYear()} HUN:ter. All rights reserved.
          </Copyright>
        </FooterRight>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  padding: 0;
  margin-top: 60px;
`;

const FooterContent = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const LogoText = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
`;

const FooterCenter = styled.div`
  display: flex;
`;

const FooterNav = styled.nav`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
`;

const FooterNavItem = styled(Link)`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  font-family: ${({ theme }) => theme.typography.T7.fontFamily};
`;

export default Footer;