export default function({game, onSelect}){
    return (
        <div className="card">
            {game.players.map((player, player_index) => (
                !player.deck &&
                <button 
                    key={player_index}
                    onClick={() => onSelect({player_index})}
                >
                    {player.name}
                </button>
            ))}
        </div>
    )
}
