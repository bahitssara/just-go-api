const knex = require('knex')
const app = require('../src/app')
const { TEST_DB_URL, JWT_SECRET } = require('../src/config')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')


describe('Events Endpoints', function() {
    let db
    
    const testUsers = helpers.makeUsersArray()
    const testEvents = helpers.makeEventsArray()

    function makeAuthHeader(user, secret = JWT_SECRET) {
      const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.email,
        algorithm: 'HS256',
      })
      return `bearer ${token}`
    }
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: TEST_DB_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('cleanup', () => helpers.cleanTables(db))
  
    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert users', () => {
        return db.into('this_week_users').insert(testUsers)
    })
  
    // beforeEach('insert events', () => {
    //     return db.into('events').insert(testEvents)
    // })

    describe(`GET /events`, () => {
        context(`Given no events`, () => {
          it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get('/api/events')
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .expect(200, [])
          })
        });

        context('Given there are events in the database', () => {
            const testEvents = helpers.makeEventsArray()
            
            beforeEach('insert events', () => {
                return db
                    .into('events')
                    .insert(testEvents)
            })
            it('GET /api/events responds with 200 and all the events', () => {
                return supertest(app)
                    .get('/api/events')
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, testEvents)
            })
        })
    })

    describe('GET /api/events/:eventId responds with 200 and all the events', () => {
      context('Given no events', () => {
        it('responds with 404 not found', () => {
          const eventId = 123456;
          return supertest(app)
            .get(`/api/events/${eventId}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(404, {error: {message: `Event doesn't exist`} })
        })
      })
    })

    context('Given there are events in the database', () => {
      const testEvent = [
        {
          'id': 1,
          'weekday': 'Monday',
          'event':'Test Events',
          'user_id': 1
      },
      ];

      beforeEach('insert event', () => {
        return db.into('events').insert(testEvent)
      })

      it('responds with 200 and the specified review', () => {
        const eventId = 1;
        const expectedEvent = testEvent[eventId -1];
        return supertest(app)
          .get(`/api/events/${eventId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, expectedEvent)
      })
    })


  describe('POST /api/events', () => {
    context('Given there are events in the database', () => {
      const testEvents = helpers.makeEventsArray()
      beforeEach('insert events', () => {
          return db
              .into('events')
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .insert(testEvents)
      })
    })

    it(`responds with 401 'Missing bearer token when no basic token`, () => {
      const newEvent = 
      {
        'id': 1,
        'weekday': 'Monday',
        'event':'Test Events',
        'user_id': 1
      };
      return supertest(app)
        .post(`/api/events`)
        .send(newEvent)
        .expect(401, { error: `Missing bearer token` })
      } 
    )

    it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
       const userNoCreds = { email: '', password: '' }
         return supertest(app)
          .post(`/api/events`)
          .set('Authorization', makeAuthHeader(userNoCreds))
          .expect(401, { error: `Unauthorized request` })
    })

    it(`responds 401 'Unauthorized request' when invalid user`, () => {
      const userInvalidCreds = { email: 'user-not', password: 'existy' }
      return supertest(app)
        .post(`/api/events`)
        .set('Authorization', makeAuthHeader(userInvalidCreds))
        .expect(401, { error: `Unauthorized request` })
    })

//     it('creates an event, responding with 201 and a new event', () => {
//       const testUser = testUsers[0]
//       const newEvent = 
//         {
//           'id': 1,
//           'weekday': 'Monday',
//           'event':'Test Events',
//           'user_id': 1
//         }
//       return supertest(app)
//         .post('/api/events')
//         .send(newEvent)
//         .set('Authorization', makeAuthHeader(testUsers[0]))
//         .expect(201)
//         .expect(res => {
//           expect(res.body.weekday).to.eql(newEvent.weekday)
//           expect(res.body.event).to.eql(newEvent.event)
//           expect(res.body).to.have.property('id')
//           expect(res.headers.location).to.eql(`/api/events/${res.body.id}`)
//         })
//         .expect(res =>
//           db
//             .from('events')
//             .select('*')
//             .where({ id: res.body. id })
//             .first()
//             .then(row => {
//               expect(res.body.weekday).to.eql(newEvent.weekday)
//               expect(res.body.event).to.eql(newEvent.event)
//               expect(row.user_id).to.eql(testUser.id)
//               const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
//               const actualDate = new Date(row.date_created).toLocaleString()
//               expect(actualDate).to.eql(expectedDate)
//             })
//       )
//   })
// })

//   describe('DELETE /api/events/:eventId', () => { 
//     context('Given no events', () => {
//       it('responds with 404 not found', () => {
//         const eventId = 123456;
//         return supertest(app)
//           .delete(`/events/${eventId}`)
//           .set('Authorization', makeAuthHeader(testUsers[0]))
//           .expect(404, { error: { message: `Event doesn't exist`} })
//       })
//     })
//     context('Given there are events in the database', () => {
//       const testEvents = helpers.makeEventsArray()

//       beforeEach('insert events', () => {
//         return db.into('events').insert(testEvents)
//       })

//       it('responds with 204 and removes the review', () => {
//         const eventToDelete = 1;
//         const expectedEvents = testEvents.filter(
//           events => events.id !== eventToDelete
//         );
//         return supertest(app)
//           .delete(`/api/events/${eventToDelete}`)
//           .expect(204)
//           .set('Authorization', makeAuthHeader(testUsers[0]))
//           .then(res =>
//             supertest(app)
//               .get('/api/events')
//               .expect(expectedEvents)
//             )
//       })
//     })
  })
})

