import java.io.*;
import java.net.Socket;

public class Client {

    private Socket socket;
    private DataOutputStream out;
    private BufferedReader in;

    public Client(Socket socket, DataOutputStream out, BufferedReader in) {
        this.socket = socket;
        this.out = out;
        this.in = in;
    }

    public static Client init(String ip, int port) throws IOException {
        Socket socket = new Socket(ip, port);
        if (socket.isConnected()) {
            System.out.println("Socket connected to " + socket.getLocalSocketAddress().toString());
        }

        // server output: send messages to the tcp server socket
        DataOutputStream out = new DataOutputStream(socket.getOutputStream());

        // server input: receives messages from tcp server socket
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

        return new Client(socket, out, in);
    }

    public String sendMessage(String msg) throws IOException {
        out.writeBytes(msg);
        return in.readLine();
    }

    public void stop() throws IOException {
        in.close();
        out.close();
        socket.close();
    }

}
