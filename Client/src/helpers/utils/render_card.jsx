import defaultOverlay from "../../assets/dafault_overlay.png"
import "./card.css"

const ovrelayMap = {
    "default_overlay.png": defaultOverlay,
}

function card({
    rednered_text,
    base_color,
    overlay_image,

    width=150,
    grayscale=false,
    onclikc_callback = null,
    onclick_enabled = false,
}){
    return (
        <div 
            className="render-cards--card pointer"
            style={{
                background: base_color,
                width,
                height: width * (1280/720),
                filter: grayscale ? "grayscale(60%)" : "",
                border: !grayscale ? "5px solid lime" : "",
                // transform: grayscale ? "translateY(10px)" : "",
            }}
            onClick={() => {if(onclick_enabled){onclikc_callback()}}}
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

