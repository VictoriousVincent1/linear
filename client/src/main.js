import './styles/main.css'
import { getTasks, getProjects, createTask, updateTask, deleteTask, getUsers, createUser, createProject } from './api.js'
import { Sidebar } from './components/Sidebar.js'
import { FilterBar } from './components/FilterBar.js'
import { TaskList } from './components/TaskList.js'
import { TaskModal } from './components/TaskModal.js'
import { TimelineView } from './components/TimelineView.js'
import { Dashboard } from './components/Dashboard.js'

const app = document.querySelector('#app')

const state = {
  users: [],
  projects: [],
  allTasks: [],
  tasks: [],
  activeTaskId: null,
  isTaskModalOpen: false,
  isTaskModalClosing: false,
  activeProjectId: null,
  sidebarCollapsed: false,
  view: 'list',
  filters: {
    statuses: [],
    assigneeId: '',
    priority: '',
    search: '',
  },
  selectedUserId: null,
  isLoadingTasks: true,
  isBooting: true,
  toasts: [],
}

const statusCycle = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']
const toastTimers = new Map()
let modalCloseTimer = null
let toastIdCounter = 0

function getNextStatus(status) {
  const currentIndex = statusCycle.indexOf(status)
  return statusCycle[(currentIndex + 1) % statusCycle.length]
}

function readStoredBoolean(key) {
  return localStorage.getItem(key) === 'true'
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable
}

function addToast(message, tone = 'success') {
  const id = ++toastIdCounter
  state.toasts = [...state.toasts, { id, message, tone }]
  render()

  const timer = setTimeout(() => removeToast(id), 3000)
  toastTimers.set(id, timer)
}

function removeToast(id) {
  const timer = toastTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    toastTimers.delete(id)
  }

  state.toasts = state.toasts.filter((toast) => toast.id !== id)
  render()
}

function setTaskModalOpen(open, taskId = null) {
  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer)
    modalCloseTimer = null
  }

  if (open) {
    state.activeTaskId = taskId
    state.isTaskModalOpen = true
    state.isTaskModalClosing = false
    render()
    return
  }

  if (!state.isTaskModalOpen && !state.isTaskModalClosing) {
    return
  }

  state.isTaskModalClosing = true
  render()

  modalCloseTimer = setTimeout(() => {
    state.isTaskModalOpen = false
    state.isTaskModalClosing = false
    render()
  }, 180)
}

function getModalIsOpen() {
  return state.isTaskModalOpen || state.isTaskModalClosing
}

function taskMatchesFilters(task) {
  const matchesStatuses = !state.filters.statuses.length || state.filters.statuses.includes(task.status)
  const matchesPriority = !state.filters.priority || task.priority === state.filters.priority
  const matchesSearch = !state.filters.search || String(task.title || '').toLowerCase().includes(state.filters.search.toLowerCase())
  const matchesAssignee = !state.filters.assigneeId || String(task.assignee_id) === String(state.filters.assigneeId)
  const matchesProject = !state.activeProjectId || String(task.project_id) === String(state.activeProjectId)
  const matchesMyTasks = state.view !== 'my' || !state.selectedUserId || String(task.assignee_id) === String(state.selectedUserId)

  return matchesStatuses && matchesPriority && matchesSearch && matchesAssignee && matchesProject && matchesMyTasks
}

function upsertTask(task) {
  const nextAllTasks = state.allTasks.filter((item) => String(item.id) !== String(task.id))
  nextAllTasks.unshift(task)
  state.allTasks = nextAllTasks
  state.tasks = nextAllTasks.filter(taskMatchesFilters)
}

function removeTaskFromState(taskId) {
  state.allTasks = state.allTasks.filter((task) => String(task.id) !== String(taskId))
  state.tasks = state.tasks.filter((task) => String(task.id) !== String(taskId))
}

function focusSearch() {
  const searchInput = app.querySelector('[data-action="filter-search"]')
  if (searchInput instanceof HTMLInputElement) {
    searchInput.focus()
    searchInput.select()
  }
}

function openNewTaskModal() {
  setTaskModalOpen(true, null)
}

function closeTaskModal() {
  setTaskModalOpen(false)
}

async function loadProjects() {
  return getProjects()
}

