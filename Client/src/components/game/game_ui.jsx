import "./style/game_ui.css"
import RednerCard from "./render_card"
import { AnimatePresence, motion } from "motion/react"
import Loaders from "../loaders/_loaders";
import ui from "../shared/_ui";
import blockedPlayer from "../../assets_staging/blocked.png"


function PlayerStripLabel({player, className, 
    thisTurn=false, hoverEffect=false, winner=false,
    blockedCount=0, showTimer=true,
    ...props}){
    let status = "";
    let status_color = null;

    if (player.type=="bot"){status="Bot"; status_color="--theme-bot-text"}
    else if (player.game_status=="left"){status = "Left"; status_color="--theme-left-text"}
    else if (player.connection_status=="online"){status = "Online"; status_color="--theme-online-text"}
    else if (player.connection_status=="offline"){status = "Offline"; status_color="--theme-offline-text"}

    const render_card_count = player.card_count > 30 ? 30 : player.card_count;
    
    return (
        <motion.div
            className={`game-player-strip-label
                ${hoverEffect && "game-player-strip-label-hover"}
                p-ui-xs ui-text truncate px-ui-md
                flex flex-row justify-between items-center
                relative overflow-visible
                ${player.card_count == 1 && !winner && "game-player-strip-uno-flash"}
                ${winner?.id == player.id && "game-rainbow-border"}
                ${className}`}
            {...props}
        >
            {winner?.id == player.id &&
            <div className="absolute inset-0
                rounded-full overflow-hidden">
                <div className="game-player-strip-shimmer" />
            </div>
            }

            <div className="flex flex-col truncate">
                <h1 className="text-md truncate">
                    {player.name} 
                </h1>
                <p
                    className="text-xs truncate"
                    style={{color:`var(${status_color})`}}
                >{status}</p>
            </div>
    
            <div
                className={`game-strip-label-card-count
                flex justify-center items-center !text-lg
                ${thisTurn && !winner && showTimer &&"game-strip-label-card-count-timer"}`}
            >
                {player.card_count}
                {thisTurn && !winner && !showTimer &&
                <Loaders.CircleSpinner
                    size="32px"
                    className="absolute"
                />
                }
            </div>

            <div
                className="absolute
                top-[85%] left-[50%] -translate-x-1/2 
                max-w-[80%] overflow-visible
                min-w-[30%] max-w-[80%]
                flex flex-row justify-center"
                style={{width:`${22*player.card_count}px`}}
            >
                {Array.from({length:render_card_count}).map((_, i) => (
                    <RednerCard 
                        key={i}
                        className="shrink-0 !absolute -translate-x-1/4"
                        style={{
                            left:`${
                                (i+1) / (render_card_count + 2) * 100
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

            <div
                className="absolute top-0 right-3 left-0 
                    flex justify-end -translate-y-1/2"
            >
                {Array.from({length:blockedCount}).map((_, i) => (
                    <img 
                        key={i}
                        src={blockedPlayer} 
                        className="h-5 w-5 -ml-3 shrink-0" 
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


function PlayerLabel({player, 
    className, thisTurn, activePlayer=false,
    winner=false, ...props}){
    const first_letter = String(player.name[0]).toLocaleUpperCase();
    let status = "";
    let status_color = null;

    if (player.type=="bot"){status="Bot"; status_color="--theme-bot-text"}
    else if (player.game_status=="left"){status = "Left"; status_color="--theme-left-text"}
    else if (player.connection_status=="online"){status = "Online"; status_color="--theme-online-text"}
    else if (player.connection_status=="offline"){status = "Offline"; status_color="--theme-offline-text"}

    return (
        <ui.Frame.Label 
            className={`relative flex flex-row gap-ui-xs !px-ui-lg w-full
                 items-center ui-text 
                 ${winner?.id == player.id && "game-rainbow-border"}
                 ${player.card_count==1 && !winner && "game-player-strip-sidebar-uno-flash"}
                 ${className}`}
            {...props}
        >
            <ui.Frame.Avatar 
                letter={first_letter} 
            />
            <div className="w-full truncate">
                <div className="text-lg truncate">
                    {player.name}
                    {activePlayer &&
                    <ui.Frame.Shimmer
                        className="!p-1 ml-1 !text-xs"
                    >
                        You
                    </ui.Frame.Shimmer>
                    }
                    {winner?.id == player.id &&
                    <ui.Frame.Shimmer
                        className="!p-1 ml-1 !text-xs"
                    >
                        Winner
                    </ui.Frame.Shimmer>
                    }
                </div>
                <div 
                    className="text-xs opacity-80"
                    style={{color:`var(${status_color})`}}
                >
                    {status}
                </div>
            </div>
            <div className="w-auto shrink-0">
                <div className="text-sm  
                    flex flex-row gap-ui-xxs items-center">
                    <RednerCard 
                        className=""
                        width="20px"
                        overlay_image={"card_back_side.png"}
                    />
                    {player.card_count}
                </div>
            </div>

            <AnimatePresence>
            {thisTurn && !winner && (
                <motion.div
                key="turn-spinner"
                className="flex flex-inline"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 18,
                }}
                >
                <Loaders.CircleSpinner />
                </motion.div>
            )}
            </AnimatePresence>

        </ui.Frame.Label>
    )
}


export default {
    PlayerStripLabel: PlayerStripLabel,
    ChatMsg,
    PlayerLabel,
}
