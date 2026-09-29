import "./lobby_ui.css"
import ui from "../shared/_ui"
import { useCountdown } from "../../utils/hooks/timer_hooks"


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
    hasKick, kickFunc, kickContent="Kick", kickDisabled,
    owner,
    className, ...props}){
    if (!player) return

  function KickTimer({target_time}){
    if (!target_time) return
    const time_left = useCountdown(target_time);
    return <span>kicking in {time_left}</span>
  }

    const first_letter = String(player.name[0]).toLocaleUpperCase();
    const connection_status_token = player.connection_status == "online"
        ? "--theme-online-text"
        : "--theme-offline-text"

    return (
        <ui.Frame.Label 
            className={`relative flex flex-row gap-ui-xs !px-ui-lg w-full
                 items-center ${className}`}
            {...props}
        >
            <ui.Frame.Avatar 
                letter={first_letter} 
            />
            <div>
                <div className="text-lg">{player.name}{owner && "👑"}</div>
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
                    className="player-kick-btn absolute 
                    right-ui-lg p-ui-xxs text-sm"
                    onClick={kickFunc}
                    disabled={kickDisabled}
                >
                    {kickContent}
                </button>
            }
        </ui.Frame.Label>
    )
}


export default {ChatMsg, PlayerLabel}
