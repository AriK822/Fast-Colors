import { createContext, useContext, useRef, useState } from "react";


const NotificationContext = createContext(null);


export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);
    const notificationId = useRef(0);

    function showNotification({
        text,
        type,
        color,
        timeout = 3000,
    }) {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const id = ++notificationId.current;

        setNotification({
            id,
            text,
            type,
            color,
            timeout,
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
                    key={notification.id}
                    {...notification}
                />
            )}
        </NotificationContext.Provider>
    );
}


export function useNotification() {
    return useContext(NotificationContext);
}


function Notification({ text, type, color, timeout }) {
    const typeColors = {
        warning: "var(--notification-warning)",
        success: "var(--notification-success)",
        error: "var(--notification-error)",
    };

    const backgroundColor =
        typeColors[type] ?? color ?? "var(--game-sidebar-border)";

    return (
        <div
            className="game-notification"
            style={{
                "--notification-color": backgroundColor,
                "--notification-duration": `${timeout}ms`,
            }}
        >
            <div className="game-notification-text">
                {text}
            </div>

            <div className="game-notification-timer" />
        </div>
    );
}

