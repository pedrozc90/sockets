import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.logging.Logger;

public class TCPServer {

    private static final Logger log = Logger.getLogger(TCPServer.class.getSimpleName());

    private static final int PORT = 9000;
    private static final String HOST = "192.168.0.1";

    public static void main(String[] args) {
        String message;

        try {
            ServerSocket server = new ServerSocket(PORT);
            if (!server.isBound()) {
                server.bind(new InetSocketAddress(HOST, PORT));
            }
            log.info("Listening to port " + server.getInetAddress().getHostAddress() + ":" + server.getLocalPort());

            do {
                Socket socket = server.accept();

                BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));

                DataOutputStream output = new DataOutputStream(socket.getOutputStream());

                message = input.readLine();
                log.info("INPUT: " + message);

                output.writeBytes(message.toUpperCase() + "\n");
            } while (!server.isClosed());
        } catch (IOException e) {
            log.severe(e.getMessage());
            System.exit(-1);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
