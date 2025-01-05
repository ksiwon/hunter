import styled from 'styled-components';

export const Wrapper = styled.div`
  display: inline-flex;
  align-items: flex-start;
  gap: 32px;
`;

export const Button = styled.button<{ variant: 'gray' | 'primary' }>`
  width: 200px;
  height: 72px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.T4.size};
  font-weight: ${({ theme }) => theme.typography.T4.weight};
  line-height: ${({ theme }) => theme.typography.T4.lineHeight};
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.primary : theme.colors.gray[400]};
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;
