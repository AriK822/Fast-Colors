import { useEffect, useRef, useState } from "react";

import { useApp } from "../../utils/context/app_provider"
import interactive from "./interactive"
import frame from "./frame";

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
                    h-full game-sidebar ${className}
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
            </aside>

            <interactive.Button
                className={`
                    fixed top-3 left-3 z-10 md:hidden
                    ${open ? "hidden" : ""}
                `}
                onClick={() => setOpen(true)}
            >
                Open
            </interactive.Button>

            {open && (
                <frame.FullScreen className="z-100 flex bg-overlay md:hidden">
                    <aside
                        className={`
                            relative flex flex-col
                            min-w-[70%] max-w-[70%] shrink-0
                            bg-background game-sidebar
                            ${className}
                        `}
                        style={{...style, width  }}
                        {...props}
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
                    </aside>

                    <div
                        className="h-full w-full"
                        onClick={() => setOpen(false)}
                    />
                </frame.FullScreen>
            )}
        </>
    );
}


function Divider(){
    return (<div className="sidebar-divider"></div>)
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
                h-fit
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
                sidebar-input p-ui-md
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
    Input: SideBarInput
})
export default {SideBar}

