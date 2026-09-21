import express from 'express';
import { createServer } from "http";
import { attachSocketIO, getIO } from './socket/socket_init.js';
import config from "./config/config.js"
import dotenv from 'dotenv';
dotenv.config();

// Middleware
import cookieParser from 'cookie-parser';
import session from "express-session";

// Routes
import Lobbyhandlers from "./socket/handlers.js"


const app = express();
const HttpServer = createServer(app)
attachSocketIO(HttpServer)
const io = getIO();
const port = config.app.port;

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: "auto",
    },
});

app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware)

io.engine.use(sessionMiddleware)
Lobbyhandlers(io)


HttpServer.listen(port, () => {
  console.log(`Fast colors listening at http://localhost:${port}`);
});
