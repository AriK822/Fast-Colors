import frame from "../../shared/frame";
import game_ui from "../game_ui"
import { motion } from "motion/react";
import RenderCard from "../render_card";


export default function({game, onClose, spied_player_index, spied_deck}){
    return (
        <div className="absolute inset-0 size-full bg-overlay text-text
            flex justify-center items-center z-10"
            onClick={onClose}
        >
        <motion.div
            className="w-[80%] max-w-[600px] max-h-[80%]"
            initial={{scale:0.3, opacity:0.3}}
            animate={{scale:1, opacity:1}}
        >
            <frame.Frame.Box
                className="w-full"
                insideBoxClassName="flex flex-wrap gap-ui-ssx game-theme-scrollbar"
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
