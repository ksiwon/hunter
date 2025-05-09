import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FaUser, FaInfoCircle, FaFileAlt, FaShieldAlt, FaSync, FaRobot } from 'react-icons/fa';
import axios from 'axios';

// 마이그레이션 결과 타입 정의
interface MigrationResult {
  success: boolean;
  message: string;
  totalEverytime?: number;
  migratedCount?: number;
  remaining?: number;
  percentComplete?: string;
  stats: {
    totalEverytime: number;
    migratedCount: number;
    remaining: number;
    percentComplete: string;
    aiAnalysis?: {
      success: number;
      failed: number;
      webPriceFound?: number;
    }
  };
  results: {
    total: number;
    totalRemaining: number;
    success: number;
    failed: number;
    aiAnalyzed: number;
    aiFailedAnalysis: number;
    webSearchCount?: number;
    failedItems: Array<{
      id: string;
      title: string;
      reason: string;
      details?: string;
    }>;
  };
}

interface MigrationStatus {
  isLoading: boolean;
  result: MigrationResult | null;
  error: string | null;
}

interface SyncStatus {
  isLoading: boolean;
  result: {
    success: boolean;
    message: string;
    stats?: {
      scraped: number;
      newlyAdded: number;
      logs: string[];
    };
  } | null;
  error: string | null;
}

