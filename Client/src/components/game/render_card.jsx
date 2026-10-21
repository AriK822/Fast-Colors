import "./style/card.css"
import { motion } from "motion/react"

import defaultOverlay from "../../assets_staging/cards/base_norm9.png"
import wildPlus2Colored from "../../assets_staging/cards/base_wild3.png"
import chooseBaseColor from "../../assets_staging/cards/base_choose_color.png"
import skipNextPlaye from "../../assets_staging/cards/block_next.png"
import cardBackSide from "../../assets_staging/cards/Fast-Colors2.png"
import blockSelectedPlayer from "../../assets_staging/cards/block_selected.png"
import wildRotateColored from "../../assets_staging/cards/invert.png"
import SpyEyeColored from "../../assets_staging/cards/spy_eye.png"
import WildDraw4 from "../../assets_staging/cards/base_wild_choose_color.png"
import Joker from "../../assets_staging/cards/joker.png"
import Reverse from "../../assets_staging/cards/reverse.png"
import SelectedDraw1 from "../../assets_staging/cards/selected_draw_1.png"
import GoldenRose from "../../assets_staging/cards/golden_rose3.png"


const ovrelayMap = {
    "default_overlay": defaultOverlay,
    "wild_plus2_colored": wildPlus2Colored,
    "choose_base_color": chooseBaseColor,
    "skip_next_player": skipNextPlaye,
    "card_back_side": cardBackSide,
    "block_selected_player": blockSelectedPlayer,
    "wild_rotate_colored": wildRotateColored,
    "spy_eye_colored": SpyEyeColored,
    "wild_plus4": WildDraw4,
    "joker": Joker,
    "reverse": Reverse,
    "selected_draw_1": SelectedDraw1,
    "golden_rose": GoldenRose,
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
    rainbow = false,

    ...props
}){
    return (
        <div 
            className={`render-cards--card pointer
                ${rainbow && "game-rainbow-border"}
                ${onclick_enabled && "render-cards--clickable"} 
                ${className}`}
            style={{
                background: base_color,
                width,
                aspectRatio: "9/16",
                // height: width * (1280/720),
                filter: grayscale ? "grayscale(0%)" : "",
                // transform: grayscale ? "translateY(10px)" : "",
                ...style
            }}
            onClick={() => {if(onclick_enabled){onclikc_callback()}}}

            {...props}
        >
            {overlay_image.map((overlay_id, i) => (
                <img 
                    key={i}
                    src={ovrelayMap[overlay_id]} 
                    alt="card-image"
                    className="w-full"
                    style={{zIndex:i+1}}
                />
            ))
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


export default motion.create(card)

