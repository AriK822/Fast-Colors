import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import socket from "../../api/socket_init";
import * as SocketAPI from "../../api/socket_handler"

import SocketConnectionOverlay from "../../components/loaders/socket_connection_overlay"
import FullScreenLoader from "../../components/loaders/fullscreen1"


const AppContext = createContext(null);


export const useApp = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useApp must be used inside AppProvider");
    }

    return context;
};


export const SocketStatusModes = Object.freeze({
    CONNECTING: "connecting",
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    RECONNECTING: "reconnecting",
});


export const AppProvider = ({ children }) => {

    const [session, setSession] = useState(null);

    const [socketStatus, setSocketStatus] = useState(
        socket.connected ? SocketStatusModes.CONNECTED : SocketStatusModes.CONNECTING
    );


    useEffect(() => {
        const onConnect = () => {
            console.log("Socket connected");
            setSocketStatus(SocketStatusModes.CONNECTED);
        };

        const onDisconnect = (reason) => {
            console.log("Socket disconnected:", reason);
            setSocketStatus(SocketStatusModes.DISCONNECTED);
        };

        const onConnectError = (error) => {
            console.log("Socket connection error:", error);
            setSocketStatus(SocketStatusModes.DISCONNECTED);
        };

        const onReconnectAttempt = (attempt) => {
            console.log("Reconnecting...", attempt);
            setSocketStatus(SocketStatusModes.RECONNECTING);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        socket.io.on("reconnect_attempt", onReconnectAttempt);

        socket.connect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
            socket.io.off("reconnect_attempt", onReconnectAttempt);
        };
    }, []);


    const runSyncSession = async () => {
        const new_session = await SocketAPI.syncSession()
        console.log("NEW SESSION: ", new_session)
        setSession(new_session);
    }

    useEffect(() => {
        if (socket.connected) {
            runSyncSession();
            return;
        }

        socket.once("connect", runSyncSession);

        return () => {
            socket.off("connect", runSyncSession);
        };

    }, []);


    const value = {
        session,
        setSession,
        runSyncSession,

        socketStatus,
        SocketStatusModes,

    };


    if (!session){
        return <FullScreenLoader text={"Loading..."} />
    }

    return (
        <AppContext.Provider value={value}>
            <SocketConnectionOverlay 
                socketStatus={socketStatus} 
                SocketStatusModes = {SocketStatusModes} 
                display={true} 
            />
            {children}
        </AppContext.Provider>
    );
};
