import { Routes, Route, Navigate } from "react-router-dom";

import "./api/socket_init";

// Pages
import Home from "./pages/Home"
import Lobby from "./pages/lobby"
import JoinLobby from "./pages/join_lobby"
import Game from "./pages/game"
import Test from "./pages/test"

// CSS
import "./components/app.css";

// Context
import { AppProvider } from "./utils/context/app_provider"
import { NotificationProvider } from "./utils/context/notification"

import { SkeletonTheme } from "react-loading-skeleton";



function App() {

  return (
    <AppProvider>
    <NotificationProvider>
    <SkeletonTheme
        baseColor="#2a2a2a00"
        highlightColor="#d1d1d1"
    >

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/lobby" element={<Lobby />} />
        
        <Route path="/joinlobby" element={<JoinLobby />} />

        <Route path="/game" element={<Game />} />

        <Route path="/test" element={<Test />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </SkeletonTheme>
    </NotificationProvider>
    </AppProvider>
  )
}

export default App
