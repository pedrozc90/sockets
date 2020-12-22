import net from "net";
import path from "path";
import fs from "fs";

import dotenv, { config } from "dotenv";

import { normalizeAddress, normalizeSocketAddress, onServerError } from "./utils";
import { Client, History } from "./types";
import { randomInt } from "crypto";

const root_dir: string = path.join(__dirname, "..");
const config_dir: string = path.join(root_dir, "config");
const assets_dir: string = path.join(root_dir, "assets");

dotenv.config({ path: path.join(config_dir, "server.env") });

const port: number = Number.parseInt(process.env.PORT || "9000");
const host: string = process.env.HOST || "localhost";

const clients: Client[] = [];
const history: History[] = [];

const server: net.Server = net.createServer();

const get_regexp = new RegExp(/^\/get\s?(.*)/g);
const cast_regexp = new RegExp(/^\/cast\s?(.*)/g);
const list_regexp = new RegExp(/^\/list\s?(.*)/g);
const rename_regexp = new RegExp(/^\/rename\s?(.*)/g);
const hs_regexp = new RegExp(/^hand-shake\s?(.*)/g);

server.on("connection", (socket: net.Socket) => {

    // store client connections
    clients.push({ name: "unknown", socket });
    
    broadcast(`${normalizeSocketAddress(socket)} joined the server.`, socket);

    socket.on("data", (data: Buffer) => {
        const payload: string = data.toString();
        console.log(`[${new Date().toISOString()}]`, `[${normalizeSocketAddress(socket)}]`, payload);

        archive(data, payload);
        
        if (payload === "exit") {
            return exit();
        } else if (payload.startsWith("/get")) {
            return get_file(payload);
        } else if (payload.startsWith("/cast")) {
            const match = cast_regexp.exec(payload);
            if (!match) return;
            broadcast(match[1].trim(), socket);
        } else if (payload.startsWith("/list")) {
            return list(payload);
        } else if (payload.startsWith("/rename")) {
            return rename(payload);
        } else if (payload.startsWith("hand-shake")) {
            return hand_shake(payload);
        } else if (payload.startsWith("/help")) {
            return help(payload);
        } else {
            socket.write(`Invalid message ${payload}`);
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
    function help(data: string): void {
        console.log("HELP");
    }

    function hand_shake(data: string): void {
        const match = hs_regexp.exec(data);
        if (!match) return;

        const index: number = clients.findIndex((v) => (v.socket === socket));
        if (index >= 0) {
            clients[index].name = match[1].trim();
            socket.write(`Hello ${clients[index].name}`);
        }
    }

    function rename(data: string): void {
        const match = rename_regexp.exec(data);
        if (!match) return;

        const client = clients.filter((v) => (v.socket === socket))[0];
        client.name = match[1].trim();
    }

    function list(data: string): void {
        const match = list_regexp.exec(data);
        if (!match) return;

        if (match[1] === "users") {
            clients.forEach((v, index) => {
                if (v.socket === socket) return;
                socket.write(`${index}. ${v.name}\n`);
            });
        } else if (match[1] === "files") {
            fs.readdirSync(assets_dir).forEach((v, index) => {
                socket.write(`${index}. ${v}\n`);
            });
        }
    }

    function get_file(data: string): void {
        const match = get_regexp.exec(data);
        // if (!match) return;

        const filename = (match) ? match[1] : "video-games-review-6.json";

        const filestream = fs.createReadStream(path.join(assets_dir, filename));

        filestream.on("readable", () => {
            let data_transpered;
            while (data_transpered = filestream.read()) {
                socket.write(data_transpered);
            }
            console.log("READALBE ENDED");
        });

        filestream.on("end", () => {
            socket.write("file was successfully transfered.");
        });
    }

    function exit(): void {
        broadcast(`${normalizeSocketAddress(socket)} left the server.`, socket);
        socket.end("bye");
    }

    function disconnect(s: net.Socket): Client | undefined {
        const index = clients.findIndex((v) => v.socket === s);
        if (index === -1) return;
        return clients.splice(index, 1)[0];
    }
    
    function broadcast(message: string, socket: net.Socket): void {
        console.log(`[${new Date().toISOString()}]`, message);
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
        });
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
