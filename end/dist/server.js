var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import WebSocket, { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
const TELEGRAM_API_URL = 'https://api.telegram.org/bot7470854521:AAHvOW9cq9W2SDybCeVYnToPmxIW8AyH78A/sendMessage';
const wss = new WebSocketServer({ port: 8090 });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected.');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const messageText = message.toString(); // Convert RawData to string
        console.log('Raw message received:', messageText);
        try {
            // Parse the incoming message as JSON
            const parsedMessage = JSON.parse(messageText);
            console.log('Parsed message:', parsedMessage);
            const { chatId, command } = parsedMessage;
            // Validate fields
            if (!chatId || !command) {
                console.error('Invalid message format. Expected chatId and command fields. Received:', parsedMessage);
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
            yield sendMessageToTelegram(chatId, command);
        }
        catch (error) {
            console.error('Error processing message:', error);
        }
    }));
    ws.on('close', () => {
        console.log('WebSocket client disconnected.');
    });
});
const sendMessageToTelegram = (chatId, command) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        chat_id: chatId,
        text: `Command received: ${command}`, // Send only the command
    };
    console.log('Sending payload to Telegram:', payload);
    try {
        const response = yield fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const responseBody = yield response.text(); // Log response body for debugging
            throw new Error(`Telegram API error: ${response.statusText}, Response Body: ${responseBody}`);
        }
        console.log('Command successfully sent to Telegram:', command);
    }
    catch (error) {
        console.error('Failed to send command to Telegram:', error);
        throw error;
    }
});
console.log('WebSocket server is running on port 8090...');
