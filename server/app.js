import express from 'express';
import { createServer } from "http";
import { attachSocketIO, getIO } from './socket/socket_init.js';
import config from "./config/config.js"

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
const host = config.app.expose_host ? "0.0.0.0" : "localhost";

const sessionMiddleware = session({
    secret: config.app.sessionSecret,
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


HttpServer.listen(port, host, () => {
    console.log(`Fast Colors listening at http://${host}:${port}`);
});
