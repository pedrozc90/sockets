import net from "net";
import path from "path";
import readline from "readline";

import dotenv from "dotenv";
import { onClientError } from "./utils";
import { randomInt } from "crypto";

dotenv.config({ path: path.join(__dirname, "../config", "client.env") });

const port: number = Number.parseInt(process.env.PORT || "9000");
const host: string = process.env.HOST || "localhost";
const name: string = process.env.NAME || `node-${ randomInt(1000) }`;

const prompt: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client: net.Socket = new net.Socket({
    // fd?: number;
    // allowHalfOpen: true,
    readable: true,
    writable: true
});

client.connect({ port, host }, () => {
    console.info(`connection established with ${client.remoteAddress}:${client.remotePort}`);

    client.write(`hand-shake ${ name }`);

    prompt.addListener("line", (input: string) => {
        client.write(input);
    });
});

client.on("data", (data: Buffer) => {
    console.info("server:", data.toString());
});

client.on("end", () => {
    console.info("connection ended.");
});

client.on("timeout", () => {
    console.info("connection timeout.");
});

client.on("close", (had_error: boolean) => {
    console.info("connection closed.");
    if (had_error) {
        client.destroy();
        process.exit(1);
    } else {
        process.exit(0);
    }
});

client.on("error", onClientError(client));
