import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BetterLifeHomeCare from "./BetterLifeHomeCare";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<BetterLifeHomeCare />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
