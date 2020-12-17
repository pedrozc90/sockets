import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.logging.Logger;

public class Server {

    private static final Logger log = Logger.getLogger(Server.class.getSimpleName());

    private ServerSocket server;
    private static boolean alive = true;

    public Server(int port) {
        try {
            server = new ServerSocket(port);
            log.info("Server is listening to port " + port);
        } catch (IOException e) {
            log.severe("Unable to create server socket on port " + port);
            System.exit(-1);
        }

        while (alive) {
            try {
                Socket clientSocket = server.accept();
                ServerThread thread = new ServerThread(clientSocket);
                thread.start();
            } catch (IOException e) {
                log.severe("Exception encountered on accept. Ignoring...");
                e.printStackTrace();
            }
        }

        stop();
    }

    private void stop() {
        try {
            server.close();
            alive = false;
        } catch (Exception e) {
            log.severe("Unable to stop server");
            System.exit(-1);
        }
    }

    public static void main(String[] args) throws IOException {
        new Server(9000);
    }

}
