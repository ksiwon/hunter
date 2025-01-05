import styled from "styled-components";

// 전체 그룹 Wrapper
export const RadioGroupWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

// 개별 라디오 버튼 Wrapper
export const RadioButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

// 라디오 원 Circle
export const RadioCircle = styled.div<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.purple[400]}; // 외곽 테두리
  display: flex;
  justify-content: center;
  align-items: center;

  // 내부 원
  ${({ checked, theme }) =>
    checked &&
    `
    &::after {
      content: '';
      width: 16px; /* 내부 원의 크기 */
      height: 16px; /* 내부 원의 크기 */
      border-radius: 50%;
      background-color: ${theme.colors.primary}; // 내부 원 색상
    }
  `}
`;

// 라디오 라벨 Text
export const RadioLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.size};
  font-weight: ${({ theme }) => theme.typography.T6.weight};
  color: ${({ theme }) => theme.colors.black};
`;
