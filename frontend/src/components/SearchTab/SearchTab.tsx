import React, { useState } from "react";
import { SearchTabWrapper, Input, SearchIcon } from "./SearchTab.styles";

interface SearchTabProps {
  onSearch: (value: string) => void; // onSearch 콜백 함수 타입 정의
}

const SearchTab: React.FC<SearchTabProps> = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue); // 부모로 검색 값을 전달
  };

  return (
    <SearchTabWrapper>
      <Input
        type="text"
        placeholder="제목을 입력해주세요."
        value={value}
        onChange={handleChange}
        isFilled={value.length > 0}
      />
      <SearchIcon />
    </SearchTabWrapper>
  );
};

export default SearchTab;
