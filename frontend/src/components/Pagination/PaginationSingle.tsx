import React from "react";
import * as S from "./PaginationSingle.styles";

type PaginationSingleProps = {
  label: string;
  filled?: boolean;
  onClick: () => void;
};

const PaginationSingle = ({ label, filled = false, onClick }: PaginationSingleProps) => {
  return (
    <S.PaginationButton filled={filled} onClick={onClick}>
      {label}
    </S.PaginationButton>
  );
};

export default PaginationSingle;
