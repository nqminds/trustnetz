"use client";
import { createTheme, responsiveFontSizes } from "@mui/material";
import { Ubuntu_Mono } from "next/font/google";
import NextLink from "next/link";
import { forwardRef } from "react";

const LinkBehaviour = forwardRef(function LinkBehaviour(props, ref) {
  return <NextLink ref={ref} {...props} />;
});

const ubuntuMono = Ubuntu_Mono({
  display: "swap",
  weight: "400",
  subsets: ["latin"],
});

const themeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#0f0",
    },
    background: {
      default: "#111111",
      paper: "#212121",
    },

    divider: "#0f0",
  },
  typography: {
    fontFamily: ubuntuMono.style.fontFamily,
  },
  shape: {
    borderRadius: 15,
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehaviour,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehaviour,
      },
    },
  },
};

const theme = responsiveFontSizes(createTheme(themeOptions));

export default theme;
