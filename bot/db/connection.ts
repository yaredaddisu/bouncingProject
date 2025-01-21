import mysql from 'mysql2';

// Create a connection to the database
const db = mysql.createConnection({
  // host: process.env.DB_HOST || 'localhost',
  // user: process.env.DB_USER || 'root',
  // //password: process.env.DB_PASSWORD || 'password',
  // database: process.env.DB_NAME || 'telegram_bot',

  host: process.env.DB_HOST || '91.204.209.17',
  user: process.env.DB_USER || 'lomisttx_user',
  password: process.env.DB_PASSWORD || 'Yared@1997',
  database: process.env.DB_NAME || 'lomisttx_bouncing',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

export default db;
