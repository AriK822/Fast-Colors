import "./style/frame.css"


function FullScreen({ children, className = "", ...props }) {
    return (
        <div
            className={`fixed inset-0 size-full bg-background text-text ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}


function Frame({className, children, ...props}){
    return (
        <div
            className={`game-frame ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}


function FrameBox({
    header, 
    className,
    insideBoxClassName,
    children, 
    ...props
}){
    return (
        <div
            className={`frame-box flex flex-col ui-text ${className}`}
            {...props}
        >
            <div className="p-ui-xs text-lg">
                {header}
            </div>

            <div className={`frame-box-inside ${insideBoxClassName}`}>
                {children}
            </div>
        </div>
    )
}


function FrameJoinLobbyInfo({lobby, onClick, className, ...props}){
    if (!lobby) return
    return (
        <div
            className={`frame-join-lobby-holder cursor-pointer
                ui-text ${className}`}
            onClick={onClick}
            {...props}
        >
            <div className="flex flex-col gap-ui-xs">
                <div className="flex flex-row justify-between gap-ui-md">
                    <p className="frame-label text-sm truncate w-[60%] md:w-fit">
                        <span className="opacity-[85%] font-game-thin">
                            {lobby.id}
                        </span>
                    </p>
                    <div className="flex flex-row gap-ui-xxs truncate">
                        <p className="frame-label">👤{lobby.players}</p>
                        <p className="frame-label">🤖{lobby.bots}</p>
                    </div>
                </div>
                <div>
                    <span className="opacity-[60%] tracking-widest text-xs ">
                        OWNER
                    </span>
                    <span className="text-xl">
                        {" "}{lobby.owner}
                    </span>    
                </div>
            </div>
        </div>
    )
}


function FrameButton({
    children,
    className = "",
    onClick,
    ...props
}) {
    return (
        <button
            className={`
                game-frame-btn
                cursor-pointer
                ui-text text-xl
                transition transition-duration-hover
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}


Object.assign(Frame, {
    Box: FrameBox, 
    Btn: FrameButton, 
    JoinLobbyInfo: FrameJoinLobbyInfo,
})
export default {FullScreen, Frame}

