import { Routes, Route, Navigate } from "react-router-dom";

import "./api/socket_init";

// Pages
import Home from "./pages/Home"
import Lobby from "./pages/lobby"

// CSS
// import "./helpers/base.css"

// Overlays
import SocketConnectionOverlay from "./helpers/loaders/socket_connection_overlay"

// Context
import { AppProvider } from "./helpers/context/app_provider"
import { NotificationProvider } from "./helpers/context/notification"

import { SkeletonTheme } from "react-loading-skeleton";



function App() {

  return (
    <AppProvider>
    <NotificationProvider>
    <SkeletonTheme
        baseColor="#2a2a2a"
        highlightColor="#3a3a3a"
    >

      <SocketConnectionOverlay display={true} />


      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/lobby" element={<Lobby />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </SkeletonTheme>
    </NotificationProvider>
    </AppProvider>
  )
}

export default App
