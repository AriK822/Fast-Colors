import { makeNormalCards } from "./cards.js";


class GameEngine{
    constructor(){
        this.card_classes = {};
    }

    use(card_class) {
        if (Array.isArray(card_class)) {
            card_class.forEach((cs)=>{
                this.card_classes[cs.id] = cs
            })
        } else {
            this.card_classes[card_class.id] = card_class;
        }
    }

    init_game(
        players=[], // [ {id:uuid4 (seesioID), type:player/bot} ]
        init_card_count=7, 
        base_colors={"red":"red", "green":"green", "blue":"blue", "yellow":"yellow"},
        allowed_to_skip_move=true, // Allows players to take cards even if they have a card to play
        max_card_takes=1, // How many crads is a player allowed to take in their turn
        allow_wild_card_stacking=true,
        wild_cards_must_match = false,
        turn_timer = 20, // seconds
    ){
        this.game = {
            turn:0,
            direction:1, // 1 or -1: next_turn = (turn + direction) % players.length
            base_color:Object.entries(base_colors)[0][0],
            cards_to_take:0,
            current_card:this.generate_random_card(),
            players:this.init_players(players, init_card_count),
            cards_taken_in_this_turn:0,
            
            // settings
            base_colors:base_colors,
            allowed_to_skip_move:allowed_to_skip_move,
            max_card_takes:max_card_takes,
            allow_wild_card_stacking:allow_wild_card_stacking,
            wild_cards_must_match:wild_cards_must_match,
            generate_random_card:this.generate_random_card,
        }
    }


    generate_random_card = () => {
        const ids = Object.keys(this.card_classes)
        return ids[Math.floor(Math.random() * ids.length)];
    }


    init_players(player_infp, init_card_count) {
        const players = [];
        for (const p of player_infp){
            players.push({
                id:p.id,
                type:p.type,
                cards: Array.from({ length: init_card_count }, () => this.generate_random_card()),
            })
        }
        return players;
    }


    possible_cards_to_play(){
        const possible_cards = [];
        this.game.players[this.game.turn].cards.forEach((card_id)=>{
            if (this.card_classes[card_id].allowed_to_play_func(this.game)){
                possible_cards.push(card_id);
            }
        })
        return possible_cards;
    }


    take_new_card(){
        const game = this.game;

        if (game.cards_to_take > 0){
            return false;
        }

        if (game.allowed_to_skip_move){
            if (game.cards_taken_in_this_turn < game.max_card_takes){
                game.players[game.turn].cards.push(game.generate_random_card());
                game.cards_taken_in_this_turn += 1;
                if (game.cards_taken_in_this_turn == game.max_card_takes){
                    game.cards_taken_in_this_turn = 0;
                    game.turn = (game.turn + game.direction) % game.players.length;
                }
                return true;
            }
            else {
                return false;
            }
        }
        else {
            if(this.possible_cards_to_play().length > 0){
                return false;
            }
            else{
                if (game.cards_taken_in_this_turn < game.max_card_takes){
                    game.players[game.turn].cards.push(game.generate_random_card());
                    game.cards_taken_in_this_turn += 1;
                    if (game.cards_taken_in_this_turn == game.max_card_takes){
                        game.cards_taken_in_this_turn = 0;
                        game.turn = (game.turn + game.direction) % game.players.length;
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }


    skip_turn(){
        const game = this.game;

        if (game.cards_to_take > 0){
            return false;
        }

        if (game.cards_taken_in_this_turn == 0){
            game.players[game.turn].cards.push(game.generate_random_card());
            game.turn = (game.turn + game.direction) % game.players.length;
            return true;
        }
        else {
            game.cards_taken_in_this_turn = 0;
            game.turn = (game.turn + game.direction) % game.players.length;
            return true;
        }
    }


    timeout_move(){
        const game = this.game;
        if (game.cards_to_take > 0){
            for (let i = 0; i < game.cards_to_take; i++){
                game.players[game.turn].cards.push(game.generate_random_card());
            }
            game.cards_taken_in_this_turn = 0;
            game.turn = (game.turn + game.direction) % game.players.length;
            return true;
        }
        else{
            return this.skip_turn();
        }
    }


    random_move(){
        const game = this.game;
        if (game.cards_to_take > 0){
            for (let i = 0; i < game.cards_to_take; i++){
                game.players[game.turn].cards.push(game.generate_random_card());
            }
            game.cards_taken_in_this_turn = 0;
            game.turn = (game.turn + game.direction) % game.players.length;
            return true;
        }
        else{
            const allowed_cards = this.possible_cards_to_play();
            if (allowed_cards.length > 0){
                const rand_id = allowed_cards[Math.floor(Math.random() * allowed_cards.length)]
                return this.card_classes[rand_id].place_func(game);
            }
            else{
                return this.skip_turn();
            }
        }
    }

}


const engine = new GameEngine();
engine.use(makeNormalCards())
engine.init_game([{id:1, type:"player"},{id:2, type:"bot"}])

console.log(engine.game)
console.log(engine.game.players[0].cards)
console.log(engine.possible_cards_to_play())

console.log(engine.random_move());
console.log(engine.random_move());
console.log(engine.random_move());

console.log(engine.game)
console.log(engine.game.players[0].cards)

// console.log(engine.take_new_card());

// console.log(engine.game)
// console.log(engine.game.players[0].cards)

// console.log(normal_cards[0].place_func(engine.game))

// console.log(engine.game)
// console.log(engine.game.players[0].cards)


