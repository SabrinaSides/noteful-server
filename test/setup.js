require('dotenv').config() //need to access TEST_DB_URL to run tests
const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest