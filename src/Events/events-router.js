const express = require('express')
const EventsService = require('./events-service')
const logger = require('../logger')

const eventRouter = express.Router()
const jsonBodyParser = express.json()

const serializeEvent = event => ({
    id: event.id,
    weekday: event.weekday,
    events: event.events,
    user_id: event.user_id || {}
})

eventRouter
    .route('/api/events')
    .get((req, res, next) => {
        EventsService.getAllEvents(req.app.get('db'))
            .then(events => {
                res.json(events.map(serializeEvent))
            })
            .catch(next)
    })


module.exports = eventRouter