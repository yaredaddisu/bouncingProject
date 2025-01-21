import * as dotenv from 'dotenv';
import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import db from '../db/connection'; // Import the database connection
import WebSocket from 'ws';

// Load environment variables
dotenv.config();

// Replace with your bot token
const token = process.env.BOT_TOKEN || '7470854521:AAHvOW9cq9W2SDybCeVYnToPmxIW8AyH78A';
const bot = new TelegramBot(token, { polling: true });

// Store the registration state for each user
const registrationState: Record<number, { step: string; data: { name?: string; contact?: string } }> = {};
// Start command with inline buttons
bot.onText(/\/start/, (msg: Message) => {
    const chatId = msg.chat.id;

    // Check if the user is already registered
    db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            bot.sendMessage(chatId, '⚠️ There was an error. Please try again later.');
            return;
        }

        // Log the result of the database query for debugging
        console.log('Database query result:', result);

        // Check if result is an array of RowDataPacket objects
        if (Array.isArray(result) && result.length > 0 && 'name' in result[0]) {
            // User already registered, include the user's name in the welcome message
            const userName = result[0].name; // Assuming result[0] is a RowDataPacket with a 'name' field
            bot.sendMessage(chatId, `👋 Welcome back, ${userName}! 🚀`, {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '🎮 Play Game',
                        url: `https://et-bouncing.netlify.app/?chatId=${chatId}&userName=${encodeURIComponent(userName)}`,
                      },
                    ],
                    [
                      {
                        text: '▶ Start Game', // Add new button for starting the game
                        callback_data: 'play', // This sends the start command when clicked
                      },
                    ],
                  ],
                },
              });
              
            
        } else {
            // User not registered, show registration process
            registrationState[chatId] = { step: 'contact', data: {} };
            bot.sendMessage(chatId, 'Welcome! Let’s get you registered. 📝\n\nPlease share your contact information (e.g., phone number or email):', {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: 'Share Contact',
                                request_contact: true, // This makes the "Share Contact" button
                            },
                        ],
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true,
                },
            });
        }
    });
});

// Handle callback queries for inline buttons
//   bot.on('callback_query', async (query: CallbackQuery) => {
//     const chatId = query.message?.chat.id;

//     if (!chatId) return;

//     switch (query.data) {
//       case 'register':
//         // Check if the user is already registered
//         db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, result) => {
//           if (err) {
//             console.error('Database error:', err);
//             bot.sendMessage(chatId, '⚠️ There was an error. Please try again later.');
//             return;
//           }
//           console.log('Database query result:', result);

//           if (Array.isArray(result) && result.length > 0) {
//             console.log(result)
//             bot.sendMessage(chatId, '👋 You are already registered! 🚀');
//           } else {
//             registrationState[chatId] = { step: 'contact', data: {} };
//             // Send a request for the user's contact
//             bot.sendMessage(chatId, 'Please share your contact information by clicking the button below:', {
//               reply_markup: {
//                 keyboard: [
//                   [
//                     {
//                       text: 'Share Contact',
//                       request_contact: true, // This makes the "Share Contact" button
//                     },
//                   ],
//                 ],
//                 one_time_keyboard: true,
//                 resize_keyboard: true,
//               },
//             });
//           }
//         });
//         break;

//       case 'about':
//         bot.sendMessage(chatId, 'This bot helps you register and provides useful information.');
//         break;

//       case 'help':
//         bot.sendMessage(chatId, 'To use this bot, click the buttons below the messages to navigate.');
//         break;

//       default:
//         bot.sendMessage(chatId, 'Unknown action. Please try again.');
//     }

//     // Acknowledge the callback query
//     bot.answerCallbackQuery(query.id);
//   });

// Handle user sending their contact info
bot.on('contact', async (msg: Message) => {
    const chatId = msg.chat.id;

    if (!registrationState[chatId] || registrationState[chatId].step !== 'contact') return;

    const userContact = msg.contact?.phone_number;
    const userName = msg.contact?.first_name;

    if (userContact && userName) {
        registrationState[chatId].data.contact = userContact;

        // Insert the user into the database
        db.query(
            'INSERT INTO users (chat_id, contact, name) VALUES (?, ?, ?)', // Correct number of placeholders
            [chatId, userContact, userName],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    bot.sendMessage(chatId, '⚠️ An error occurred during registration. Please try again later.');
                } else {
                    bot.sendMessage(
                        chatId,
                        `🎉 Registration complete! Welcome ${msg.contact?.first_name}! 🚀`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                          text: '🎮 Play Game',
                                          url: `https://et-bouncing.netlify.app/?chatId=${chatId}&userName=${encodeURIComponent(userName)}`,
                                        },
                                      ],
                                      [
                                        {
                                          text: '▶ Start Game', // Add new button for starting the game
                                          callback_data: 'play', // This sends the start command when clicked
                                        },
                                      ],
                                ],
                            },
                        }
                    );
                }
            }
        );

        // Reset registration state
        delete registrationState[chatId];
    }
});
//let ws = new WebSocket('ws://localhost:8090');
let ws = new WebSocket('wss://bouncingback-3.onrender.com');

ws.on('open', () => console.log('WebSocket connection established with animation server.'));
ws.on('error', (err) => console.error('WebSocket error:', err));
ws.on('close', () => {
    console.error('WebSocket connection closed. Attempting to reconnect...');
    setTimeout(() => {
        ws = new WebSocket('wss://bouncingback-3.onrender.com');
    }, 5000);
});

 
// Inline button handler
bot.on('callback_query', (query: CallbackQuery) => {
    const chatId = query.message?.chat.id;

    if (!chatId) return;

    const command = query.data;

    // Send the command to the WebSocket server
    if (ws.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ command, chatId });
        ws.send(message);
    } else {
        bot.sendMessage(chatId, '⚠️ Unable to send command to the server. Please try again later.');
    }

    // Acknowledge the button click
    bot.answerCallbackQuery(query.id, { text: `Command sent: ${command}` });
});

// Start command with inline buttons
bot.on('callback_query', (query) => {
    const chatId = query.message?.chat.id;
  
    if (!chatId) {
      // Handle the case where chatId is undefined (e.g., log an error)
      console.error('Chat ID is undefined.');
      return;
    }
  
    const command = query.data; // Get the callback_data from the button click
  
    if (command === 'play') {
      // Trigger the /play command logic
      bot.sendMessage(chatId, '🎮 Control the ball animation:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Start', callback_data: 'start' },
              { text: 'Stop', callback_data: 'stop' },
            ],
            [
              { text: 'Speed Up', callback_data: 'speedup' },
              { text: 'Slow Down', callback_data: 'slowdown' },
            ],
            [{ text: 'Reverse', callback_data: 'reverse' }],
          ],
        },
      });
  
      // Acknowledge the callback
      bot.answerCallbackQuery(query.id);
    }
  });
  
  



console.log('Bot is running...');
