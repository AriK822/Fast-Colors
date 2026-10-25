import "./style/interactive.css"



function Button({
    children,
    className = "",
    onClick,
    ...props
}) {
    return (
        <button
            className={`
                default-btn ui-text text-xl
                cursor-pointer 
                transition transition-duration-hover
                truncate p-ui-sm
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}


export default {Button}
