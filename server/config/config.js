const config = {
    app:{
        port:8080,
        expose_host: false, // localhost or 0.0.0.0
        debug:true,
        test_delay:0,
    },

    game:{
        bot_play_delay:1500,
        game_end_kick_delay:30*1000,
        max_history_cards:5,
    },

    lobby:{
        disconnected_lobby_kick_timeout:30*1000,
    },

    // default values are stored in game_options.js
    game_options_validation:{
        max_bots:10,
        max_total_game_players:10,
        min_total_game_players:2,
        min_init_deck_size:3,
        max_init_deck_size:15,
        min_max_draws_per_turn:1,
        max_max_draws_per_turn:10,
        turn_timers:[5, 10, 15, 20, 25, 30, 45, 60, 120],
        min_weight:1,
        max_weight:100,
        min_norm_num:1,
        max_norm_num:50,
    },

    player:{
        min_name_length:4,
    },

    cards:{
        default_base_colors:["#f76c57", "#58ed80", "#34a8eb", "#ede158"],
    }
}

export default config
