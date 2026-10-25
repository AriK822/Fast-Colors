import { useState, useEffect } from "react";
import { useApp } from "../../utils/context/app_provider"

function Countdown({targetTime, 
    startExtend=null, endExtend=null, nullIfZero=false}) {
    const { serverTimerOffset }  = useApp();
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!targetTime) return null;
        return Math.ceil((targetTime - (Date.now() + serverTimerOffset)) / 1000);
    });

    useEffect(() => {
        if (!targetTime || timeLeft <= 0) return;

        const interval = setInterval(() => {
            const remaining = Math.ceil((targetTime - (Date.now() + serverTimerOffset)) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    if (nullIfZero && timeLeft<=0) return
    return <>{startExtend}<span>{timeLeft}</span>{endExtend}</>
}


function ElapsedTime({ targetTime }) {
    const { serverTimerOffset }  = useApp();
    const [timePassed, setTimePassed] = useState(() => {
        if (!targetTime) return null;
        return Math.floor((Date.now() + serverTimerOffset - targetTime) / 1000);
    });

    useEffect(() => {
        if (!targetTime) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() + serverTimerOffset - targetTime) / 1000);
            setTimePassed(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    return <span>{timePassed}</span>;
}


function ElapsedTimeFormatted({ targetTime }) {
    const { serverTimerOffset }  = useApp();
    const [timePassed, setTimePassed] = useState(() => {
        if (!targetTime) return null;
        return Math.floor((Date.now() + serverTimerOffset - targetTime) / 1000);
    });
    const hours = Math.floor(timePassed / 3600);
    const minutes = Math.floor((timePassed % 3600) / 60);
    const seconds = Math.floor(timePassed % 60);

    useEffect(() => {
        if (!targetTime) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() + serverTimerOffset - targetTime) / 1000);
            setTimePassed(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    return (
        <span>
            {hours > 0 && `${hours}h `}
            {minutes > 0 && `${minutes}m `}
            {seconds}s
        </span>
    )
}


export default {
    Timer: {
        Countdown,
        ElapsedTime,
        ElapsedTimeFormatted,
    },
}
