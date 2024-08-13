"use client";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Open_Sans } from "next/font/google";
const themeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#b9f6ca",
    },
    secondary: {
      main: "#c0ca33",
    },
    background: {
      default: "#000000",
      paper: "#21331a",
    },
  },
};
const theme = createTheme(themeOptions);
const ThemeClient = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
export default ThemeClient;
