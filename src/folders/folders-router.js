const express = require('express')
const FoldersService = require('./folders-service')
const xss = require('xss')
const path = require('path')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder. id,
    name: xss(folder.name)
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name } = req.body
        const newFolder = { name }

        if(!name){
            return res.status(400).json({
                error: { message: `Name required`}
            })
        }

        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        knexInstance = req.app.get('db')
        const { folder_id } = req.params
        FoldersService.getById(knexInstance, folder_id)
        .then(folder => {
            if(!folder){
                return res.status(404).json({
                    error: { message: `Folder doesn't exist` }
                })
            }
            res.folder = folder
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.folder.id,
            name: xss(res.folder.name)
        })
    })

module.exports = foldersRouter