import { createServer } from "http";
import { Server } from "socket.io";


let io;
export function attachSocketIO(HttpServer){
    io = new Server(HttpServer);
}

export function getIO(){
    if (!io){
        throw("IO not attached to HttpServer")
    }
    return io
}


