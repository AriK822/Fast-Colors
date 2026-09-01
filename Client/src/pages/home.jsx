import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mainUnoImage from "../assets/main-uno-image.png";
import "./css/Home.css";


function Home() {
  const navigate = useNavigate();

  async function createLobbyBtn(){
    navigate("/lobby");
  }
  async function joinLobbyBtn(){
    navigate("/joinlobby");
  }

  return (
    <div className="game-container">

      <div className="left-section">
        <h1 className="title">Fast Colors</h1>
        <p className="subtitle">open-source multiplayer UNO</p>
        
        <div className="button-group">
          <button 
            className="btn btn-create" 
            onClick={createLobbyBtn} 
          >
            Create Lobby
          </button>
          <button 
            className="btn btn-create" 
            onClick={joinLobbyBtn} 
          >
            Join Lobby
          </button>
        </div>
      </div>
      
      <div className="right-section">
        <img src={mainUnoImage} alt="UNO Cards" className="hero-image" />
      </div>
      
    </div>
  );
}


export default Home;
