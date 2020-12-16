import java.io.*;
import java.net.Socket;
import java.util.logging.Logger;

public class ServerThread extends Thread {

    private static final Logger log = Logger.getLogger(ServerThread.class.getSimpleName());

    private final Socket socket;
    private DataOutputStream out;
    private BufferedReader in;

    public ServerThread(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
            out = new DataOutputStream(socket.getOutputStream());
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            String message = null;
            while (true) {
                try {
                    message = in.readLine().trim().toLowerCase();
                    if (message.equals("quit")) {
                        out.writeBytes("bye");
                        break;
                    } else {
                        out.writeBytes(message);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    return;
                }
            }

            in.close();
            out.close();
            socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
