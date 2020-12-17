import java.io.*;
import java.net.Socket;
import java.util.logging.Logger;

public class ServerThread extends Thread {

    private static final Logger log = Logger.getLogger(ServerThread.class.getSimpleName());

    private final Socket socket;
    private BufferedReader in;
    private PrintWriter out;
    private boolean alive = true;

    public ServerThread(Socket socket) {
        this.socket = socket;
        log.info("Accepted client address " + socket.getInetAddress().getHostAddress());
    }

    @Override
    public void run() {
        try {
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);

            while (alive) {
                String received = in.readLine();
                log.info("client message: " + received);

                if (received.equalsIgnoreCase("quit")) {
                    log.info("stopping client thread for client");
                    disconnect();
                } else {
                    out.println("server message: " + received.toUpperCase());
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(-1);
        } finally {
            try {
                disconnect();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void disconnect() throws IOException {
        in.close();
        out.close();
        socket.close();
        alive = false;
    }

}
