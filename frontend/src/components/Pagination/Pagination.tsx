import React from "react";
import PaginationSingle from "./PaginationSingle";
import * as S from "./Pagination.styles";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ totalPages, currentPage, onPageChange }: PaginationProps) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <S.PaginationWrapper>
      <PaginationSingle
        label="<"
        onClick={() => handlePageChange(currentPage - 1)}
      />
      {Array.from({ length: totalPages }, (_, idx) => (
        <PaginationSingle
          key={idx + 1}
          label={(idx + 1).toString()}
          filled={currentPage === idx + 1}
          onClick={() => handlePageChange(idx + 1)}
        />
      ))}
      <PaginationSingle
        label=">"
        onClick={() => handlePageChange(currentPage + 1)}
      />
    </S.PaginationWrapper>
  );
};

export default Pagination;
