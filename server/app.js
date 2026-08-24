import express from 'express';
import { createServer } from "http";
import { RedisStore } from "connect-redis";
import redis from "./DB/redis_connection.js"
import { attachSocketIO, getIO } from './socket/socket_init.js';
import dotenv from 'dotenv';
dotenv.config();

// Middleware
import cookieParser from 'cookie-parser';
import useTestDelay from './middleware/test_delay.js';
import session from "express-session";

// Routes
import UsresAPI from "./routes/users.js"
import Lobbyhandlers from "./socket/handlers.js"


const app = express();
const HttpServer = createServer(app)
attachSocketIO(HttpServer)
const io = getIO();
const port = 8080;

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
app.use(useTestDelay(1000))

app.use("/api", UsresAPI);
io.engine.use(sessionMiddleware)
Lobbyhandlers(io)





// app.get('/', (req, res) => {
//   console.log(req.cookies.sessionID);
//   console.log(req.session);

//   req.session = {};

//   res.send('GET request to the homepage');
// });


// app.post('/', (req, res) => {
//   res.send('POST request to the homepage');
// });


HttpServer.listen(port, () => {
  console.log(`Fast colors listening at http://localhost:${port}`);
});
