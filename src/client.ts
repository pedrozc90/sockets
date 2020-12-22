import net from "net";
import path from "path";
import fs from "fs";
import readline from "readline";

import dotenv from "dotenv";
import { normalizeInt, onClientError } from "./utils";
import { randomInt } from "crypto";

const root_dir: string = path.join(__dirname, "..");
const config_dir: string = path.join(root_dir, "config");
const assets_dir: string = path.join(root_dir, "assets/downloads");
const output_dir: string = path.join(root_dir, "assets/downloads");
if (!fs.existsSync(assets_dir)) fs.mkdirSync(assets_dir);
if (!fs.existsSync(output_dir)) fs.mkdirSync(output_dir);

dotenv.config({ path: path.join(config_dir, "client.env") });

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
    const header: string = data.slice(0, 8).toString().trim();
    if (header === "file") {
        const size: number | undefined = normalizeInt(data.slice(8, 16).toString());
        const filename: string | undefined = data.slice(16, 144).toString().trim();
        if (size === undefined || filename === undefined) return;
        
        const content: Buffer = data.slice(144, -1);

        fs.writeFileSync(path.join(output_dir, filename), content, { flag: "w" });
    } else {
        const content: string = data.toString();
        console.info(`[${new Date().toISOString()}]`, "[SERVER]", content);
    }
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
