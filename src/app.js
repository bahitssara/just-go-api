require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const eventRouter = require('./Events/events-router')
const usersRouter = require('./Users/user-router')
const authRouter = require('./Auth/auth-router')
const {CLIENT_ORIGIN} = require('./config')
const { NODE_ENV } = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())

app.get('/', (req,res) => {
    res.send('Hello, world!')
})

app.use(
    cors({
        // origin: CLIENT_ORIGIN
    })
);

app.use(eventRouter)
app.use(usersRouter)
app.use(authRouter)

app.use(function errorHandler(error, req, res, next) {
    let response
    if(NODE_ENV === 'production') {
        response = { error: { message: 'server error'}}
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
    next()
})
module.exports = app