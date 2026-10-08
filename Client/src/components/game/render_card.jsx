import "./style/card.css"

import defaultOverlay from "../../assets_staging/dafault_overlay.png"
import wildPlus2Colored from "../../assets_staging/wild_plus2_colored.png"
import chooseBaseColor from "../../assets_staging/choose_base_color.png"
import skipNextPlaye from "../../assets_staging/skip_next_player.png"
import cardBackSide from "../../assets_staging/card_back_side.png"
import blockSelectedPlayer from "../../assets_staging/block_selected_player.png"


const ovrelayMap = {
    "default_overlay.png": defaultOverlay,
    "wild_plus2_colored.png": wildPlus2Colored,
    "choose_base_color.png": chooseBaseColor,
    "skip_next_player.png": skipNextPlaye,
    "card_back_side.png": cardBackSide,
    "block_selected_player.png": blockSelectedPlayer,
}

function card({
    rednered_text,
    base_color,
    overlay_image,
    className="",
    style,

    width=150,
    grayscale=false,
    onclikc_callback = null,
    onclick_enabled = false,

    ...props
}){
    return (
        <div 
            className={`render-cards--card pointer ${className}`}
            style={{
                background: base_color,
                width,
                aspectRatio: "9/16",
                // height: width * (1280/720),
                filter: grayscale ? "grayscale(60%)" : "",
                border: !grayscale ? "0px solid lime" : "",
                // transform: grayscale ? "translateY(10px)" : "",
                ...style
            }}
            onClick={() => {if(onclick_enabled){onclikc_callback()}}}

            {...props}
        >
            {overlay_image &&
            <img src={ovrelayMap[overlay_image]} alt="card-image" />
            }

            <span 
                className="render-cards--text"
                style={{color:base_color ?? ""}}
            >
                {rednered_text}
            </span>
        </div>
    )
}


export default card