const Footer: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    isLoading: false,
    result: null,
    error: null
  });

  // 마이그레이션 컨트롤 표시 상태 추가
  const [showMigrationControls, setShowMigrationControls] = useState<boolean>(false);
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    result: null,
    error: null
  });

  // API URL 설정
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  const handleEverytimeSync = async () => {
    if (syncStatus.isLoading) return;
    
    if (!window.confirm('에브리타임 게시글을 크롤링하여 데이터베이스에 동기화하시겠습니까?')) {
      return;
    }
    
    try {
      setSyncStatus({
        isLoading: true,
        result: null,
        error: null
      });
      
      // 동기화 API 호출
      const response = await axios.post(`${API_URL}/sync/everytime`);
      
      setSyncStatus({
        isLoading: false,
        result: response.data,
        error: null
      });
      
      // 성공 알림
      const scraped = response.data.stats?.scraped || 0;
      const newlyAdded = response.data.stats?.newlyAdded || 0;
      
      alert(
        `에브리타임 동기화 완료:\n` +
        `- 스크래핑된 게시글: ${scraped}개\n` +
        `- 새로 추가된 게시글: ${newlyAdded}개`
      );
      
      // 새로고침 제안
      if (newlyAdded > 0 && window.confirm('새 게시글이 추가되었습니다. 페이지를 새로고침할까요?')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('에브리타임 동기화 오류:', error);
      
      let errorMessage = '동기화 중 오류가 발생했습니다.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setSyncStatus({
        isLoading: false,
        result: null,
        error: errorMessage
      });
      
      alert(`동기화 오류: ${errorMessage}`);
    }
  };

  // 마이그레이션 API 호출 함수
  const handleMigration = async () => {
    // 이미 로딩 중인 경우 중복 실행 방지
    if (migrationStatus.isLoading) return;
    
    // 관리자 확인 (선택적)
    if (!window.confirm('Everytime 데이터를 Hunt로 마이그레이션 하시겠습니까? AI 분석이 포함됩니다.')) {
      return;
    }

    try {
      setMigrationStatus({
        isLoading: true,
        result: null,
        error: null
      });

      // 마이그레이션 API 호출
      const response = await axios.post<MigrationResult>(`${API_URL}/migrate/everytime-to-hunt?limit=50`);
      
      // 성공 결과 저장
      setMigrationStatus({
        isLoading: false,
        result: response.data,
        error: null
      });

      // 성공 알림 (AI 분석 정보 포함)
      const aiSuccess = response.data.stats?.aiAnalysis?.success !== undefined 
        ? response.data.stats.aiAnalysis.success 
        : 0;
      
      const webPriceFound = response.data.stats?.aiAnalysis?.webPriceFound !== undefined
        ? response.data.stats.aiAnalysis.webPriceFound
        : 0;
        
      const successCount = response.data.results?.success || 0;
      const totalCount = response.data.results?.total || 0;
      const remainingCount = response.data.results?.totalRemaining || 0;
      
      alert(
        `마이그레이션 완료:\n` +
        `- 성공: ${successCount}/${totalCount} 게시글\n` +
        `- 남은 게시글: ${remainingCount}개\n` +
        `- AI 분석 성공: ${aiSuccess}개\n` +
        `- 웹 가격 정보 찾음: ${webPriceFound}개`
      );
      
      // 새로고침하여 변경된 내용을 바로 반영
      window.location.reload();
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
    if (migrationStatus.isLoading) return;
    
    try {
      setMigrationStatus(prev => ({
        ...prev,
        isLoading: true
      }));

      // 상태 확인 API 호출
      const response = await axios.get<MigrationResult>(`${API_URL}/migration/status`);
      
      // 상태 결과 저장
      setMigrationStatus({
        isLoading: false,
        result: response.data,
        error: null
      });

      // 데이터 안전하게 접근
      const data = response.data;
      const totalEverytime = data.totalEverytime || data.stats?.totalEverytime || 0;
      const migratedCount = data.migratedCount || data.stats?.migratedCount || 0;
      const remaining = data.remaining || data.stats?.remaining || 0;
      const percentComplete = data.percentComplete || data.stats?.percentComplete || '0%';
      const aiSuccess = data.stats?.aiAnalysis?.success;
      const webPriceFound = data.stats?.aiAnalysis?.webPriceFound;
      
      // 상태 알림 - 웹 가격 정보 추가
      const webPriceInfo = webPriceFound !== undefined 
        ? `\n- 웹 가격 정보 찾음: ${webPriceFound}개` 
        : '';
        
      alert(
        `마이그레이션 상태:\n` +
        `- 전체 Everytime 게시글: ${totalEverytime}개\n` +
        `- 마이그레이션 완료: ${migratedCount}개\n` +
        `- 남은 게시글: ${remaining}개\n` +
        `- 진행률: ${percentComplete}\n` +
        `- AI 분석 성공: ${aiSuccess !== undefined ? aiSuccess : '정보 없음'}${webPriceInfo}`
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
  
  // 특정 상품 재분석 함수 추가
  const handleReanalyzeAll = async () => {
    if (migrationStatus.isLoading) return;
    
    if (!window.confirm('AI를 사용하여 모든 상품을 다시 분석하시겠습니까? 이 작업은 시간이 오래 걸릴 수 있습니다.')) {
      return;
    }
    
    try {
      setMigrationStatus({
        isLoading: true,
        result: null,
        error: null
      });
      
      // 재분석 API 호출 (백엔드에 구현 필요)
      const response = await axios.post(`${API_URL}/hunt/reanalyze-all`);
      
      setMigrationStatus({
        isLoading: false,
        result: null,
        error: null
      });
      
      if (response.data.success) {
        alert(`재분석 요청이 완료되었습니다.\n분석된 상품: ${response.data.analyzedCount || 0}개`);
      } else {
        alert('재분석 요청 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('재분석 오류:', error);
      
      let errorMessage = '재분석 중 오류가 발생했습니다.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setMigrationStatus({
        isLoading: false,
        result: null,
        error: errorMessage
      });
      
      alert(`재분석 오류: ${errorMessage}`);
    }
  };

  // 마이그레이션 컨트롤 토글 함수
  const toggleMigrationControls = () => {
    setShowMigrationControls(!showMigrationControls);
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
          <Copyright onClick={toggleMigrationControls}>
            © {new Date().getFullYear()} HUN:ter. All rights reserved.
          </Copyright>
          {showMigrationControls && (
            <MigrationControls>
              {/* 기존 버튼들 유지 */}
              <MigrationButton 
                title="Everytime → Hunt 마이그레이션" 
                onClick={handleMigration}
                disabled={migrationStatus.isLoading || syncStatus.isLoading}
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
                disabled={migrationStatus.isLoading || syncStatus.isLoading}
              >
                상태 확인
              </MigrationButton>
              <MigrationButton 
                title="모든 상품 AI 재분석" 
                onClick={handleReanalyzeAll}
                disabled={migrationStatus.isLoading || syncStatus.isLoading}
              >
                전체 재분석
              </MigrationButton>
              
              {/* 에브리타임 동기화 버튼 추가 */}
              <MigrationButton 
                title="에브리타임 크롤링 및 동기화" 
                onClick={handleEverytimeSync}
                disabled={migrationStatus.isLoading || syncStatus.isLoading}
              >
                {syncStatus.isLoading ? (
                  <RotatingIcon>
                    <FaRobot size={14} />
                  </RotatingIcon>
                ) : (
                  <FaRobot size={14} />
                )}
                {syncStatus.isLoading ? '크롤링 중...' : '에브리타임 동기화'}
              </MigrationButton>
            </MigrationControls>
          )}
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

// 스타일드 컴포넌트는 이전과 동일하게 유지
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
  display: flex;
  gap: 8px;
  margin-top: 8px;
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