export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'iho_sistema_jwt_secret_key_2026_very_secure_123456',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'iho_sistema_refresh_secret_key_2026_very_secure_789012',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
  },
  session: {
    secret: process.env.SESSION_SECRET || 'iho_session_secret_2026'
  },
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100')
  }
}