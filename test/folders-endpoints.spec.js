const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')

describe('Folders Endpoints', function() {
  let db

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)

  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE noteful_folders RESTART IDENTITY CASCADE'))

  describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
            return db
              .into('noteful_folders')
              .insert(testFolders)
          })

      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })

    /*context(`Given an XSS attack article`, () => {
      const testUsers = makeUsersArray();
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle()

      beforeEach('insert malicious article', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert([ maliciousArticle ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/articles`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedArticle.title)
            expect(res.body[0].content).to.eql(expectedArticle.content)
          })
      })
    }) */
  })

  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .get(`/api/folder/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      it('responds with 200 and the specified folder', () => {
        const folderId = 2
        const expectedFolder = testFolders[folderId - 1]
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder)
      })
    })

    /*context(`Given an XSS attack article`, () => {
      const testUsers = makeUsersArray();
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle()

      beforeEach('insert malicious article', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert([ maliciousArticle ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/articles/${maliciousArticle.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedArticle.title)
            expect(res.body.content).to.eql(expectedArticle.content)
          })
      })
    }) */
  })

  describe(`POST /api/folders`, () => {
    const testFolders = makeFoldersArray();

    it(`creates a folder, responding with 201 and the new folder`, () => {
      const newFolder = {
        name: 'Newest Folder'
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['name']

    requiredFields.forEach(field => {
      const newFolder = {
        name: 'Test Folder'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]

        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Name required` }
          })
      })
    })

    /* it('removes XSS attack content from response', () => {
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle()
      return supertest(app)
        .post(`/api/articles`)
        .send(maliciousArticle)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedArticle.title)
          expect(res.body.content).to.eql(expectedArticle.content)
        })
    }) */
  })
/*
  describe(`DELETE /api/articles/:article_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      //const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
      })

      it('responds with 204 and removes the article', () => {
        const idToRemove = 2
        const expectedArticles = testArticles.filter(article => article.id !== idToRemove)
        return supertest(app)
          .delete(`/api/articles/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles`)
              .expect(expectedArticles)
          )
      })
    })
  })

  describe(`PATCH /api/articles/:article_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      //const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
      })

      it('responds with 204 and updates the article', () => {
        const idToUpdate = 2
        const updateArticle = {
          title: 'updated article title',
          style: 'Interview',
          content: 'updated article content',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send(updateArticle)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'style' or 'content'`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateArticle = {
          title: 'updated article title',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }

        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({
            ...updateArticle,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          )
      })
    })
  }) */
})