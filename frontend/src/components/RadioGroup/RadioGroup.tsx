import React, { useState } from "react";
import * as S from "./RadioGroup.styles";

type RadioGroupProps = {
  options: string[]; // 라디오 버튼의 라벨 목록
  onChange?: (selected: string | null) => void; // 선택 변경 시 호출되는 콜백
};

const RadioGroup = ({ options, onChange }: RadioGroupProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelection = (label: string) => {
    const newSelected = label === selected ? null : label; // 같은 항목 클릭 시 선택 해제
    setSelected(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <S.RadioGroupWrapper>
      {options.map((option) => (
        <S.RadioButtonWrapper
          key={option}
          onClick={() => handleSelection(option)}
        >
          <S.RadioCircle checked={selected === option} />
          <S.RadioLabel>{option}</S.RadioLabel>
        </S.RadioButtonWrapper>
      ))}
    </S.RadioGroupWrapper>
  );
};

export default RadioGroup;
