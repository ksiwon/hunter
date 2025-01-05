import styled from "styled-components";

export const PaginationButton = styled.button<{ filled: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: none;
  background-color: ${({ filled, theme }) =>
    filled ? theme.colors.primary : theme.colors.white};
  color: ${({ filled, theme }) =>
    filled ? theme.colors.white : theme.colors.black};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.T6.size};
  font-weight: ${({ theme }) => theme.typography.T6.weight};

  &:hover {
    opacity: 0.8;
  }
`;
