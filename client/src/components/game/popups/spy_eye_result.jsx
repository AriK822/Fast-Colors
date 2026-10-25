import frame from "../../shared/frame";
import game_ui from "../game_ui"
import { motion } from "motion/react";
import RenderCard from "../render_card";


export default function({game, onClose, spied_player_index, spied_deck}){
    return (
        <div className="absolute inset-0 size-full bg-overlay text-text
            flex justify-center items-center z-90"
            onClick={onClose}
        >
        <motion.div
            className="flex justify-center items-center"
            initial={{scale:0.3, opacity:0.3}}
            animate={{scale:1, opacity:1}}
        >
            <frame.Frame.Box
                className="w-[80%] max-w-[800px] max-h-[650px]"
                insideBoxClassName="flex flex-wrap gap-ui-ssx
                 shrink-1 min-h-0 game-theme-scrollbar"
                header={<div>{game.players[spied_player_index].name}'s Deck:</div>}
                onClick={(e) => e.stopPropagation()}
            >
                {spied_deck.map((card, i) => (
                    <RenderCard 
                        key={i}
                        className="shrink-0"
                        base_color={card.base_color} 
                        overlay_image={card.overlay_image} 
                        rednered_text={card.rednered_text} 
                        width={80}
                    />
                ))
                }
            </frame.Frame.Box>
        </motion.div>
        </div>
    )
}
