import frame from "../../shared/frame";
import game_ui from "../game_ui"


export default function({game, onSelect, onClose}){
    return (
        <div className="absolute inset-0 size-full bg-overlay text-text
            flex justify-center items-center z-10"
            onClick={onClose}
        >

            <frame.Frame.Box
                className="w-[80%] max-w-[600px]"
                insideBoxClassName="grid grid-cols-2 gap-[35px]"
                header="Pick A Player:"
                onClick={(e) => e.stopPropagation()}
            >
                {game.players.map((player, player_index) => (
                    !player.deck &&
                    <game_ui.PlayerStripLabel
                        player={player}
                        hoverEffect={true}
                        onClick={() => onSelect({player_index})}
                        className={"cursor-pointer"}
                    />
                ))}
            </frame.Frame.Box>
        </div>
    )
}
