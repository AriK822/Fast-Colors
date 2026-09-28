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
            className={`frame-join-lobby-option cursor-pointer
                ui-text ${className}`}
            onClick={onClick}
            {...props}
        >
            <div className="flex flex-row flex-wrap gap-ui-md justify-between">
                <p>Owner: {lobby.owner}</p>
                <p>Players: {lobby.players}</p>
                <p>Bots: {lobby.bots}</p>
                <p>ID: {lobby.id}</p>
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

