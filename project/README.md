# Project: Telegram Bot with Bouncing Ball

## Overview

This project integrates a Telegram bot with a web page featuring a bouncing ball animation. The bot allows user registration, and the web page and bot enables real-time control of the ball's animation.



## Folder Structure
- `bot/`: Telegram bot code and logic Nodes js, MySQL DB
- `frontend/`: Vite + React-based web page with bouncing ball animation
- `backend/`: WebSocket server for real-time communication between bot and frontend
- `readme/`: Documentation

frontend hosted in netlify, telegram bot and backend hosted in render


## Setup Instructions
### Frontend

1. go to front end folder 
2. npm install
3. npm run dev

### Backend Telegram bot
1. Clone the repository and navigate to the `bot` folder.
2. Install dependencies:
   ```bash
   npm install --save-dev @types/node-telegram-bot-api

3. npx ts-node bot/index.ts

### For Db
1. npm install knex mysql2

### Backend WebSocket 
1. node dist/server.js



Developed By: Yared Addisu
Conatct: +251 923423589
email:yaredaddisu1997@gmail.com
telegram link: @jared_ze