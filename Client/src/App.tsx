import { Routes, Route, Navigate } from "react-router-dom";

import "./api/socket_init";

// Pages
import Home from "./pages/Home"
import Game from "./pages/Game"
import LobbyLoader from "./pages/lobby"
import FindLobbyLoader from "./pages/find_lobby"



function App() {

  return (
    <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/lobby" element={<LobbyLoader />} />

        <Route path="/findlobby" element={<FindLobbyLoader />} />

        <Route path="/game" element={<Game />} />

        <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App
