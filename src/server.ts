import net from "net";
import path from "path";

import dotenv from "dotenv";

import { normalizeAddress, normalizeSocketAddress, onServerError } from "./utils";
import { Client, History } from "./types";
import { randomInt } from "crypto";

const __rootdir: string = path.join(__dirname, "..");

dotenv.config({ path: path.join(__rootdir, "config", "server.env") });

const port: number = Number.parseInt(process.env.PORT || "9000");
const host: string = process.env.HOST || "localhost";

const clients: Client[] = [];
const history: History[] = [];

const server: net.Server = net.createServer();

const get_regexp = new RegExp(/^\/get\s?(.*)/g);
const cast_regexp = new RegExp(/^\/cast\s?(.*)/g);
const list_regexp = new RegExp(/^\/list/g);
const rename_regexp = new RegExp(/^\/rename\s?(.*)/g);
const hs_regexp = new RegExp(/^hand-shake\s?(.*)/g);

server.on("connection", (socket: net.Socket) => {
    // log client connection
    console.log(`new client ${ normalizeSocketAddress(socket) } connected.`);

    // store client connections
    clients.push({ name: "unknown", socket });
    
    broadcast(`${normalizeSocketAddress(socket)} joined the server.`, socket);

    socket.on("data", (data: Buffer) => {
        const payload: string = data.toString();
        console.log("received:", payload);

        archive(data, payload);
        
        if (payload === "exit") {
            broadcast(`${normalizeSocketAddress(socket)} left the server.`, socket);
            socket.end("bye");
        } else if (payload.startsWith("/get")) {
            console.log("return a file");
        } else if (payload.startsWith("/cast")) {
            const match = cast_regexp.exec(payload);
            if (match) {
                broadcast(match[1].trim(), socket);
            }
        } else if (payload.startsWith("/list")) {
            socket.write("# USERS");
            clients.forEach((v, index) => {
                    if (v.socket === socket) return;
                    socket.write(`${index}. ${v.name}\n`);
                })
        } else if (payload.startsWith("/rename")) {
            const match = rename_regexp.exec(payload);
            if (match) {
                const client = clients.filter((v) => (v.socket === socket))[0];
                client.name = match[1].trim();
            }
        } else if (payload.startsWith("hand-shake")) {
            const match = hs_regexp.exec(payload);
            console.log(match);
            if (match) {
                const index: number = clients.findIndex((v) => (v.socket === socket));
                if (index >= 0) {
                    clients[index].name = match[1].trim();
                    socket.write(`Hello ${clients[index].name}`);
                }
            }
        }
    });

    socket.on("drain", () => {
        console.log("write buffer is empty now... you can resume the writable stream");
    });

    socket.on("ready", () => {
        console.log("connection is ready!");
    });

    socket.on("timeout", () => {
        console.warn("socket timeout");
    });

    socket.on("end", () => {
        console.log(`client ${ normalizeSocketAddress(socket) } connection ended.`);
    });

    socket.on("close", (had_error: boolean) => {
        console.log(`client ${ normalizeSocketAddress(socket) } connection closed.`);
        disconnect(socket);
        if (had_error) {
            socket.destroy();
        }
    });

    socket.on("error", (err: Error) => {
        console.error(err);
        disconnect(socket);
    });

    // FUNCTIONS
    function disconnect(s: net.Socket): Client | undefined {
        const index = clients.findIndex((v) => v.socket === s);
        if (index === -1) return;
        return clients.splice(index, 1)[0];
    }
    
    function broadcast(message: string, socket: net.Socket): void {
        clients.filter((v) => v.socket !== socket)
            .forEach((v) => {
                v.socket.write(message);
            });
    }

    function archive(data: Buffer, message: string): void {
        history.push({ timestamp: new Date(), send_by: normalizeSocketAddress(socket), message, data });
    }

    function unarchive(): void {
        history.forEach((h: History) => {
            socket.write(`${h.send_by} > ${h.message}`);
        })
    }
})

server.on("close", (had_error: boolean) => {
    console.info("server closed!");
    process.exit((had_error) ? -1 : 0);
});

server.on("error", onServerError(server));

server.listen(port, host, () => {
    const address: string = normalizeAddress(server.address());
    console.info(`server listening to ${ address }`);
});
