import "./style/frame.css"
import { Children, useEffect, useLayoutEffect, useRef, useState } from "react";


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
        let i ="abcdefghijklmnopqrstuvwxyz1234567890".indexOf(
            String(letter)[0]?.toLowerCase()
        )
        if (i!=-1){
            i = i%5 + 1
            bg_token = `--theme-avatar-${i}`
        }
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


function FrameSelect({
    children,
    className = "",
    disabled = false,
    value,
    defaultValue,
    onChange,
    onClick,
    ...props
}) {
    const selectRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});

    const options = Children.toArray(children);

    const selectedOption = options.find(
        option => String(option.props.value) === String(value)
    );

    const displayValue =
        selectedOption?.props.children ??
        options.find(
            option =>
                String(option.props.value) === String(defaultValue)
        )?.props.children ??
        "";

    function close() {
        setOpen(false);
    }

    function updateMenuPosition() {
        const trigger = triggerRef.current;

        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();

        const padding = 8;
        const gap = 4;

        const maxHeight = Math.min(
            280,
            window.innerHeight - padding * 2
        );

        let top = rect.bottom + gap;

        // Open upward if there isn't enough room below.
        if (top + maxHeight > window.innerHeight - padding) {
            top = rect.top - gap - maxHeight;
        }

        top = Math.max(
            padding,
            Math.min(
                top,
                window.innerHeight - padding - maxHeight
            )
        );

        // At least as wide as the trigger, but never wider than the viewport.
        const width = Math.min(
            Math.max(rect.width, 160),
            window.innerWidth - padding * 2
        );

        let left = rect.left;

        // Keep the menu inside the viewport horizontally.
        left = Math.max(
            padding,
            Math.min(
                left,
                window.innerWidth - padding - width
            )
        );

        setMenuStyle({
            top,
            left,
            width,
            maxHeight
        });
    }

    function openMenu() {
        if (disabled) return;

        setOpen(true);
        onClick?.();
    }

    function selectOption(option) {
        if (!selectRef.current) return;

        selectRef.current.value = option.props.value;

        selectRef.current.dispatchEvent(
            new Event("change", { bubbles: true })
        );

        close();
    }

    useLayoutEffect(() => {
        if (!open) return;

        updateMenuPosition();
    }, [open]);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event) {
            const target = event.target;

            if (
                triggerRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }

            close();
        }

        function handleViewportChange() {
            updateMenuPosition();
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                close();
                triggerRef.current?.focus();
            }
        }

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );

        window.addEventListener(
            "resize",
            handleViewportChange
        );

        window.addEventListener(
            "scroll",
            handleViewportChange,
            true
        );

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );

            window.removeEventListener(
                "resize",
                handleViewportChange
            );

            window.removeEventListener(
                "scroll",
                handleViewportChange,
                true
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [open]);

    return (
        <>
            <div
                className={`
                    relative min-w-0
                    ${className}
                `}
            >
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    className="game-frame-select-trigger"
                    onClick={open ? close : openMenu}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    <span className="truncate">
                        {displayValue}
                    </span>

                    <span
                        className={`
                            game-frame-select-arrow
                            ${open ? "is-open" : ""}
                        `}
                        aria-hidden="true"
                    >
                        ▾
                    </span>
                </button>

                <select
                    ref={selectRef}
                    className="game-frame-select-native"
                    value={value}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                >
                    {children}
                </select>
            </div>

            {open && (
                <div
                    ref={menuRef}
                    className="game-frame-select-menu game-theme-scrollbar"
                    style={menuStyle}
                    role="listbox"
                >
                    <div className="game-frame-select-options">
                        {options.map((option, index) => {
                            const optionValue = option.props.value;

                            const selected =
                                String(optionValue) ===
                                String(value);

                            return (
                                <button
                                    key={
                                        option.key ??
                                        String(optionValue) ??
                                        index
                                    }
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    className={`
                                        game-frame-select-option
                                        ${
                                            selected
                                                ? "is-selected"
                                                : ""
                                        }
                                    `}
                                    onClick={() =>
                                        selectOption(option)
                                    }
                                >
                                    {option.props.children}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}


function FrameShimmer({
    children,
    className = "",
    ...props
}) {
    return (
        <button
            className={`
                game-frame-shimmer
                p-ui-xxs
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}


function FrameSlider({
    children,
    className = "",
    ...props
}) {
    return (
        <input
            className={`
                lobby-slider-weight
                ${className}
            `}
            type="range"
            {...props}
        />
    );
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
    Select: FrameSelect,
    Slider: FrameSlider,
    ContrastBtn: FrameContrastButton,
    ContrastInput: FrameContrastInput,
    Shimmer: FrameShimmer,
})
export default {FullScreen, Frame}

