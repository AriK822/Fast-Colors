import { useEffect, useRef, useState } from "react";



export function FullScreen({children, className="", ...kws}){
    return (
        <div
            className={`
                fixed size-full inset-0 
                bg-background text-text
                ${className}
            `}
            {...kws}
        >
            {children}
        </div>
    )
}


export function Button({children, onClick=undefined, className="", ...kws}){
    return (
        <button
            className={`
                    border rounded-btn h-fit p-3 
                    text-xl font-semibold hover:cursor-pointer
                    hover:bg-btn-hover transition ${className}
            `}
            onClick={onClick}
            {...kws}
        >
            {children}
        </button>
    )
}


export function SideBar({
    children,
    className = "",
    defaultWidth = 320,
    minWidth = 240,
    maxWidth = 500,
    ...kws
}) {
    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [width, setWidth] = useState(defaultWidth);
    const resizing = useRef(false);

    useEffect(() => {
        function handlePointerMove(e) {
            if (!resizing.current) return;

            const newWidth = Math.min(
                maxWidth,
                Math.max(minWidth, e.clientX)
            );

            setWidth(newWidth);
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

    return (<>
        <div
            className={`
                relative
                h-full
                shrink-0
                hidden md:block
                ${className}
            `}
            style={{ width }}
            {...kws}
        >
            {children}

            <div
                onPointerDown={startResize}
                className="
                    absolute
                    top-0 right-0
                    h-full w-2
                    cursor-col-resize
                    z-10
                "
            />
        </div>


        {/* For phone */}
        <Button 
            className={`
                border fixed top-3 left-3 md:hidden
                ${sideBarOpen ? "hidden" : ""}
            `}
            onClick={() => setSideBarOpen(prev => !prev)}
        >
            Open
        </Button>

        {sideBarOpen && <>
            <FullScreen
                className="bg-half-opacity flex md:hidden"
            >
                <div className={`
                    w-[45%] border bg-background flex-col relative shrink-0
                `}>
                    {children}
                </div>
                <div
                    className="w-full h-full"
                    onClick={() => setSideBarOpen(prev => !prev)}
                ></div>
            </FullScreen>
        </>}

        <div>

        </div>
    </>);
}

