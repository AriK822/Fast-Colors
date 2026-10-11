import "./style/game_ui.css"
import RednerCard from "./render_card"
import { motion } from "motion/react"
import Loaders from "../loaders/_loaders";


function PlayerStripLabel({player, className, 
    thisTurn=false, hoverEffect=false, ...props}){
    let status = "";
    let status_color = null;

    if (player.type=="bot"){status="Bot"; status_color="--theme-bot-text"}
    else if (player.game_status=="left"){status = "Left"; status_color="--theme-left-text"}
    else if (player.connection_status=="online"){status = "Online"; status_color="--theme-online-text"}
    else if (player.connection_status=="offline"){status = "Online"; status_color="--theme-offline-text"}
    
    return (
        <motion.div
            className={`game-player-strip-label
                ${hoverEffect && "game-player-strip-label-hover"}
                p-ui-xs ui-text truncate px-ui-md
                flex flex-row justify-between
                relative overflow-visible ${className}`}
            {...props}
        >
            <div className="flex flex-col">
            <h1 className="text-md truncate">{player.name}</h1>
            <p
                className="text-xs truncate"
                style={{color:`var(${status_color})`}}
            >{status}</p>
            </div>

            {thisTurn && <Loaders.CircleSpinner />}

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
                        style={{
                            left:`${
                                (i+1) / (player.card_count + 2) * 100
                            }%`,
                            border:`1px solid #ffffff5b`,
                            }}
                        width="25px"
                        overlay_image={"card_back_side.png"}

                        initial={{opacity:0,scale:0.7,y:-20}}
                        animate={{opacity:1,scale:1,y:0}}
                    />
                ))}
            </div>
        </motion.div>
    )
}


function ChatMsg({msg, className, ...props}){
    if (!msg) return (<></>)

    return (            
        <div 
            className={`text-md p-ui-xxs text-sm leading-snug break-words ${className}`} 
            {...props}
        >
        {msg[0] === "server-log" ?
            <span className="opacity-50 itali">
                {msg[1]}
            </span>
        : 
            <>
            <span className="game-chat-player-name">
                {msg[1]}: 
            </span>
            &nbsp; {msg[2]}
            </>
        }
        </div>
    )
}


export default {
    PlayerStripLabel: PlayerStripLabel,
    ChatMsg,
}
