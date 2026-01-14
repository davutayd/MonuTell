import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import AppContent from "./AppContent";
import AdminDashboard from "./components/Admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <GlobalAudioProvider>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </GlobalAudioProvider>
    </BrowserRouter>
  );
}

export default App;
