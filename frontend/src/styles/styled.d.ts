import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      white: string;
      black: string;
      naver: string;
      green: { [key: number]: string };
      blue: { [key: number]: string };
      purple: { [key: number]: string };
      gray: { [key: number]: string };
      red: { [key: number]: string };
      yellow: { [key: number]: string };
    };
    typography: {
      [key: string]: {
        size: string;
        weight: number;
        lineHeight: string;
      };
    };
  }
}
