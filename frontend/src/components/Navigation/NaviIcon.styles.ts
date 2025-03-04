import styled from "styled-components";

interface WrapperProps {
  mode: "Default" | "Clicked" | "Unclicked";
}

// NaviIcon 전체 Wrapper
export const NaviIconWrapper = styled.div<WrapperProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 144px;
  height: 180px;
  background-color: ${(props) =>
    props.mode === "Clicked"
      ? props.theme.colors.white // 선택된 상태에서 배경색 흰색
      : props.mode === "Unclicked"
      ? props.theme.colors.gray[400]
      : props.theme.colors.purple[100]};
  border-radius: 16px;
  border: none; // 테두리 제거
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  /* y축 그림자만 설정 */
  box-shadow: ${(props) =>
    props.mode === "Clicked"
      ? "0px 10px 10px rgba(0, 0, 0, 0.2)" // 클릭 상태: y축 그림자
      : "0px 5px 5px rgba(0, 0, 0, 0.2)"}; // 기본 상태: y축 그림자

  &:hover {
    background-color: ${(props) => props.theme.colors.white};
    box-shadow: ${(props) => "0px 10px 10px rgba(0, 0, 0, 0.2)"}; // 호버 시 y축 그림자
  }
`;

// NaviIcon 이미지
export const NaviIconImage = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
`;

// NaviIcon 라벨 (텍스트)
export const NaviIconLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.black};
  font-size: ${(props) => props.theme.typography.T4.size};
  font-weight: ${(props) => props.theme.typography.T4.weight};
  line-height: ${(props) => props.theme.typography.T4.lineHeight};
  text-align: center;
`;
