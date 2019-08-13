const express = require('express')
const AuthService = require('./auth-service')
const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
    //endpoint for user login
    .route('/api/login')

    //post for login
    .post(jsonBodyParser, (req, res, next) => {
        const { email, password } = req.body
        const loginUser = { email, password }

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        
        AuthService.getUserWithEmail(
            req.app.get('db'),
            loginUser.email
        )
            //verify user email is in the database 
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect email',
                    })
                        .catch(next)

                //once verified, hash and compare the user login password val with the database value
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect password',
                            })

                        //send the user email and retrieve the userid for payload
                        const sub = dbUser.email
                        const payload = { user_id: dbUser.id }
                        //send the auth token AND userid for use in the session storage
                        res.send({
                            authToken: AuthService.createJwt(sub, payload),
                            userid: dbUser.id
                        })
                    })
            })
            .catch(next)
    })


module.exports = authRouter