async function refreshDirectory() {
  const [users, projects] = await Promise.all([getUsers(), loadProjects()])
  state.users = users
  state.projects = projects

  if (!users.some((user) => String(user.id) === String(state.selectedUserId))) {
    state.selectedUserId = users[0]?.id || null
    if (state.selectedUserId) {
      localStorage.setItem('selectedUserId', state.selectedUserId)
    }
  }
}

async function loadTasks() {
  return getTasks()
}

function getActiveTask() {
  return state.tasks.find((task) => String(task.id) === String(state.activeTaskId)) || null
}

function getMyTasksCount() {
  if (!state.selectedUserId) return 0
  return state.allTasks.filter((task) => String(task.assignee_id) === String(state.selectedUserId)).length
}

function render() {
  const activeTask = getActiveTask()

  const root = document.createElement('div')
  root.className = `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`

  const sidebar = Sidebar({
    projects: state.projects,
    users: state.users,
    activeProjectId: state.activeProjectId,
    view: state.view,
    myTasksCount: getMyTasksCount(),
    selectedUserId: state.selectedUserId,
    collapsed: state.sidebarCollapsed,
  })

  const headerLabel = state.view === 'dashboard'
    ? 'Dashboard'
    : state.view === 'my'
      ? 'My Tasks'
      : state.view === 'timeline'
        ? 'Timeline'
        : 'All Tasks'
  const headerDescription = state.view === 'dashboard'
    ? 'Track workload, due dates, and assignments at a glance.'
    : state.activeProjectId
      ? 'Showing tasks for the selected project.'
      : 'Track work across projects with a Linear-inspired workflow.'

  root.innerHTML = `
    ${sidebar}
    <main class="main-panel">
      <section class="header-bar">
        <div class="header-title">
          <h2>${headerLabel}</h2>
          <p>${headerDescription}</p>
        </div>
      </section>

      ${state.view === 'dashboard'
        ? ''
        : FilterBar({
            users: state.users,
            filters: state.filters,
            view: state.view,
            selectedUserId: state.selectedUserId,
          })}

      <section class="content-area" data-content-area>
        ${state.view === 'dashboard'
          ? Dashboard({ tasks: state.allTasks, users: state.users, loading: state.isLoadingTasks })
          : state.view === 'timeline'
            ? TimelineView({ tasks: state.tasks, users: state.users, projects: state.projects, activeTaskId: state.activeTaskId, loading: state.isLoadingTasks })
            : TaskList({ tasks: state.tasks, users: state.users, projects: state.projects, activeTaskId: state.activeTaskId, loading: state.isLoadingTasks })}
      </section>
    </main>
    ${TaskModal({ task: activeTask, users: state.users, projects: state.projects, open: getModalIsOpen(), closing: state.isTaskModalClosing })}
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      ${state.toasts
        .map(
          (toast) => `
            <div class="toast toast-${toast.tone}">
              <span>${toast.message}</span>
              <button type="button" class="toast-dismiss" data-action="dismiss-toast" data-toast-id="${toast.id}">×</button>
            </div>
          `
        )
        .join('')}
    </div>
  `

  app.innerHTML = ''
  app.appendChild(root)
  bindEvents()
}

