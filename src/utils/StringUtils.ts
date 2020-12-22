import { AddressInfo, Socket } from "net";

export function normalizeAddress(info: AddressInfo | string | null): string {
    if (!info) {
        throw new Error("Address not found.");
    };
    return typeof info === "string" ? info : `${ info.family } ${ info.address }:${ info.port }`;
}

export function normalizeSocketAddress(socket: Socket): string {
    return `${ socket.remoteAddress }:${ socket.remotePort }`;
}

export function fill(v: string | number, size: number): string {
    const length: number = (typeof v === "number") ? v.toString().length : v.length;
    if (length > size) return (typeof v === "number") ? v.toString() : v;
    let r: string = "";
    for (let i = length; i < size; i++) {
        r += (typeof v === "number") ? "0" : " ";
    }
    return r + v;
}
