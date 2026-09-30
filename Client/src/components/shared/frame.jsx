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


function FrameSubBox({
    className,
    children, 
    ...props
}){
    return (
        <div
            className={`frame-subbox ${className}`}
            {...props}
        >
            {children}
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


function FrameCheckBox({
    className = "",
    onChange,
    ...props
}) {
    return (
        <input
            className={`
                game-toggle
                ${className}
            `}
            onChange={onChange}
            type="checkbox"
            {...props}
        />
    );
}


function FrameContrastInput({
    className = "",
    ...props
}) {
    return (
        <input
            className={`
                game-contrast-input
                ${className}
            `}
            {...props}
        />
    );
}


function FrameContrastButton({
    children,
    className = "",
    onClick,
    ...props
}) {
    return (
        <button
            className={`
                game-contrast-btn
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}


function hr({className}){
    return (<div className={`frame-hr ${className}`}></div>)
}



Object.assign(Frame, {
    Box: FrameBox, 
    SubBox: FrameSubBox,
    hr,
    Avatar: FrameAvatar,
    Label: FrameLabel,
    Btn: FrameButton, 
    Input: FrameInput,
    CheckBox: FrameCheckBox,
    ContrastBtn: FrameContrastButton,
    ContrastInput: FrameContrastInput,
})
export default {FullScreen, Frame}

