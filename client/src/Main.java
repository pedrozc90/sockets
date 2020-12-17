import java.io.IOException;
import java.net.ConnectException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        try {
            MyClient myClient = MyClient.init("127.0.0.1", 9000);

            final Scanner prompt = new Scanner(System.in);

            while (true) {
                String message = prompt.next();
                if ("quit".equals(message) || message.equals("\\q")) {
                    System.exit(0);
                } else {
                    String response = myClient.sendMessage(message);
                }
            }
        } catch (ConnectException e) {
            main(args);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(-1);
        }
    }

}
