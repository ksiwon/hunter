import React, { useState } from "react";
import styled from "styled-components";
import NaviIcon from "./NaviIcon";

const NavigationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  max-width: 100%; /* 부모 요소 크기에 맞게 제한 */
  overflow-x: auto; /* 넘칠 경우 스크롤 허용 */
  flex-wrap: wrap; /* 너비를 초과하면 다음 줄로 넘어가도록 설정 */
  box-sizing: border-box; /* 패딩 포함 크기 계산 */
`;

const iconList = [
  { label: "모빌리티", icon: "/assets/icons/mobility.png" },
  { label: "냉장고", icon: "/assets/icons/refrigerator.png" },
  { label: "전자제품", icon: "/assets/icons/electronics.png" },
  { label: "책/문서", icon: "/assets/icons/books.png" },
  { label: "기프티콘", icon: "/assets/icons/gifticon.png" },
  { label: "원룸", icon: "/assets/icons/office.png" },
  { label: "족보", icon: "/assets/icons/secret.png" },
  { label: "기타", icon: "/assets/icons/others.png" },
];

const Navigation: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <NavigationWrapper>
      {iconList.map((item, index) => (
        <NaviIcon
          key={index}
          mode={
            selected === null
              ? "Default"
              : selected === index
              ? "Clicked"
              : "Unclicked"
          }
          label={item.label}
          icon={item.icon}
          onClick={() => setSelected(index)}
        />
      ))}
    </NavigationWrapper>
  );
};

export default Navigation;
