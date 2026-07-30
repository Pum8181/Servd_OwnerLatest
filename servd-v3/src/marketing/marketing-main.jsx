import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "./tokens.css";
import "./marketing.css";
import MarketingApp from "./MarketingApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MarketingApp />
  </StrictMode>
);
