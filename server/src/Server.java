import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.logging.Logger;

public class Server {

    private static final Logger log = Logger.getLogger(Server.class.getSimpleName());

    private static final int PORT = 4000;

    public static void main(String[] args) {
        init(PORT);
    }

    public static void init(int port) {
        try (ServerSocket server = new ServerSocket(port)) {
            if (!server.isBound()) {
                server.bind(new InetSocketAddress("127.0.0.1", port));
            }
            log.info("Server is listening to port " + port);

            while (true) {
                try (Socket socket = server.accept()) {
                    log.info("Client connected to " + socket.getLocalAddress());
                    ServerThread thread = new ServerThread(socket);
                    thread.start();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
