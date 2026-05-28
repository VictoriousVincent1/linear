const BASE_URL = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`)
  }

  return data
}

export function getTasks(filters = {}) {
  const searchParams = new URLSearchParams()

  if (filters.projectId) searchParams.set('projectId', filters.projectId)
  if (filters.status) searchParams.set('status', filters.status)
  if (filters.assigneeId) searchParams.set('assigneeId', filters.assigneeId)

  const query = searchParams.toString()
  return request(`/tasks${query ? `?${query}` : ''}`)
}

export function getProjects() {
  return request('/projects')
}

export function createTask(payload) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(id, payload) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  })
}

export function getUsers() {
  return request('/users')
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createProject(payload) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
