import config from "../config/config.js"


export function addBotStartGameMsg(game, weight=config.gameChat.startGameWeight){
    if (!config.gameChat.allowBotMessages) return
    let sent_msgs = 0;
    game.players.map((player, i) => {
        if (player.type == "bot")
            if (Math.random() < weight){
                game.chat.push(["player", player.name, pickRandMsg(StartGameBotMsgs)])
                sent_msgs += 1;
                if (sent_msgs > config.gameChat.maxSentMsgs) return
            }
    })
}


export function addBotEndGameMsg(game, weight=config.gameChat.endGameWeight){
    if (!config.gameChat.allowBotMessages) return
    let sent_msgs = 0;
    game.players.map((player, i) => {
        if (player.type == "bot")
            if (Math.random() < weight){
                game.chat.push(["player", player.name, pickRandMsg(EndGameBotMsgs)])
                sent_msgs += 1;
                if (sent_msgs > config.gameChat.maxSentMsgs) return
            }
    })
}


export function addBotWinnerGameMsg(game, weight=config.gameChat.winnerWeight){
    if (!config.gameChat.allowBotMessages) return
    if (game.winner.type == "bot" && Math.random() < weight)
        game.chat.push(["player", game.winner.name, pickRandMsg(WinnerBotMsgs)])
}


export function addBotUnoStateGameMsg(game, weight=config.gameChat.unoStateWeight){
    if (!config.gameChat.allowBotMessages) return
    if (game.players[game.turn].type == "bot" && 
        game.players[game.turn].deck.length == 1 && 
        Math.random() < weight)
        game.chat.push(["player", game.players[game.turn].name, pickRandMsg(UnoStateBotMsgs)])
}


export function addBotRandomGameMsg(game, weight=config.gameChat.randomMsgWeight){
    if (!config.gameChat.allowBotMessages) return
    const bots = game.players.filter((player) => (player.type == "bot"));
    if (bots.length > 0 && Math.random() < weight)
        game.chat.push([
            "player", 
            bots[Math.floor(Math.random() * bots.length)].name, 
            pickRandMsg(RandomBotMsgs)
        ])
}



function pickRandMsg(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

const StartGameBotMsgs = [
    "Good luck everyone!",
    "This game is already over!",
    "theres no way im winning this :(",
    "you guys are cooked btw",
    "gl gl, dont disappoint me",
    "alr who's getting destroyed first",
    "bro i just joined 😭",
    "LETS GOOOOO",
    "pls let me win ONE game",
    "I have a bad feeling abt this...",
    "everyone ready? no? too bad",
    "time to ruin some friendships",
    "ok ok lets do this",
    "im locked in fr",
    "watch me lose in 30 seconds",
    "may the luckiest player win 🙏",
    "nah id win",
    "here we go again 💀",
    "yall better be ready",
    "I swear if I get bad cards again",
];

const EndGameBotMsgs = [
    "GG everyone!",
    "GG",
    "yeah sure",
    "Byeeee",
    "wth was this game😭",
    "ggs, that was actually fun",
    "rematch when??",
    "nah im not recovering from that 💀",
    "finally its over lmao",
    "that was personal btw",
    "well played everyone :)",
    "im gonna pretend that never happened",
    "WHAT WAS THAT ENDING",
    "ok that was kinda wild",
    "bro this game hates me",
    "gg wp, no complaints",
    "I need a break after that one",
    "not my proudest performance ngl",
    "someone explain what just happened",
    "aight im out ✌️",
];

const UnoStateBotMsgs = [
    "UNO!",
    "You guys are done!",
    "UNOOO",
    "one card left...",
    "this is stressful💔",
    "OH WAIT I HAVE ONE CARD",
    "somebody stop them rn 😭",
    "ONE MORE CARD LETS GOOO",
    "dont you DARE make me draw",
    "im actually shaking rn 💀",
    "bro is one card away from freedom",
    "PLEASE dont have a skip",
    "its getting a lil too serious",
    "yall saw nothing",
    "UNO UNO UNO",
    "im not losing this one. nope.",
    "nah this is rigged 😭",
    "one card... stay calm...",
    "EVERYONE TARGET THEM NOW",
    "wait wait WAIT",
];

const WinnerBotMsgs = [
    "I won!",
    "Im the winner!",
    "GG guys",
    "easy!",
    "this was hard!",
    "good luck next time!",
    "I just got lucky!",
    "Not luck at all",
    "NO WAYYYYY",
    "LETS GOOOOOO 🥳",
    "ez clap",
    "I DID NOT EXPECT THAT 💀",
    "finally, my time has come",
    "ggs everyone, well played",
    "I knew I had it in me",
    "nah that was pure luck ngl",
    "WHO'S NEXT",
    "that last move was CLEAN",
    "im actually kinda proud of that",
    "YALL GOT COOKED 😭",
    "gg wp, that was close",
    "dont worry guys, you'll get me next time",
    "bro i was NOT supposed to win",
    "CALCULATED. TOTALLY CALCULATED.",
    "okay okay I'll admit that was fun",
];

const RandomBotMsgs = [
    "This is fun",
    "Come onnn fasterrr!!!",
    "whoa!",
    "Im really enjoying this game!",
    "bro what are these cards 💀",
    "im just here for the chaos",
    "hmmmmm interesting",
    "nahhh no way",
    "anyways",
    "this game is lowkey addictive",
    "WAIT WHAT",
    "im chilling 😌",
    "somebody cook rn",
    "my brain has left the chat",
    "why is everyone so quiet lol",
    "I have absolutely no plan",
    "HELP 😭",
    "we ball",
    "this is getting personal",
    "respectfully, WHAT",
];

