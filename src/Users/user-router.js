const express = require('express')
const path = require('path')
const logger = require('../logger')
const UsersService = require('./users-service.js')
const AuthService = require('../Auth/auth-service')
const xss = require('xss')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

const serializeUser = user => ({
    id: user.id,
    first_name: xss(user.first_name),
    last_name: xss(user.last_name),
    email: xss(user.email),
    date_created: new Date(user.date_created),
})

usersRouter
//Endpoint to view all current users, and post new users 
    .route('/api/user')

    //view users, admin use only
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })

    //post new users, used for user sign up 
    .post(jsonBodyParser, (req, res, next) => {
        const { first_name, last_name, email, password } = req.body

        for (const field of ['first_name', 'last_name', 'email', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }
        const passwordError = UsersService.validatePassword(password)

        if (passwordError) {
            return res.status(400).json({ error: passwordError })
        }

        //Check DB to ensure user email has not already been used
        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if (hasUserWithEmail)
                    return res.status(400).json({ error: `Email already in use, please sign in!` })

                //generates hashed password to store in DB
                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            first_name,
                            last_name,
                            email,
                            password: hashedPassword,
                        }

                        return UsersService
                            .insertUser(req.app.get('db'), newUser)
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })


usersRouter
    //Endpoint for viewing individual user info, editing, and deleting users. 
    .route('/api/user/:id')

    //access db to retrieve a posted user by id 
    .all((req, res, next) => {
        const { id } = req.params;
        UsersService.getById(req.app.get('db'), id)
            .then(user => {
                if (!user) {
                    logger.info(`User with id:${id} doesn't exist`);
                    return res
                        .status(404)
                        .send({ error: { message: `User doesn't exist` } })
                }
                res.user = user
                next()
            })
            .catch(next)
    })

    //retrieve user 
    .get((req, res) => {
        res.json(serializeUser(res.user))
    })

    //update user, only used for admin
    .patch(jsonBodyParser, (req, res, next) => {
        const updatedUserInfo = { ...req.body, date_created: 'now()' }
        for (const [key, value] of Object.entries(updatedUserInfo)) {
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        }
        return UsersService.updateUserInfo(
            req.app.get('db'),
            req.params.id,
            updatedUserInfo
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    //delete user, only used for admin 
    .delete((req, res, next) => {
        const { id } = req.params;
        UsersService.deleteUser(
            req.app.get('db'),
            id
        )
            .then(numRowsAffected => {
                logger.info(`User with id ${id} deleted`)
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = usersRouter