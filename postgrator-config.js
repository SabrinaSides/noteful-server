require('dotenv').config()

module.exports = {
    "migratonDirectory": "migrations", //refers to folder that contains migration steps
    "driver": "pg",
    //setup config so we can migrate to test db when testing and normal db when not running tests
    "connectionString": (process.env.NODE_ENV === 'test') ? process.env.TEST_DB_URL : process.env.DB_URL
}

//postgrator is a SQL migration library
//connects to our db by reading this config file containing the db url as "connectionString"