const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      email: 'testemail1@email.com',
      password: 'password1',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      first_name: 'Test',
      last_name: 'User',
      email: 'testemail2@email.com',
      password: 'password2',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      first_name: 'Test',
      last_name: 'User',
      email: 'testemail3@email.com',
      password: 'password3',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      first_name: 'Test',
      last_name: 'User',
      email: 'testemail4@email.com',
      password: 'password4',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ]
}

function makeEventsArray() {
  return [
    {
      'id': 1,
      'weekday': 'Monday',
      'event': 'Test Events',
      'title': 'Test Title',
      'event_date': '2029-01-22T16:28:32.615Z',
      'event_img': 'img-url',
      'event_url': 'event_url',
      'event_type': 'event_type',
      'user_id': 1,
      'date_created': '2029-01-22T16:28:32.615Z'
    },
    {
      'id': 2,
      'weekday': 'Tuesday',
      'event': 'Test Events',
      'title': 'Test Title',
      'event_date': '2029-01-22T16:28:32.615Z',
      'event_img': 'img-url',
      'event_url': 'event_url',
      'event_type': 'event_type',
      'user_id': 2,
      'date_created': '2029-01-22T16:28:32.615Z'

    }
  ]
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      this_week_users,
      events
      RESTART IDENTITY CASCADE`
  )
}

function makeFixtures() {
  const testUsers = makeUsersArray()
  const testEvents = makeEventsArray(testUsers)
  return { testUsers, testEvents }
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('this_week_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('this_week_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

module.exports = {
  makeEventsArray,
  makeUsersArray,
  cleanTables,
  makeFixtures,
  seedUsers
}