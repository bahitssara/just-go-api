const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')


describe('Events Endpoints', function() {
    let db
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('cleanup', () => helpers.cleanTables(db))
  
    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert users', () => {
        return db.into('this_week_users').insert(testUsers)
    })
  
    beforeEach('insert events', () => {
        return db.into('events').insert(testEvents)
    })

    describe(`GET /events`, () => {
        context(`Given no events`, () => {
          it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get('/api/events')
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
                    .expect(200, testEvents)
            })
        })
    })
})


