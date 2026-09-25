import { useEffect, useRef, useState } from "react";

import topLeftLeaves from "../assets_staging/s4.1.png";
import bottomLeftLeaves from "../assets_staging/s3.png";


export function FullScreen({ children, className = "", ...props }) {
    return (
        <div
            className={`fixed inset-0 size-full bg-background text-text ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}


export function Button({
    children,
    className = "",
    variant = "default",
    onClick,
    ...props
}) {
    return (
        <button
            className={`
                h-fit
                cursor-pointer
                font-game text-xl text-text
                transition
                ${variant === "sidebar" ? "sidebar-btn" : "default-btn"}
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}


export function Input({
    className = "",
    onChange,
    placeholder = "",
    ...props
}) {
    return (
        <input
            className={`
                default-input
                h-fit w-full
                p-3
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


export function SideBar({
    children,
    className = "",
    style = {},
    defaultWidth = 320,
    minWidth = 240,
    maxWidth = 500,
    ...props
}) {
    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState(defaultWidth);
    const resizing = useRef(false);

    useEffect(() => {
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
                    relative hidden h-full shrink-0 md:block
                    ${className}
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
                        scale-80 img-shadow-subtle
                    "
                />

                <img
                    src={bottomLeftLeaves}
                    alt=""
                    className="
                        pointer-events-none
                        absolute -bottom-15 -left-10
                        scale-80 img-shadow-subtle
                    "
                />
            </aside>

            <Button
                className={`
                    fixed top-3 left-3 z-10
                    p-3 md:hidden
                    ${open ? "hidden" : ""}
                `}
                onClick={() => setOpen(true)}
            >
                Open
            </Button>

            {open && (
                <FullScreen className="z-100 flex bg-half-opacity md:hidden">
                    <aside
                        className={`
                            relative flex w-[65%] shrink-0 flex-col
                            bg-background
                            ${className}
                        `}
                        style={{...style, width  }}
                    >
                        {children}

                        <img
                            src={topLeftLeaves}
                            alt=""
                            className="
                                pointer-events-none
                                absolute -top-15 -left-10
                                scale-80 img-shadow-subtle
                            "
                        />

                        <img
                            src={bottomLeftLeaves}
                            alt=""
                            className="
                                pointer-events-none
                                absolute -bottom-15 -left-10
                                scale-80 img-shadow-subtle
                            "
                        />
                    </aside>

                    <div
                        className="h-full w-full"
                        onClick={() => setOpen(false)}
                    />
                </FullScreen>
            )}
        </>
    );
}


export function Divider(){
    return (<div className="divider"></div>)
}
