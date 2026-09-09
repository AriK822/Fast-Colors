export const CARD_ID_TO_CARD_OBJ = new Map();


export const CardType = Object.freeze({
    norm: "norm",
    magical: "magical",
    wild: "wild",
})



export const REGISTERED_CARDS = {
    norm_base_4_colors: makeNormalCards(),
}



export function MakeCard(
    id, 
    type, 
    rednered_text, 
    base_color, 
    custom_overlay, 
    allowed_to_play_func, 
    place_func
){
    return {
        id: id, // Ids should follow: type-uniqueID, For CardType.norm: norm-{color}&{number}
        type: type,

        rednered_text: rednered_text,
        base_color: base_color,
        custom_overlay: custom_overlay,
        // Redner order: Base color -> Overlay -> Text

        allowed_to_play_func: allowed_to_play_func,
        place_func: place_func,
    }

}



export function makeNormalCards(
    nrom_nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    norm_colors = {"red":"red", "blue":"blue", "green":"green", "yellow":"yellow"},
    weight = 1,
){
    const normal_cards = [];

    Object.entries(norm_colors).forEach((nco) => {
        const [nc, ncv] = nco;
        nrom_nums.forEach((nn) => {

            const allowed_to_play_func = (game) => {
                if (game.cards_to_take > 0){
                    return false;
                }
                if (game.base_color == nc){
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
                game.base_color = nc;
                game.turn = (game.turn + game.direction) % game.players.length;
                game.cards_taken_in_this_turn = 0;
            }

            const this_card = MakeCard(
                `${CardType.norm}-${nc[0]}&${nn}`,
                CardType.norm,
                nn,
                ncv, // RGB or CSS rendered color value
                "default_base.png",
                allowed_to_play_func,
                place_func,
            )

            normal_cards.push(
                {
                    card: this_card,
                    weight: weight,
                }
            )

            CARD_ID_TO_CARD_OBJ.set(`${CardType.norm}-${nc[0]}&${nn}`, this_card)

        })
    })

    return normal_cards;
}

// To DO:
// Wild: +2, +4
// Magic: Choose new color, skip, rotate
