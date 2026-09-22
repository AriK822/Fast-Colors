export default function({game, onSelect}){
    return (
        <div className="card">
            {game.base_colors.map((base_color, i) => (
                <button 
                    key={i}
                    style={{background:base_color}}
                    onClick={() => onSelect({base_color})}
                >
                    Pick
                </button>
            ))}
        </div>
    )
}
