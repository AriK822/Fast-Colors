import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import socket from "../../api/socket_init";
import * as SocketAPI from "../../api/socket_handler"

import SocketConnectionOverlay from "../loaders/socket_connection_overlay"


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
        SocketStatusModes.CONNECTING
    );


    useEffect(() => {
        const onConnect = () => {
            setSocketStatus(SocketStatusModes.CONNECTED);
        };

        const onDisconnect = (reason) => {
            console.log("Socket disconnected:", reason);
            setSocketStatus(SocketStatusModes.DISCONNECTED);
        };

        const onReconnectAttempt = (attempt) => {
            console.log("Reconnecting...", attempt);
            setSocketStatus(SocketStatusModes.RECONNECTING);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.io.on("reconnect_attempt", onReconnectAttempt);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.io.off("reconnect_attempt",onReconnectAttempt);
            socket.disconnect();
        };

    }, []);


    useEffect(() => {
        const sync_session_func_ = async () => {
            const new_session = await SocketAPI.syncSession()
            console.log("NEW SESSION: ", new_session)
            setSession(new_session);
        }
        sync_session_func_();
    }, []);


    const value = {
        session,
        setSession,

        socketStatus,
        SocketStatusModes,

    };


    if (!session){
        return <SocketConnectionOverlay 
            socketStatus={socketStatus} 
            SocketStatusModes = {SocketStatusModes.CONNECTING} 
            display={true} 
            />
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
