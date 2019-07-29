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
            'user_id': 1
        },
        {
            'id': 2,
            'weekday': 'Tuesday',
            'user_id': 2
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

module.exports = {
    makeEventsArray,
    makeUsersArray,
    cleanTables,
    makeFixtures
}