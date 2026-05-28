const db = require('../db/database')

const now = () => new Date().toISOString()

const getTaskByIdStmt = db.prepare('SELECT * FROM tasks WHERE id = ?')
const insertTaskStmt = db.prepare(`
  INSERT INTO tasks (
    project_id,
    title,
    description,
    status,
    priority,
    assignee_id,
    start_date,
    due_date,
    completed_at,
    created_at,
    updated_at
  ) VALUES (
    @project_id,
    @title,
    @description,
    @status,
    @priority,
    @assignee_id,
    @start_date,
    @due_date,
    @completed_at,
    @created_at,
    @updated_at
  )
`)
const deleteTaskStmt = db.prepare('DELETE FROM tasks WHERE id = ?')

const baseTaskSelect = 'SELECT * FROM tasks'

const hasFilterValue = (value) => value !== undefined && value !== null && value !== ''

const buildTasksQuery = (filters) => {
  const clauses = []
  const params = {}

  if (hasFilterValue(filters.projectId)) {
    clauses.push('project_id = @projectId')
    params.projectId = filters.projectId
  }

  if (hasFilterValue(filters.status)) {
    clauses.push('status = @status')
    params.status = filters.status
  }

  if (hasFilterValue(filters.assigneeId)) {
    clauses.push('assignee_id = @assigneeId')
    params.assigneeId = filters.assigneeId
  }

  const whereClause = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''
  const query = `${baseTaskSelect}${whereClause} ORDER BY id DESC`

  return { query, params }
}

const normalizeTaskPayload = (body = {}, existingTask = null) => {
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status')
  const hasCompletedAt = Object.prototype.hasOwnProperty.call(body, 'completed_at') ||
    Object.prototype.hasOwnProperty.call(body, 'completedAt')

  const status = hasStatus ? body.status : existingTask?.status
  const completedAtInput = body.completed_at ?? body.completedAt

  const payload = {
    project_id: body.project_id ?? body.projectId ?? existingTask?.project_id ?? null,
    title: body.title ?? existingTask?.title ?? null,
    description: body.description ?? existingTask?.description ?? null,
    status: status ?? 'todo',
    priority: body.priority ?? existingTask?.priority ?? 'medium',
    assignee_id: body.assignee_id ?? body.assigneeId ?? existingTask?.assignee_id ?? null,
    start_date: body.start_date ?? body.startDate ?? existingTask?.start_date ?? null,
    due_date: body.due_date ?? body.dueDate ?? existingTask?.due_date ?? null,
    completed_at: completedAtInput ?? existingTask?.completed_at ?? null,
  }

  if (body.title !== undefined) {
    payload.title = body.title
  }

  if (body.description !== undefined) {
    payload.description = body.description
  }

  if (body.priority !== undefined) {
    payload.priority = body.priority
  }

  if (body.project_id !== undefined || body.projectId !== undefined) {
    payload.project_id = body.project_id ?? body.projectId
  }

  if (body.assignee_id !== undefined || body.assigneeId !== undefined) {
    payload.assignee_id = body.assignee_id ?? body.assigneeId
  }

  if (body.start_date !== undefined || body.startDate !== undefined) {
    payload.start_date = body.start_date ?? body.startDate
  }

  if (body.due_date !== undefined || body.dueDate !== undefined) {
    payload.due_date = body.due_date ?? body.dueDate
  }

  if (hasCompletedAt) {
    payload.completed_at = completedAtInput
  }

  if (status === 'done' && !hasCompletedAt) {
    payload.completed_at = now()
  }

  if (status !== 'done' && !hasCompletedAt && body.status !== undefined) {
    payload.completed_at = null
  }

  return payload
}

const getTasks = (req, res) => {
  const { query, params } = buildTasksQuery({
    projectId: req.query.projectId,
    status: req.query.status,
    assigneeId: req.query.assigneeId,
  })

  res.json(db.prepare(query).all(params))
}

const getTaskById = (req, res) => {
  const task = getTaskByIdStmt.get(req.params.id)

  if (!task) {
    return res.status(404).json({ error: 'task not found' })
  }

  res.json(task)
}

const createTask = (req, res) => {
  const body = req.body || {}
  const title = body.title

  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }

  const task = normalizeTaskPayload(body)
  const result = insertTaskStmt.run({
    ...task,
    created_at: now(),
    updated_at: now(),
  })

  res.status(201).json(getTaskByIdStmt.get(result.lastInsertRowid))
}

const updateTask = (req, res) => {
  const existingTask = getTaskByIdStmt.get(req.params.id)

  if (!existingTask) {
    return res.status(404).json({ error: 'task not found' })
  }

  const task = normalizeTaskPayload(req.body || {}, existingTask)

  const updateStmt = db.prepare(`
    UPDATE tasks
    SET
      project_id = @project_id,
      title = @title,
      description = @description,
      status = @status,
      priority = @priority,
      assignee_id = @assignee_id,
      start_date = @start_date,
      due_date = @due_date,
      completed_at = @completed_at,
      updated_at = @updated_at
    WHERE id = @id
  `)

  updateStmt.run({
    ...task,
    id: req.params.id,
    updated_at: now(),
  })

  res.json(getTaskByIdStmt.get(req.params.id))
}

const deleteTask = (req, res) => {
  const result = deleteTaskStmt.run(req.params.id)

  if (!result.changes) {
    return res.status(404).json({ error: 'task not found' })
  }

  res.status(204).send()
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}