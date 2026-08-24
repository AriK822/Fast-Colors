import { Router } from "express";
import { randomUUID } from "node:crypto";
import { loadAllLobbies } from "../DB/lobby.js";
import withPlayer from "../DB/player_data.js"


const router = Router();


router.post("/set-name", async (req, res) => {
    console.log("REST SESSION:", req.session.id);
    console.log("REST PLAYER:", req.session.player_id);
    
    if (!req.session.player_id){req.session.player_id = randomUUID()}

    await withPlayer(req.session.player_id, async d => {
        d.name = (req.body && req.body.name) ? req.body.name : `Guest${Math.floor(Math.random()*1000)}`
    });

    res.json({});
});


router.get("/load-join-lobby", async (req, res) => {
    const lobbies = await loadAllLobbies();
    res.json({lobbies:lobbies});
});


export default router;
