import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FaUser, FaInfoCircle, FaFileAlt, FaShieldAlt, FaSync } from 'react-icons/fa';
import axios from 'axios';

const Footer: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<{
    isLoading: boolean;
    result: any | null;
    error: string | null;
  }>({
    isLoading: false,
    result: null,
    error: null
  });

  // API URL 설정
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  // 마이그레이션 API 호출 함수
  const handleMigration = async () => {
    // 관리자 확인 (선택적)
    if (!window.confirm('Everytime 데이터를 Hunt로 마이그레이션 하시겠습니까?')) {
      return;
    }

    try {
      setMigrationStatus({
        isLoading: true,
        result: null,
        error: null
      });

      // 마이그레이션 API 호출
      const response = await axios.post(`${API_URL}/migrate/everytime-to-hunt?limit=50`);
      
      // 성공 결과 저장
      setMigrationStatus({
        isLoading: false,
        result: response.data,
        error: null
      });

      // 성공 알림
      alert(`마이그레이션 완료: ${response.data.results.success}/${response.data.results.total} 성공`);
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      
      // 오류 처리
      let errorMessage = '마이그레이션 중 오류가 발생했습니다.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setMigrationStatus({
        isLoading: false,
        result: null,
        error: errorMessage
      });
      
      // 오류 알림
      alert(`마이그레이션 오류: ${errorMessage}`);
    }
  };

  // 마이그레이션 상태 확인 함수
  const checkMigrationStatus = async () => {
    try {
      setMigrationStatus({
        ...migrationStatus,
        isLoading: true
      });

      // 상태 확인 API 호출
      const response = await axios.get(`${API_URL}/migration/status`);
      
      // 상태 결과 저장
      setMigrationStatus({
        isLoading: false,
        result: response.data,
        error: null
      });

      // 상태 알림
      alert(
        `마이그레이션 상태:\n` +
        `- 전체 Everytime 게시글: ${response.data.totalEverytime}개\n` +
        `- 마이그레이션 완료: ${response.data.migratedCount}개\n` +
        `- 남은 게시글: ${response.data.remaining}개\n` +
        `- 진행률: ${response.data.percentComplete}`
      );
    } catch (error) {
      console.error('마이그레이션 상태 확인 오류:', error);
      
      // 오류 처리
      let errorMessage = '마이그레이션 상태 확인 중 오류가 발생했습니다.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setMigrationStatus({
        isLoading: false,
        result: null,
        error: errorMessage
      });
      
      // 오류 알림
      alert(`오류: ${errorMessage}`);
    }
  };

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
          <Copyright onClick={handleMigration}>
            © {new Date().getFullYear()} HUN:ter. All rights reserved.
          </Copyright>
          <MigrationControls>
            <MigrationButton 
              title="Everytime → Hunt 마이그레이션" 
              onClick={handleMigration}
              disabled={migrationStatus.isLoading}
            >
              {migrationStatus.isLoading ? (
                <RotatingIcon>
                  <FaSync size={14} />
                </RotatingIcon>
              ) : (
                <FaSync size={14} />
              )}
              {migrationStatus.isLoading ? '진행 중...' : '마이그레이션'}
            </MigrationButton>
            <MigrationButton 
              title="마이그레이션 상태 확인" 
              onClick={checkMigrationStatus}
              disabled={migrationStatus.isLoading}
            >
              상태 확인
            </MigrationButton>
          </MigrationControls>
        </FooterRight>
      </FooterContent>
    </FooterContainer>
  );
};

// 아이콘 회전 애니메이션
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const RotatingIcon = styled.span`
  display: inline-block;
  animation: ${rotate} 1.5s linear infinite;
`;

const FooterContainer = styled.footer`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  padding: 0;
  margin-top: 60px;
`;

const FooterContent = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px;
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
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  font-family: ${({ theme }) => theme.typography.T7.fontFamily};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const MigrationControls = styled.div`
  display: none; /* 기본적으로 숨김 */
  gap: 8px;
  
  ${Copyright}:hover + & {
    display: flex; /* Copyright에 호버했을 때 표시 */
  }
  
  &:hover {
    display: flex; /* 직접 호버했을 때도 유지 */
  }
`;

const MigrationButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme, disabled }) => 
      disabled ? theme.colors.primary : theme.colors.purple[300]};
  }
`;

export default Footer;