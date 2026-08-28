import { Routes, Route, Navigate } from "react-router-dom";

import "./api/socket_init";

// Pages
import Home from "./pages/Home"

// CSS
// import "./helpers/base.css"

// Overlays
import SocketConnectionOverlay from "./helpers/loaders/socket_connection_overlay"

// Context
import { AppProvider } from "./helpers/context/app_provider"



function App() {

  return (
    <AppProvider>

      <SocketConnectionOverlay />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </AppProvider>
  )
}

export default App
