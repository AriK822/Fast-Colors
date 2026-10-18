import frame from "../../shared/frame";
import game_ui from "../game_ui"
import { motion } from "motion/react";


export default function({game, onSelect, onClose}){
    return (
        <div className="absolute inset-0 size-full bg-overlay text-text
            flex justify-center items-center z-90"
            onClick={onClose}
        >
        <motion.div
            className="w-[80%] max-w-[600px]"
            initial={{scale:0.3, opacity:0.3}}
            animate={{scale:1, opacity:1}}
        >
            <frame.Frame.Box
                className="w-full"
                insideBoxClassName="grid grid-cols-2 gap-[35px]"
                header="Pick A Player:"
                onClick={(e) => e.stopPropagation()}
            >
                {game.players.map((player, player_index) => (
                    !player.deck &&
                    <game_ui.PlayerStripLabel
                        key={player.id}
                        player={player}
                        hoverEffect={true}
                        onClick={() => onSelect({player_index})}
                        className={"cursor-pointer"}
                        blockedCount={game.effects_data?.skip_blocked_players?.[player_index] ?? 0}
                    />
                ))}
            </frame.Frame.Box>
        </motion.div>
        </div>
    )
}
