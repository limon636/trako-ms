export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'trako_db',
  },
  jwt: {
    owner: {
      secret: process.env.JWT_OWNER_SECRET ?? 'owner_secret',
      expiresIn: process.env.JWT_OWNER_EXPIRES_IN ?? '15m',
      refreshSecret:
        process.env.JWT_OWNER_REFRESH_SECRET ?? 'owner_refresh_secret',
      refreshExpiresIn: process.env.JWT_OWNER_REFRESH_EXPIRES_IN ?? '7d',
    },
    user: {
      secret: process.env.JWT_USER_SECRET ?? 'user_secret',
      expiresIn: process.env.JWT_USER_EXPIRES_IN ?? '15m',
      refreshSecret:
        process.env.JWT_USER_REFRESH_SECRET ?? 'user_refresh_secret',
      refreshExpiresIn: process.env.JWT_USER_REFRESH_EXPIRES_IN ?? '7d',
    },
  },
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
});
