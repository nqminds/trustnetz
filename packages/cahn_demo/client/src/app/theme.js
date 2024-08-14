"use client";
import { createTheme } from "@mui/material";
import { Ubuntu_Mono } from "next/font/google";
const ubuntuMono = Ubuntu_Mono({
  display: "swap",
  weight: "400",
  subsets: ["latin"],
});

const themeOptions = {
  palette: {
    type: "dark",
    primary: {
      main: "#0f0",
    },
    background: {
      default: "#111111",
      paper: "#212121",
    },
    text: {
      primary: "#ffffff",
    },
    divider: "#0f0",
  },
  typography: {
    fontFamily: ubuntuMono.style.fontFamily,
  },
};

const themeOptions2 = {
  type: "light",
  primary: {
    main: "#1976d2",
  },
  secondary: {
    main: "rgb(220, 0, 78)",
  },
  background: {
    default: "#fff",
    paper: "#fff",
  },
};
const theme = createTheme(themeOptions);

export default theme;
