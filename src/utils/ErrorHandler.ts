import { Server, Socket } from "net";
import { ServerError } from "../types";

/**
 * Event listener for HTTP server "error" event.
 * @param error
 */
export function onServerError(server: Server): (error: ServerError) => void {
    let info = server.address();
    let port = (!info) ? "???" : (typeof info === "string") ? info : info.port;

    return (error: ServerError) => {
        if (error.syscall !== "listen") {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`Port ${port} requires elevated privileges`);
                process.exit(1);
                // break;
            case "EADDRINUSE":
                console.error(`Port ${port} is already in use`);
                process.exit(1);
                // break;
            default:
                throw error;
        }
    }
}

export function onClientError(socket: Socket): (error: ServerError) => void {
    return (error: ServerError) => {
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "ECONNRESET":
                console.error("Server connection reset.");
                process.exit(1);
            default:
                throw error;
        }
    }
}
