import React from "react";
import * as S from "./NaviIcon.styles";

interface NaviIconProps {
  label: string;
  icon: string;
  mode: "Default" | "Clicked" | "Unclicked";
  onClick: () => void;
}

const NaviIcon: React.FC<NaviIconProps> = ({ label, icon, mode, onClick }) => {
  return (
    <S.NaviIconWrapper mode={mode} onClick={onClick}>
      <S.NaviIconImage src={icon} alt={label} />
      <S.NaviIconLabel>{label}</S.NaviIconLabel>
    </S.NaviIconWrapper>
  );
};

export default NaviIcon;