function bindEvents() {
  app.querySelectorAll('[data-action="dismiss-toast"]').forEach((button) => {
    button.addEventListener('click', () => {
      removeToast(button.dataset.toastId)
    })
  })

  app.querySelectorAll('[data-action="navigate"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const nextView = button.dataset.view
      state.activeProjectId = null
      state.activeTaskId = null

      if (nextView === 'dashboard') {
        state.view = 'dashboard'
      } else if (nextView === 'my') {
        state.view = 'my'
      } else if (nextView === 'timeline') {
        state.view = 'timeline'
      } else {
        state.view = 'list'
      }

      localStorage.setItem('view', state.view)

      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="select-project"]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.activeProjectId = button.dataset.projectId
      state.view = 'list'
      state.activeTaskId = null
      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="set-view"]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.view = button.dataset.view
      if (state.view !== 'my') {
        state.activeProjectId = null
      }

      localStorage.setItem('view', state.view)
      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="toggle-status"]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const status = button.dataset.status
      event.preventDefault()

      if (!status) {
        return
      }

      state.filters.statuses = state.filters.statuses.includes(status)
        ? state.filters.statuses.filter((value) => value !== status)
        : [...state.filters.statuses, status]

      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="filter-assignee"]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.filters.assigneeId = button.dataset.userId || ''
      hideFilterMenu()
      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="filter-priority"]').forEach((select) => {
    select.addEventListener('change', async (event) => {
      state.filters.priority = event.target.value
      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="filter-search"]').forEach((input) => {
    input.addEventListener('input', async (event) => {
      state.filters.search = event.target.value
      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="clear-filters"]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.filters = {
        statuses: [],
        assigneeId: '',
        priority: '',
        search: '',
      }
      await refreshTasks()
    })
  })

  app.querySelectorAll('[data-action="toggle-filter-menu"]').forEach((button) => {
    button.addEventListener('click', () => {
      const menu = app.querySelector('[data-filter-menu]')
      if (menu) {
        menu.classList.toggle('is-open')
      }
    })
  })

  app.querySelectorAll('[data-action="open-task"]').forEach((button) => {
    const openTask = () => {
      state.activeTaskId = button.dataset.taskId
      state.isTaskModalOpen = true
      render()
    }

    button.addEventListener('click', openTask)
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openTask()
      }
    })
  })

  app.querySelectorAll('[data-action="new-task"]').forEach((button) => {
    button.addEventListener('click', () => {
      openNewTaskModal()
    })
  })

  app.querySelectorAll('[data-action="switch-user"]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.selectedUserId = button.dataset.userId
      localStorage.setItem('selectedUserId', state.selectedUserId)
      if (state.view === 'my' || state.view === 'dashboard') {
        await refreshTasks()
      } else {
        render()
      }
    })
  })

  app.querySelectorAll('[data-action="toggle-sidebar-collapse"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed))
      render()
    })
  })

  app.querySelectorAll('[data-action="cycle-status"]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation()

      const taskId = button.dataset.taskId
      const task = state.tasks.find((item) => String(item.id) === String(taskId))

      if (!task) {
        return
      }

      const nextStatus = getNextStatus(task.status)
      const snapshot = {
        allTasks: [...state.allTasks],
        tasks: [...state.tasks],
      }
      const nextTask = {
        ...task,
        status: nextStatus,
      }

      upsertTask(nextTask)
      render()

      try {
        await updateTask(task.id, {
          title: task.title,
          description: task.description,
          project_id: task.project_id,
          assignee_id: task.assignee_id,
          status: nextStatus,
          priority: task.priority,
          start_date: task.start_date,
          due_date: task.due_date,
        })
        addToast('Task status updated')
      } catch (error) {
        state.allTasks = snapshot.allTasks
        state.tasks = snapshot.tasks
        addToast('Could not update task status', 'error')
      }

      await refreshTasks({ showLoading: false })
    })
  })

  const projectForm = app.querySelector('[data-action="create-project-form"]')
  if (projectForm) {
    projectForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const formData = new FormData(projectForm)
      const name = String(formData.get('name') || '').trim()
      const description = String(formData.get('description') || '').trim()

      if (!name) {
        addToast('Project name is required', 'error')
        return
      }

      try {
        await createProject({ name, description: description || null })
        projectForm.reset()
        await refreshDirectory()
        render()
        addToast('Project created')
      } catch (error) {
        addToast(error.message || 'Could not create project', 'error')
      }
    })
  }

  const userForm = app.querySelector('[data-action="create-user-form"]')
  if (userForm) {
    userForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const formData = new FormData(userForm)
      const name = String(formData.get('name') || '').trim()
      const email = String(formData.get('email') || '').trim()
      const avatarColor = String(formData.get('avatar_color') || '').trim()

      if (!name || !email) {
        addToast('Name and email are required', 'error')
        return
      }

      try {
        await createUser({
          name,
          email,
          avatar_color: avatarColor || null,
        })
        userForm.reset()
        await refreshDirectory()
        render()
        addToast('User created')
      } catch (error) {
        addToast(error.message || 'Could not create user', 'error')
      }
    })
  }

  const taskForm = app.querySelector('[data-task-form]')
  if (taskForm) {
    taskForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const snapshot = {
        allTasks: [...state.allTasks],
        tasks: [...state.tasks],
      }
      const formData = new FormData(taskForm)
      const payload = {
        title: formData.get('title'),
        description: formData.get('description'),
        project_id: formData.get('project_id') || null,
        assignee_id: formData.get('assignee_id') || null,
        status: formData.get('status'),
        priority: formData.get('priority'),
        start_date: formData.get('start_date') || null,
        due_date: formData.get('due_date') || null,
      }

      const taskId = formData.get('id')
      if (taskId) {
        const nextTask = {
          ...snapshot.allTasks.find((task) => String(task.id) === String(taskId)),
          ...payload,
        }

        upsertTask(nextTask)
        closeTaskModal()
        render()

        try {
          await updateTask(taskId, payload)
          addToast('Task updated')
        } catch (error) {
          state.allTasks = snapshot.allTasks
          state.tasks = snapshot.tasks
          addToast('Could not update task', 'error')
        }
      } else {
        const tempId = `temp-${Date.now()}`
        const optimisticTask = {
          id: tempId,
          project_id: payload.project_id,
          title: payload.title,
          description: payload.description,
          status: payload.status || 'todo',
          priority: payload.priority || 'medium',
          assignee_id: payload.assignee_id,
          start_date: payload.start_date,
          due_date: payload.due_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        state.allTasks = [optimisticTask, ...state.allTasks]
        state.tasks = state.allTasks.filter(taskMatchesFilters)
        state.activeTaskId = tempId
        closeTaskModal()
        render()

        try {
          const task = await createTask(payload)
          state.allTasks = state.allTasks.map((item) => (String(item.id) === tempId ? task : item))
          state.tasks = state.allTasks.filter(taskMatchesFilters)
          state.activeTaskId = task.id
          addToast('Task created')
        } catch (error) {
          state.allTasks = snapshot.allTasks
          state.tasks = snapshot.tasks
          addToast('Could not create task', 'error')
        }
      }

      await refreshTasks({ showLoading: false })
    })
  }

  const deleteButton = app.querySelector('[data-action="delete-task"]')
  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      if (!state.activeTaskId) return

      const snapshot = {
        allTasks: [...state.allTasks],
        tasks: [...state.tasks],
      }
      const taskId = state.activeTaskId
      removeTaskFromState(taskId)
      state.activeTaskId = null
      closeTaskModal()
      render()

      try {
        await deleteTask(taskId)
        addToast('Task deleted')
      } catch (error) {
        state.allTasks = snapshot.allTasks
        state.tasks = snapshot.tasks
        addToast('Could not delete task', 'error')
      }

      await refreshTasks({ showLoading: false })
    })
  }

  app.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
    button.addEventListener('click', () => {
      closeTaskModal()
    })
  })

  const modalBackdrop = app.querySelector('.task-modal-backdrop')
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      closeTaskModal()
    })
  }

  window.onkeydown = (event) => {
    if (event.key === 'Escape') {
      if (getModalIsOpen()) {
        closeTaskModal()
      }

      const menu = app.querySelector('[data-filter-menu]')
      if (menu?.classList.contains('is-open')) {
        menu.classList.remove('is-open')
      }

      return
    }

    if (isTypingTarget(event.target)) {
      return
    }

    if (event.key === '/') {
      event.preventDefault()
      focusSearch()
      return
    }

    if (event.key.toLowerCase() === 'c') {
      event.preventDefault()
      openNewTaskModal()
    }
  }

}

