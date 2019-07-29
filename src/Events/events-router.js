const express = require('express')
const EventsService = require('./events-service')
const logger = require('../logger')

const eventRouter = express.Router()
const jsonBodyParser = express.json()

const serializeEvent = event => ({
    id: event.id,
    weekday: event.weekday,
    event: event.event,
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
    .post(jsonBodyParser, (req, res, next) => {
        const newEvent = { ...req.body, date_created: 'now()' }

        for (const [key, value] of Object.entries(newEvent))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        // newEvent.user_id = req.user.id

        return EventsService
            .insertEvents(req.app.get('db'), newEvent)
            .then(newEvent => {
                res
                    .status(201)
                    .location(`/api/events/${newEvent.id}`)
                    .json(newEvent)
            })
            .catch(next)
    })

    .delete((req, res, next) => {
        const { id } = req.params;
        EventsService.deleteEvent(
            req.app.get('db'),
            id
        )
            .then(numRowsAffected => {
                logger.info(`Event with id ${id} doesn't exist`)
                res.status(204).end()
            })
            .catch(next)
    })

eventRouter
    .route('/api/myevents/:userid')
    .get((req, res, next) => {
        const { userid } = req.params;
        EventsService.getUserEvents(req.app.get('db'), userid)
            .then(events => {
                if (!events) {
                    logger.info(`User with id ${userid} doesn't exist`);
                    return res
                        .status(409)
                        .send({ error: { message: `User events don't exist` } })
                }
                res.status(200).json(events)
            })
            .catch(next)
    })


module.exports = eventRouter