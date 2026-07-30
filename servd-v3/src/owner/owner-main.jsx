import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "./owner.css";
import OwnerApp from "./OwnerApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OwnerApp />
  </StrictMode>
);
