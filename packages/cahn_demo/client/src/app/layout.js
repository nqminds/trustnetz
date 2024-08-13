import ThemeClient from "./components/ThemeClient";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>CAHN Demo</title>
      </head>

      <body>
        <ThemeClient>{children}</ThemeClient>
      </body>
    </html>
  );
}
