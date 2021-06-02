const express = require('express')
const NotesService = require('./notes-service')
const xss = require('xss')
const path = require('path')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    content: xss(note.content),
    folder_id: note.folder_id,
    modified: note.modified
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name, content, folder_id } = req.body
        const newNote = { name, content, folder_id }

        for( const [key, value] of Object.entries(newNote))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                })

        NotesService.insertNote(knexInstance, newNote)
                .then(note => {
                    res.status(201)
                        .location(path.posix.join(req.originalUrl, `/${note.id}`))
                        .json(serializeNote(note))
                })
                .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        knexInstance = req.app.get('db')
        const { note_id } = req.params

        NotesService.getById(knexInstance, note_id)
            .then(note => {
                if(!note){
                    return res.status(404).json({
                        error: { message: `Note doesn't exist`}
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.note.id,
            name: xss(res.note.name),
            content: xss(res.note.content),
            folder_id: res.note.folder_id,
            modified: res.note.modified
        })
    })
    .delete((req, res, next) => {
        knexInstance = req.app.get('db')
        const { note_id } = req.params

        NotesService.deleteNote(knexInstance, note_id)
            .then(note => {
                res.status(204).end()
            })
        .catch(next)
    })

module.exports = notesRouter