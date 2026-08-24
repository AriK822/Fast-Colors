export class CardType{
    static norm = "norm";
    static magical = "magical";
    static wild = "wild";
}


export class Card{
    constructor(id, type, rednered_text, base_color, custom_overlay, allowed_to_play_func, place_func){
        this.id = id; // Ids should follow: type-uniqueID, For CardType.norm: norm-{color}&{number}
        this.type = type;

        this.rednered_text = rednered_text;
        this.base_color = base_color;
        this.custom_overlay = custom_overlay;
        // Redner order: Base color -> Overlay -> Text

        this.allowed_to_play_func = allowed_to_play_func;
        this.place_func = place_func;

    }

    client_ready(){
        return {
            id : this.id,
            type : this.type,
            rednered_text : this.rednered_text,
            base_color : this.base_color,
            custom_overlay : this.custom_overlay,
        }
    }
}



// default 0-9 4 color UNO colors
export function makeNormalCards(
    nrom_nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    norm_colors = {"red":"red", "blue":"blue", "green":"green", "yellow":"yellow"},
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
                const [ctype, cid] = game.current_card.split("-")
                let cnum = null;
                if (ctype == "norm"){cnum = cid.split("&")[0]}
                if (cnum == nn){
                    return true;
                }
                return false;
            }

            const place_func = (game) => {
                if (!allowed_to_play_func){
                    return false;
                }
                const card_index = game.players[game.turn].cards.indexOf(`${CardType.norm}-${nc[0]}&${nn}`);
                if (card_index == -1){
                    return false;
                }

                game.players[game.turn].cards.splice(card_index, 1);
                game.base_color = nc;
                game.current_card = `${CardType.norm}-${nc[0]}&${nn}`;
                game.turn = (game.turn + game.direction) % game.players.length;
                game.cards_taken_in_this_turn = 0;

                return true;
            }

            normal_cards.push(new Card(
                `${CardType.norm}-${nc[0]}&${nn}`,
                CardType.norm,
                nn,
                ncv, // RGB or CSS rendered color value
                "default_base.png",
                allowed_to_play_func,
                place_func,
            ))

        })
    })

    return normal_cards;
}

// To DO:
// Wild: +2, +4
// Magic: Choose new color, skip, rotate
