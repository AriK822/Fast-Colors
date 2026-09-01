import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import socket from "../../api/socket_init";
import * as SocketAPI from "../../api/socket_handler"


const AppContext = createContext(null);


export const useApp = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useApp must be used inside AppProvider");
    }

    return context;
};


export const SocketStatusModes = Object.freeze({
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    RECONNECTING: "reconnecting",
});


export const AppProvider = ({ children }) => {

    const [session, setSession] = useState(null);

    const [socketStatus, setSocketStatus] = useState(
        SocketStatusModes.DISCONNECTED
    );


    useEffect(() => {
        const onConnect = () => {
            setSocketStatus(SocketStatusModes.CONNECTED);
        };

        const onDisconnect = (reason) => {
            console.log("Socket disconnected:", reason);
            setSocketStatus(SocketStatusModes.RECONNECTING);
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
        const unsubscribe = SocketAPI.listenForSessionSync((newSession) => {
            console.log(newSession)
            setSession(newSession);
        });
        return unsubscribe;
    }, []);


    const value = {
        session,
        setSession,

        socketStatus,
        SocketStatusModes,

    };


    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
