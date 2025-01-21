
import WebSocket, { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

const TELEGRAM_API_URL =
  'https://api.telegram.org/bot7470854521:AAHvOW9cq9W2SDybCeVYnToPmxIW8AyH78A/sendMessage';

const wss = new WebSocketServer({ port: 8090 });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected.');

  ws.on('message', async (message: WebSocket.RawData) => {
    const messageText = message.toString(); // Convert RawData to string
    console.log('Raw message received:', messageText);

    try {
      // Parse the incoming message as JSON
      const parsedMessage = JSON.parse(messageText);
      console.log('Parsed message:', parsedMessage);

      const { chatId, command } = parsedMessage;

      // Validate fields
      if (!chatId || !command) {
        console.error(
          'Invalid message format. Expected chatId and command fields. Received:',
          parsedMessage
        );
        return;
      }

      console.log(`Command received for chatId ${chatId}: ${command}`);

      // Send the command to all connected web clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(command); // Send the command to the web clients
        }
      });

      // Optionally, send the same command to Telegram as confirmation
      await sendMessageToTelegram(chatId, command);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected.');
  });
});

const sendMessageToTelegram = async (chatId: string, command: string) => {
  const payload = {
    chat_id: chatId,
    text: `Command received: ${command}`, // Send only the command
  };

  console.log('Sending payload to Telegram:', payload);

  try {
    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseBody = await response.text(); // Log response body for debugging
      throw new Error(
        `Telegram API error: ${response.statusText}, Response Body: ${responseBody}`
      );
    }

    console.log('Command successfully sent to Telegram:', command);
  } catch (error) {
    console.error('Failed to send command to Telegram:', error);
    throw error;
  }
};

console.log('WebSocket server is running on port 8090...');
