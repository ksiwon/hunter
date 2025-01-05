import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Pretendard, sans-serif;
    color: ${({ theme }) => theme.colors.black};
  }
`;

export default GlobalStyle;
