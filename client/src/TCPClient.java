import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.util.logging.Logger;

public class TCPClient {

    private static final Logger log = Logger.getLogger(TCPClient.class.getSimpleName());

    private static final int PORT = 9000;
    private static final String HOST = "127.0.0.1";

    public static void main(String[] args) {
        String message;

        // input message from user
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));

        try {
            Socket socket = new Socket(HOST, PORT);
            if (socket.isConnected()) {
                log.info("Socket connected to " + socket.getLocalSocketAddress().toString());
            }

            // server output message
            DataOutputStream serverOutput = new DataOutputStream(socket.getOutputStream());

            BufferedReader serverInput = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            message = in.readLine();

            serverOutput.writeBytes(message + "\n");

            log.info("FROM SERVER: " + serverInput.readLine());

            socket.close();
        } catch (IOException e) {
            log.severe(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