function hideFilterMenu() {
  const menu = app.querySelector('[data-filter-menu]')
  if (menu) {
    menu.classList.remove('is-open')
  }
}

async function refreshTasks({ showLoading = true } = {}) {
  if (showLoading) {
    state.isLoadingTasks = true
    render()
  }

  state.allTasks = await loadTasks()
  state.tasks = state.allTasks.filter(taskMatchesFilters)
  if (state.activeTaskId && !getActiveTask()) {
    state.activeTaskId = state.tasks[0]?.id || null
  }
  state.isLoadingTasks = false
  render()
}

async function init() {
  await refreshDirectory()
  state.sidebarCollapsed = readStoredBoolean('sidebarCollapsed')
  state.view = localStorage.getItem('view') || 'list'
  state.selectedUserId = localStorage.getItem('selectedUserId') || state.users[0]?.id || null
  const hasSelectedUser = state.users.some((user) => String(user.id) === String(state.selectedUserId))
  if (!hasSelectedUser) {
    state.selectedUserId = state.users[0]?.id || null
  }

  if (state.selectedUserId) {
    localStorage.setItem('selectedUserId', state.selectedUserId)
  }

  localStorage.setItem('view', state.view)

  state.isBooting = false
  await refreshTasks({ showLoading: true })
}

init().catch((error) => {
  app.innerHTML = `<pre class="empty-state">${error.message}</pre>`
})
