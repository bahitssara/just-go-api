const EventsService = {
    getAllEvents(knex) {
        return knex.select('*').from('events')
    },


    insertEvents(db, newEvent) {
        return db
            .insert(newEvent)
            .into('events')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteEvent(knex, id) {
        return knex('events')
            .where({ id })
            .delete()
    },
    getUserReviews(knex, userid) {
        return knex 
            .select('*')
            .where('user_id', userid)
            .from('events')
    },
}

module.exports = EventsService
