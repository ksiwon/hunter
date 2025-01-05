import styled from "styled-components";

// Footer 컨테이너
export const FooterContainer = styled.footer`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  background-color: ${(props) => props.theme.colors.white};
  border-top: 2px solid ${(props) => props.theme.colors.gray[400]};
  padding: 0 32px;
  box-sizing: border-box;
`;

// 로고 스타일
export const FooterLogo = styled.div`
  font-size: ${(props) => props.theme.typography.T4.size};
  font-weight: ${(props) => props.theme.typography.T4.weight};
  color: ${(props) => props.theme.colors.primary};
  display: inline-block;
  margin-right: 32px; /* 로고와 첫 네비게이션 아이템 간의 최소 간격 */
`;

// Footer 네비게이션
export const FooterNav = styled.nav`
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  gap: 16px; /* 네비게이션 아이템 간의 최소 간격 */
`;

// Footer 네비게이션 아이템
export const FooterNavItem = styled.div`
  font-size: ${(props) => props.theme.typography.T7.size};
  font-weight: ${(props) => props.theme.typography.T7.weight};
  color: ${(props) => props.theme.colors.gray[400]};
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colors.black}; /* Hover 시 색상 변경 */
  }
`;
