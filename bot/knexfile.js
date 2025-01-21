// knexfile.js
// module.exports = {
//   client: 'mysql2',
//   connection: {
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//   //  password: process.env.DB_PASSWORD || '',
//     database: process.env.DB_NAME || 'telegram_bot',
//   },
//   migrations: {
//     tableName: 'knex_migrations',
//     directory: './migrations',
//   },
// };
// knexfile.js
module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '91.204.209.17',
    user: process.env.DB_USER || 'lomisttx_user',
    password: process.env.DB_PASSWORD || 'Yared@1997',
    database: process.env.DB_NAME || 'lomisttx_bouncing',
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
};
