import java.io.IOException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        try {
            Client client = Client.init("127.0.0.1", 4000);

            final Scanner prompt = new Scanner(System.in);

            while (true) {
                String message = prompt.next();
                if ("quit".equals(message) || message.equals("\\q")) {
                    System.exit(0);
                } else {
                    String response = client.sendMessage(message);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
