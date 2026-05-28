const express = require('express')
const { validateTaskInput } = require('../middleware/validateTask')
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/tasksController')

const router = express.Router()

router.get('/', getTasks)
router.get('/:id', getTaskById)
router.post('/', validateTaskInput, createTask)
router.patch('/:id', validateTaskInput, updateTask)
router.delete('/:id', deleteTask)

module.exports = router