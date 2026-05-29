import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import { ThemeProvider } from "./context/theme/ThemeProvider.tsx";
// PWA temporarily disabled due to build issues
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
