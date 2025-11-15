import React from "react";
import { GlobalAudioProvider } from "./context/GlobalAudioContext";
import AppContent from "./AppContent";

function App() {
  return (
    <GlobalAudioProvider>
      <AppContent />
    </GlobalAudioProvider>
  );
}

export default App;
