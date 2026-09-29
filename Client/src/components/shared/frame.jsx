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
    insideBoxProps,
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

            <div className={`frame-box-inside ${insideBoxClassName}`} {...insideBoxProps}>
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
                        <p className="frame-label-soft">👤{lobby.players}</p>
                        <p className="frame-label-soft">🤖{lobby.bots}</p>
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


function FrameInput({
    className = "",
    onChange,
    placeholder = "",
    ...props
}) {
    return (
        <input
            className={`
                frame-input p-ui-md
                font-game text-md text-text
                placeholder:text-white/60
                ${className}
            `}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
        />
    );
}


function FrameLabel({
    children,
    className = "",
    ...props
}) {
    return (
        <div
            className={`
                frame-label-dark px-ui-md py-ui-xxs
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}


function FrameAvatar({
    letter=undefined,
    className = "",
    ...props
}) {
    let bg_token = "--theme-avatar-1"
    if (String(letter)?.[0]){
        let i ="abcdefghijklmnopqrstuvwxyz".indexOf(
            String(letter)[0]?.toLowerCase()
        )
        i = i%5 + 1
        bg_token = `--theme-avatar-${i}`
    }

    return (
        <div
            className={`
                frame-player-avatar shrink-0
                ${className}
            `}
            style={{background:`var(${bg_token})`}}
            {...props}
        >
            {letter}
        </div>
    );
}


Object.assign(Frame, {
    Box: FrameBox, 
    Btn: FrameButton, 
    Input: FrameInput,
    Label: FrameLabel,
    Avatar: FrameAvatar,
    JoinLobbyInfo: FrameJoinLobbyInfo,
})
export default {FullScreen, Frame}

