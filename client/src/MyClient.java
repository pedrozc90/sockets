import java.io.*;
import java.net.Socket;

public class MyClient {

    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;

    public MyClient(Socket socket, PrintWriter out, BufferedReader in) {
        this.socket = socket;
        this.out = out;
        this.in = in;
    }

    public static MyClient init(String ip, int port) throws IOException {
        Socket socket = new Socket(ip, port);
        if (socket.isConnected()) {
            System.out.println("Socket connected to " + socket.getLocalSocketAddress().toString());
        }

        // server output: send messages to the tcp server socket
        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

        // server input: receives messages from tcp server socket
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

        return new MyClient(socket, out, in);
    }

    public String sendMessage(String msg) throws IOException {
        out.println(msg);
        return in.readLine();
    }

    public void stop() throws IOException {
        in.close();
        out.close();
        socket.close();
    }

}
