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
  },
  typography: {
    fontFamily: ubuntuMono.style.fontFamily,
  },
};
const theme = createTheme(themeOptions);

export default theme;
("");
