import { createContext, useContext, useState, useRef } from "react";


const NotificationContext = createContext(null);


export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);

    function showNotification({
        text,
        type,
        color,
        timeout = 3000,
    }) {
        // Cancel previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setNotification({
            text,
            type,
            color,
        });

        timeoutRef.current = setTimeout(() => {
            setNotification(null);
        }, timeout);
    }

    function hideNotification() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setNotification(null);
    }

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                hideNotification,
            }}
        >
            {children}

            {notification && (
                <Notification
                    {...notification}
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}



function Notification({ text, type, color }) {
    const typeColors = {
        warning: "orange",
        success: "green",
        error: "red",
    };

    const backgroundColor =
        typeColors[type] ?? color ?? "#333";

    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 9999,

                padding: "12px 20px",
                borderRadius: "8px",

                backgroundColor,
                color: "white",

                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
        >
            {text}
        </div>
    );
}

