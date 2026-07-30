import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "./customer.css";
import CustomerApp from "./CustomerApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CustomerApp />
  </StrictMode>
);
