import { useEffect, useRef, useState } from "react";

import { useApp } from "../../utils/context/app_provider"
import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";
import interactive from "./interactive"

import "./style/sidebar.css"
import topLeftLeaves from "../../assets_staging/s4.1.png";
import bottomLeftLeaves from "../../assets_staging/s3.png";



function SideBar({
    children,
    className = "",
    style = {},
    defaultWidth = 320,
    minWidth = 240,
    maxWidth = 500,
    ...props
}) {
    const { width, setWidth } = useApp();
    const [open, setOpen] = useState(false);
    const resizing = useRef(false);

    useEffect(() => {
        if (!width) setWidth(defaultWidth);
        
        function handlePointerMove(event) {
            if (!resizing.current) return;

            setWidth(
                Math.min(
                    maxWidth,
                    Math.max(minWidth, event.clientX)
                )
            );
        }

        function handlePointerUp() {
            resizing.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [minWidth, maxWidth]);

    function startResize() {
        resizing.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }

    return (
        <>
            <aside
                className={`
                    hidden relative md:flex flex-col shrink-0
                    h-full game-sidebar game-theme-scrollbar ${className}
                `}
                style={{...style, width  }}
                {...props}
            >
                {children}

                <div
                    className="
                        absolute top-0 right-0 z-10
                        h-full w-2 cursor-col-resize
                    "
                    onPointerDown={startResize}
                />

                <img
                    src={topLeftLeaves}
                    alt=""
                    className="
                        pointer-events-none
                        fixed -top-15 -left-10
                        scale-80 drop-shadow-img-soft
                    "
                />

                <img
                    src={bottomLeftLeaves}
                    alt=""
                    className="
                        pointer-events-none
                        fixed -bottom-15 -left-10
                        scale-80 drop-shadow-img-soft
                    "
                />
            </aside>

            <interactive.Button
                className={`
                    fixed top-3 left-3 z-1000 md:hidden
                    ${open ? "hidden" : ""}
                `}
                onClick={() => setOpen(true)}
            >
                Open
            </interactive.Button>

            <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 size-full bg-background text-text
                        z-100 flex bg-overlay md:hidden"

                    initial={{ opacity:0.7 }}
                    animate={{ opacity:1 }}
                    exit={{opacity:0 }}
                >
                    <motion.aside
                        className={`
                            relative flex flex-col
                            min-w-[70%] max-w-[70%] shrink-0
                            bg-background game-sidebar
                            ${className}
                        `}
                        style={{...style, width  }}
                        {...props}

                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{
                            type: "linear",
                            duration: 0.2,
                            ease: easeOut,
                        }}
                    >
                        {children}

                        <img
                            src={topLeftLeaves}
                            alt=""
                            className="
                                pointer-events-none
                                absolute -top-15 -left-10
                                scale-80 drop-shadow-img-soft
                            "
                        />

                        <img
                            src={bottomLeftLeaves}
                            alt=""
                            className="
                                pointer-events-none
                                absolute -bottom-15 -left-10
                                scale-80 drop-shadow-img-soft
                            "
                        />
                    </motion.aside>

                    <div
                        className="h-full w-full"
                        onClick={() => setOpen(false)}
                    />
                </motion.div>
            )}
            </AnimatePresence>
        </>
    );
}


function Divider({className=""}){
    return (<div className={`sidebar-divider shrink-0 ${className}`}></div>)
}


function SideBarButton({
    children,
    className = "",
    onClick,
    ...props
}) {
    return (
        <button
            className={`
                h-fit shrink-0
                cursor-pointer
                ui-text text-xl
                transition transition-duration-hover
                sidebar-btn
                truncate
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}



function SideBarInput({
    className = "",
    onChange,
    placeholder = "",
    ...props
}) {
    return (
        <input
            className={`
                sidebar-input p-ui-md shrink-0
                font-game text-xl text-text
                placeholder:text-white/60
                ${className}
            `}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
        />
    );
}



Object.assign(SideBar, {
    Divider, 
    Btn: SideBarButton, 
    Input: SideBarInput,
})
export default {SideBar}

