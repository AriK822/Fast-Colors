import { createContext, useContext, useRef, useState } from "react";
import "./style/notification.css"


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
        warning: "var(--theme-warning)",
        success: "var(--theme-success)",
        error: "var(--theme-error)",
    };

    const backgroundColor =
        typeColors[type] ?? color ?? "var(--theme-accent)";

    return (
        <div className="notification-shadow">
        <div
            className="game-notification p-ui-sm px-ui-lg"
            style={{
                "--notification-color": backgroundColor,
                "--notification-duration": `${timeout}ms`,
            }}
        >
            <div className="ui-text text-lg game-notification-text">
                {text}
            </div>

            <div className="game-notification-timer" />
        </div></div>
    );
}

