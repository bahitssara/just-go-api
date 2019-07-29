module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DATABASE_URL || 'postgresql://sara_mayberry@localhost/this_week',
    CLIENT_ORIGIN:process.env.CLIENT_ORIGIN || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '3h'
}