const express = require('express')
const { getHealth } = require('../controllers/healthController')
const usersRoutes = require('./usersRoutes')
const projectsRoutes = require('./projectsRoutes')
const tasksRoutes = require('./tasksRoutes')

const router = express.Router()

router.get('/health', getHealth)
router.use('/users', usersRoutes)
router.use('/projects', projectsRoutes)
router.use('/tasks', tasksRoutes)

module.exports = router
