import "./style/game_ui.css"
import RednerCard from "./render_card"
import { motion } from "motion/react"


function PlayerStripLabel({player, className, distance, ...props}){
    let status = "";
    let status_color = null;

    if (player.type=="bot"){status="Bot"; status_color="--theme-bot-text"}
    else if (player.game_status=="left"){status = "Left"; status_color="--theme-left-text"}
    else if (player.connection_status=="online"){status = "Online"; status_color="--theme-online-text"}
    else if (player.connection_status=="offline"){status = "Online"; status_color="--theme-offline-text"}
    
    return (
        <div
            className={`game-player-strip-label 
                p-ui-xs ui-text truncate px-ui-md
                relative overflow-visible ${className}`}
            style={{"--i":Math.abs(distance)}}
            {...props}
        >
            <h1 className="text-md truncate">{player.name}</h1>
            <p
                className="text-xs truncate"
                style={{color:`var(${status_color})`}}
            >{status}</p>

            <div
                className="absolute
                top-[85%] left-[50%] -translate-x-1/2 
                max-w-[80%] overflow-visible
                min-w-[30%] max-w-[80%]
                flex flex-row justify-center"
                style={{width:`${22*player.card_count}px`}}
            >
                {Array.from({length:player.card_count}).map((_, i) => (
                    <RednerCard 
                        key={i}
                        className="shrink-0 !absolute -translate-x-1/4"
                        style={{left:`${
                            (i+1) / (player.card_count + 2) * 100
                        }%`}}
                        width="25px"
                        overlay_image={"card_back_side.png"} 
                    />
                ))}
            </div>
        </div>
    )
}


export default {
    PlayerStripLabel: motion.create(PlayerStripLabel),
}
