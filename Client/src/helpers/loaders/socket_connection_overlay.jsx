import { useApp } from "../context/app_provider";
import "./css/socket_connection_overlay.css";


const SocketConnectionOverlay = (display = true) => {
    if (display == false){return null;}

    const { socketStatus, SocketStatusModes } = useApp();
    if (socketStatus === SocketStatusModes.CONNECTED){return null;}

    return (
      <div className="socket-loader-overlay">
        <div className="socket-loader-container">
          <div className="socket-loader-icon">
            {status === "disconnected" ? "📡" : "😭"}
          </div>

          <h2 className="socket-loader-title">
            {status === "disconnected" ? "Disconnected" : "Connecting..."}
          </h2>

          <p className="socket-loader-subtext">
            {status === "disconnected" 
              ? "We're having trouble connecting to the server" 
              : "Attempting to restore connection"}
          </p>

          {status === "disconnected" && (
            <button 
              className="socket-loader-retry"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
};


export default SocketConnectionOverlay;

