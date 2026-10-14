import "./lobby_ui.css"
import ui from "../shared/_ui"
import { useState } from "react"
import {motion} from "motion/react"
import { Countdown } from "../../utils/hooks/timer_hooks"
import Loader from "../loaders/_loaders"


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
            <span className="lobby-chat-player-name">
                {msg[1]}: 
            </span>
            &nbsp; {msg[2]}
            </>
        }
        </div>
    )
}


function PlayerLabel({player, 
    botName, botKick,
    hasKick, kickFunc, kickContent="Kick", kickDisabled,
    owner,
    className, ...props}){

    if (!player && !botName) return

    if(botName){
        return (
            <ui.Frame.Label 
                className={`relative flex flex-row gap-ui-xs !px-ui-lg w-full
                    items-center ui-text ${className}`}
                {...props}
            >
                <ui.Frame.Avatar 
                    letter={botName[0].toLocaleUpperCase()} 
                />
                <div className="w-full truncate">
                    <div className="text-lg truncate">
                        {botName}
                    </div>
                    <div 
                        className="text-xs opacity-80 "
                        style={{color:`var(--theme-bot-text)`}}
                    >
                        Bot
                    </div>
                </div>

                {botKick && 
                    <button
                        className="player-kick-btn 
                        p-ui-xxs text-sm"
                        onClick={botKick}
                    >
                        Remove
                    </button>
                }
            </ui.Frame.Label>
        )
    }

  function KickTimer({target_time}){
    if (!target_time) return
    return <span>kicking in <Countdown targetTime={target_time} /></span>
  }

    const first_letter = String(player.name[0]).toLocaleUpperCase();
    const connection_status_token = player.connection_status == "online"
        ? "--theme-online-text"
        : "--theme-offline-text"

    return (
        <ui.Frame.Label 
            className={`relative flex flex-row gap-ui-xs !px-ui-lg w-full
                 items-center ui-text ${className}`}
            {...props}
        >
            <ui.Frame.Avatar 
                letter={first_letter} 
            />
            <div className="w-full truncate">
                <div className="text-lg truncate">
                    {player.name}
                    {owner && "👑"}
                </div>
                <div 
                    className="text-xs opacity-80 "
                    style={{color:`var(${connection_status_token})`}}
                >
                    {player.connection_status}
                    {player.disconnect_expires_at && ", "}
                    <KickTimer target_time={player.disconnect_expires_at} />
                </div>
            </div>

            {hasKick && 
                <button
                    className="player-kick-btn 
                    p-ui-xxs text-sm"
                    onClick={kickFunc}
                    disabled={kickDisabled}
                >
                    {kickContent}
                </button>
            }
        </ui.Frame.Label>
    )
}


function StartGameButton({
    children = "Start Game",
    className = "",
    onClick,
    disabled,
    ...props
}) {
    return (
        <button
            className={`start-game-btn ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}



function FrameJoinLobbyInfo({
    lobby, onClick, 
    disabled, loadingAnimation,
    className, ...props
}){
    if (!lobby) return

    return (
        <div
            className={`frame-join-lobby-holder cursor-pointer
                ui-text relative 
                ${disabled && "frame-join-lobby-holder-loading"}
                ${className}`}
            onClick={!disabled && onClick}
            {...props}
        >
            {loadingAnimation &&
                <div
                    className="absolute 
                        left-0 right-0 top-0 bottom-0"
                >
                    <Loader.Spinner />
                </div>
            }
            <div className="flex flex-col gap-ui-xs">
                <div className="flex flex-row justify-between gap-ui-md">
                    <p className="frame-label text-sm truncate w-[60%] md:w-fit">
                        <span className="opacity-[85%] font-game-thin">
                            {lobby.id}
                        </span>
                    </p>
                    <div className="flex flex-row gap-ui-xxs truncate">
                        <p className="frame-label-soft">👤{lobby.players}</p>
                        <p className="frame-label-soft">🤖{lobby.bots}</p>
                    </div>
                </div>
                <div>
                    <span className="opacity-[60%] tracking-widest text-xs ">
                        OWNER
                    </span>
                    <span className="text-xl">
                        {" "}{lobby.owner}
                    </span>    
                </div>
            </div>
        </div>
    )
}


function BasicCardObj({
    card_title, card_desc, selected, onClick,
    className, ...props
}){
    const [descComponent, setDescComponent] = useState(null);

    return (<>
        {descComponent}
        <div className={`flex flex-row p-ui-xs px-ui-md
            lobby-basic-card-obj truncate 
            ${selected && "lobby-basic-card-obj-selected"}
            ${!selected && "opacity-50"}
            ${className}`}
            onClick={onClick}
            {...props}    
        >
            <button className="w-full cursor-pointer" >
                {card_title}
            </button>
            <button
                className="lobby-show-card-desc shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                    setDescComponent(
                        <CardDescriptionViewer
                            title={card_title}
                            description={card_desc}
                            onClose={() => setDescComponent(null)}
                        />
                    ) 
                }}
            >
                ?
            </button>
        </div>
    </>)
}


function CardDescriptionViewer({ title, description, onClose }) {
    return (
        <div
            className="card-desc-overlay fixed inset-0 z-20 flex items-center justify-center p-ui-md"
            onClick={onClose}
        >
            <div
                className="card-desc-box relative w-full max-w-md p-ui-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="card-desc-title mb-ui-sm">
                    {title}
                </h2>

                <div className="card-desc-divider mb-ui-md" />

                <p className="card-desc-text">
                    {description}
                </p>

                <button
                    className="card-desc-close absolute top-ui-xs right-ui-xs flex items-center justify-center"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}


export default {
    ChatMsg, 
    PlayerLabel: motion.create(PlayerLabel), 
    Start:StartGameButton,
    JoinLobbyInfo: motion.create(FrameJoinLobbyInfo),
    BasicCardObj,
    CardDescriptionViewer,
}
