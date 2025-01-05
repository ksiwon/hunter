import styled from "styled-components";

export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px; /* Figma의 비율에 맞춘 너비 */
  height: 56px; /* Figma의 비율에 맞춘 높이 */
  background: var(--Gray-200, #dfdfdf);
  border-radius: 40px; /* 둥근 모서리 */
  box-shadow: 0px 1px 1px 1px rgba(0, 0, 0, 0.25);
  position: relative;
`;

export const ToggleButton = styled.div<{ isOn: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px; /* Figma 기준 */
  height: 48px; /* Figma 기준 */
  background: ${({ isOn, theme }) =>
    isOn ? theme.colors.primary : theme.colors.purple[400]};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 30px;
  box-shadow: 0px 1px 1px 1px rgba(0, 0, 0, 0.25);
  position: absolute;
  left: ${({ isOn }) => (isOn ? "56px" : "8px")}; /* 위치 조정 */
  transition: all 0.3s ease;
  font-size: ${({ theme }) => theme.typography.T5.size};
  font-weight: ${({ theme }) => theme.typography.T5.weight};
  line-height: ${({ theme }) => theme.typography.T5.lineHeight};
`;

export const ToggleText = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.T5.size};
  font-weight: ${({ theme }) => theme.typography.T5.weight};
  line-height: ${({ theme }) => theme.typography.T5.lineHeight};
  color: ${({ theme }) => theme.colors.white};
`;
