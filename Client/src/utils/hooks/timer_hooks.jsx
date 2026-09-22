import { useState, useEffect } from "react";

export function useCountdown(targetTime) {
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!targetTime) return null;
        return Math.ceil((targetTime - Date.now()) / 1000);
    });

    useEffect(() => {
        if (!targetTime || timeLeft <= 0) return;

        const interval = setInterval(() => {
            const remaining = Math.ceil((targetTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    return timeLeft;
}

