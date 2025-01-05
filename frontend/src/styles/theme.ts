import { DefaultTheme } from "styled-components";

const theme: DefaultTheme = {
  colors: {
    primary: "#8C00FF",
    white: "#FFFFFF",
    black: "#111111",
    naver: "#03C75A",
    green: {
      500: "#107F4F",
      300: "#8DDD97",
    },
    blue: {
      500: "#107AC6",
      100: "#E5E2FD",
    },
    purple: {
      400: "#D39CFF",
      100: "#F2E3FF",
    },
    gray: {
      100: "#F8F8F8",
      200: "#DFDFDF",
      300: "#C0C0C0",
      400: "#AFAFAF",
      600: "#666666",
    },
    red: {
      500: "#FA5858",
      300: "#F0ACAC",
      100: "#FDE2E2",
    },
    yellow: {
      500: "#DBD51F",
    },
  },
  typography: {
    T1: { size: "60px", weight: 800, lineHeight: "72px" },
    T2: { size: "48px", weight: 700, lineHeight: "58px" },
    T3: { size: "36px", weight: 600, lineHeight: "43px" },
    T4: { size: "30px", weight: 600, lineHeight: "36px" },
    T5: { size: "24px", weight: 500, lineHeight: "28px" },
    T6: { size: "20px", weight: 500, lineHeight: "24px" },
    T7: { size: "16px", weight: 500, lineHeight: "20px" },
  },
};

export default theme;
