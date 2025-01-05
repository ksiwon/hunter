import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      white: string;
      black: string;
      naver: string;
      green: { 500: string; 300: string };
      blue: { 500: string; 100: string };
      purple: { 400: string; 100: string };
      gray: { 100: string; 200: string; 300: string; 400: string; 600: string };
      red: { 500: string; 300: string; 100: string };
      yellow: { 500: string };
    };
    typography: {
      T1: { size: string; weight: int; lineHeight: string };
      T2: { size: string; weight: int; lineHeight: string };
      T3: { size: string; weight: int; lineHeight: string };
      T4: { size: string; weight: int; lineHeight: string };
      T5: { size: string; weight: int; lineHeight: string };
      T6: { size: string; weight: int; lineHeight: string };
      T7: { size: string; weight: int; lineHeight: string };
    };
  }
}
