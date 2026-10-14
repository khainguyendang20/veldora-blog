import React from "react";
import "./styles/index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { darkTheme, theme } from "./utils/constants";
import { useThemeStore } from "./store";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ScrollToTop } from "react-router-scroll-to-top";

import { createRoot } from "react-dom/client";
const container = document.getElementById("root");
const root = createRoot(container);

const ThemedApp = () => {
  const mode = useThemeStore((state) => state.mode);
  return (
    <ThemeProvider theme={mode === "dark" ? darkTheme : theme}>
      <GlobalStyles></GlobalStyles>
      <BrowserRouter>
        <ScrollToTop />
        <App />
        <ToastContainer theme={mode}></ToastContainer>
      </BrowserRouter>
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
