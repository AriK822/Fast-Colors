import { io } from "socket.io-client";
const socket = io({autoConnect: true});

export default socket
