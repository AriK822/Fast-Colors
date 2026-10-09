import frame from "../../shared/frame";

export default function ({ game, onSelect, onClose }) {
    const colors = game.base_colors;
    const count = colors.length;
    const radius = 100;
    const center = 100;

    function getPoint(angle) {
        const radians = (angle * Math.PI) / 180;

        return {
            x: center + radius * Math.cos(radians),
            y: center + radius * Math.sin(radians),
        };
    }

    function getSlicePath(index) {
        const startAngle = (index / count) * 360 - 90;
        const endAngle = ((index + 1) / count) * 360 - 90;

        const start = getPoint(startAngle);
        const end = getPoint(endAngle);
        const largeArc = 360 / count > 180 ? 1 : 0;

        return [
            `M ${center} ${center}`,
            `L ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            "Z",
        ].join(" ");
    }

    return (
        <div className="absolute inset-0 size-full bg-overlay text-text
            flex justify-center items-center z-10"
            onClick={onClose}
        >

            <frame.Frame.Box
                className="w-[80%] max-w-[600px]"
                header="Pick A Color:"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center p-6">
                    <svg
                        viewBox="0 0 200 200"
                        className="w-full max-w-[280px] aspect-square"
                    >
                        {colors.map((color, i) => (
                            <path
                                key={`${color}-${i}`}
                                d={getSlicePath(i)}
                                fill={color}
                                stroke="white"
                                strokeWidth="0"
                                strokeLinejoin="round"
                                className="cursor-pointer
                                    transition-[filter] hover:brightness-110"
                                onClick={() => onSelect({ base_color: color })}
                            />
                        ))}
                    </svg>
                </div>
            </frame.Frame.Box>
        </div>
    );
}
