import "./style/socket_connection_overlay.css";


const SocketConnectionOverlay = ({ socketStatus, SocketStatusModes, display = true }) => {
  console.log(socketStatus)
    if (!display) return null;
    if (socketStatus === SocketStatusModes.CONNECTED) return null;

    const isDisconnected = socketStatus === SocketStatusModes.DISCONNECTED;
    const isReconnecting = socketStatus === SocketStatusModes.RECONNECTING;
    const isConnecting = socketStatus === SocketStatusModes.CONNECTING;

    return (
        <div className="socket-loader-overlay">
            <div className="socket-loader-container">
                <div className="socket-loader-icon">
                    {isDisconnected ? "📡" : "🔄"}
                </div>

                <h2 className="socket-loader-title">
                    {isDisconnected ? "Disconnected" : isReconnecting ? "Reconnecting..." : "Connecting..."}
                </h2>

                <p className="socket-loader-subtext">
                    {isDisconnected 
                        ? "We're having trouble connecting to the server" 
                        : isReconnecting
                        ? "Attempting to restore connection..."
                        : "Establishing connection to server..."}
                </p>

                {isDisconnected && (
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

