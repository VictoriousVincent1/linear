const allowedStatuses = new Set(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'])
const allowedPriorities = new Set(['low', 'medium', 'high', 'urgent'])

function isValidDateValue(value) {
  if (value === undefined || value === null || value === '') {
    return true
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return date.toISOString().slice(0, 10) === value
  }

  return true
}

function validateTaskInput(req, res, next) {
  const body = req.body || {}
  const errors = []
  const title = typeof body.title === 'string' ? body.title.trim() : ''

  if (!title) {
    errors.push('title is required')
  }

  if (body.status !== undefined && body.status !== null && body.status !== '' && !allowedStatuses.has(body.status)) {
    errors.push('status must be one of backlog, todo, in_progress, in_review, done, cancelled')
  }

  if (body.priority !== undefined && body.priority !== null && body.priority !== '' && !allowedPriorities.has(body.priority)) {
    errors.push('priority must be one of low, medium, high, urgent')
  }

  if (!isValidDateValue(body.start_date ?? body.startDate)) {
    errors.push('start_date must be a valid date')
  }

  if (!isValidDateValue(body.due_date ?? body.dueDate)) {
    errors.push('due_date must be a valid date')
  }

  if (!isValidDateValue(body.completed_at ?? body.completedAt)) {
    errors.push('completed_at must be a valid date')
  }

  if (errors.length) {
    const error = new Error(errors.join('; '))
    error.status = 400
    return next(error)
  }

  next()
}

module.exports = {
  validateTaskInput,
}