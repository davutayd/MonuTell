// src/App.jsx (GÜNCELLENMİŞ)

import React from "react";
import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import AppContent from "./AppContent"; // Yeni bileşeni import edin

function App() {
  return (
    <GlobalAudioProvider>
      <AppContent />
    </GlobalAudioProvider>
  );
}

export default App;
