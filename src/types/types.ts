import { Socket } from "net";

export interface ServerError extends Error {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    errno?: number;
    syscall?: string;
    address?: string;
    port?: number;
}

export interface Client {
    name: string;
    address: string;
    socket: Socket;
}

export interface History {
    timestamp: Date;
    send_by: string;
    message: string;
    data: Buffer;
}
