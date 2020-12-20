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
