export const CardType = Object.freeze({
    norm: "norm",
    wild: "wild",
})



export const REGISTERED_CARDS = {
    // Key: card or card group id,  Value: Array([card_object])
    norm_base_4_colors: makeNormalCards(),
}



export function MakeCard({
    id, 
    type,

    rednered_text, 
    base_color, 
    overlay_image, 

    allowed_to_play_func, 
    place_func,

    choice=null,
}){
    return {
        id, // Ids should follow: type-uniqueID, For CardType.norm: norm-{color}&{number}
        type,

        rednered_text,
        base_color, // null if allowed on any color, else color_id
        overlay_image,
        // Redner order: Base color -> Overlay -> Text

        allowed_to_play_func,
        place_func,

        choice,
    }

}



export function makeNormalCards(
    nrom_nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    norm_colors = ["#f76c57", "#58ed80", "#34a8eb", "#ede158"],
    weight = 1,
){
    const normal_cards = [];

    norm_colors.forEach((this_base_color) => {
        nrom_nums.forEach((nn) => {

            const allowed_to_play_func = (game) => {
                if (game.cards_to_take > 0){
                    return false;
                }
                if (game.base_color == this_base_color){
                    return true;
                }
                const [ctype, cid] = game.current_card.id.split("-")
                let cnum = null;
                if (ctype == "norm"){cnum = cid.split("&")[0]}
                if (cnum == nn){
                    return true;
                }
                return false;
            }

            const place_func = (game) => {
                game.base_color = this_base_color;
                game.turn = (game.turn + game.direction) % game.players.length;
                game.cards_taken_in_this_turn = 0;
            }

            const this_card = MakeCard({
                id:`${CardType.norm}-${this_base_color}&${nn}`,
                type:CardType.norm,
                rednered_text:nn,
                base_color:this_base_color, // RGB or CSS rendered color value
                overlay_image:"default_overlay.png",
                allowed_to_play_func: allowed_to_play_func,
                place_func: place_func,
                choice:null,
            })

            normal_cards.push(
                {
                    card: this_card,
                    weight: weight,
                }
            )

        })
    })

    return normal_cards;
}

// To DO:
// Wild: +2, +4
// Magic: Choose new color, skip, rotate
