import net from "net";
import path from "path";

import dotenv from "dotenv";
import colors from "colors";

import { normalizeAddress, normalizeSocketAddress, onServerError } from "./utils";

dotenv.config({ path: path.join(__dirname, "../config", "server.env") });

const port: number = Number.parseInt(process.env.PORT || "9000");
const host: string = process.env.HOST || "localhost";

const sockets: net.Socket[] = [];

function removeSocket(s: net.Socket): net.Socket | undefined {
    const index = sockets.findIndex((v) => v === s);
    if (index === -1) return;
    return sockets.splice(index, 1)[0];
}

function broadcast(message: string, socket: net.Socket): void {
    sockets.filter((v) => v !== socket)
        .forEach((v) => {
            v.write(message);
        });
}

const messages: { timepstamp: Date, message: string, sender: net.Socket }[] = [];

const server: net.Server = net.createServer();

server.on("connection", (socket: net.Socket) => {
    // log client connection
    console.log(`new client ${ normalizeSocketAddress(socket) } connected.`);

    // store client connections
    sockets.push(socket);
    broadcast(`${normalizeSocketAddress(socket)} joined the server.`, socket);

    socket.on("data", (data: Buffer) => {
        const content: string = data.toString();
        console.log("received:", content);

        messages.push({ timepstamp: new Date(), message: content, sender: socket });
        
        if (content === "exit") {
            broadcast(`${normalizeSocketAddress(socket)} left the server.`, socket);
            socket.end("bye");
        } else {
            socket.write(content.toUpperCase());
        }
    });

    socket.on('drain',function(){
        console.log('write buffer is empty now .. u can resume the writable stream');
        // socket.resume();
    });

    socket.on("ready", () => {
        console.log("connection is ready!");
    });

    socket.on("timeout", () => {
        console.warn("socket timeout");
        // socket.end();
    });

    socket.on("end", () => {
        console.log(`client ${ normalizeSocketAddress(socket) } connection ended.`);
    });

    socket.on("close", () => {
        removeSocket(socket);
        console.log(`client ${ normalizeSocketAddress(socket) } connection closed.`);
    });

    socket.on("error", (err: Error) => {
        console.error(err);
        // const index = sockets.findIndex((v) => v === socket);
        // if (index >= 0) {
        //     sockets.splice(index, 1);
        // }
        // socket.destroy();
    });

    // const flushed: boolean = socket.write('hello\r\n');
    // console.log("flushed:", flushed);
    // if (!flushed) {
    //     socket.pipe(socket);
    // }
})
server.on("close", () => console.info("server closed!"));
server.on("error", onServerError(server));

server.listen(port, host, () => {
    const address: string = normalizeAddress(server.address());
    console.info(`server listening to ${ address }`);
});
