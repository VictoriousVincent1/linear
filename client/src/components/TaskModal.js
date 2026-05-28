const statusOptions = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']
const priorityOptions = ['low', 'medium', 'high', 'urgent']

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export function TaskModal({ task, users, projects, open, closing }) {
  if (!open) {
    return ''
  }

  const isEditing = Boolean(task)
  const selectedStatus = task?.status || 'todo'
  const selectedPriority = task?.priority || 'medium'

  const userOptions = users
    .map(
      (user) => `<option value="${user.id}" ${String(task?.assignee_id || '') === String(user.id) ? 'selected' : ''}>${user.name}</option>`
    )
    .join('')

  const projectOptions = projects
    .map(
      (project) => `<option value="${project.id}" ${String(task?.project_id || '') === String(project.id) ? 'selected' : ''}>${project.name}</option>`
    )
    .join('')

  const statusMarkup = statusOptions
    .map((status) => `<option value="${status}" ${selectedStatus === status ? 'selected' : ''}>${status.replaceAll('_', ' ')}</option>`)
    .join('')

  const priorityMarkup = priorityOptions
    .map((priority) => `<option value="${priority}" ${selectedPriority === priority ? 'selected' : ''}>● ${priorityLabels[priority]}</option>`)
    .join('')

  return `
    <section class="task-modal ${closing ? 'is-closing' : 'is-open'}" aria-hidden="false">
      <button class="task-modal-backdrop" type="button" data-action="close-modal" aria-label="Close task modal"></button>

      <aside class="task-panel task-modal-panel" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div class="task-panel-header">
          <div>
            <p class="panel-kicker">Task detail</p>
            <h2 id="task-modal-title">${isEditing ? task.title : 'Create task'}</h2>
          </div>
          <button class="icon-button" type="button" data-action="close-modal">Cancel</button>
        </div>

        <form class="task-form" data-task-form>
          <input type="hidden" name="id" value="${task?.id || ''}" />
          <label>
            Title
            <input name="title" value="${task?.title || ''}" placeholder="Task title" required />
          </label>

          <label>
            Description
            <textarea name="description" rows="5" placeholder="Add details">${task?.description || ''}</textarea>
          </label>

          <div class="form-grid">
            <label>
              Status
              <select name="status">
                ${statusMarkup}
              </select>
            </label>
            <label>
              Priority
              <select name="priority">
                ${priorityMarkup}
              </select>
            </label>
            <label>
              Assignee
              <select name="assignee_id">
                <option value="">Unassigned</option>
                ${userOptions}
              </select>
            </label>
            <label>
              Project
              <select name="project_id">
                <option value="">None</option>
                ${projectOptions}
              </select>
            </label>
            <label>
              Start date
              <input type="date" name="start_date" value="${task?.start_date || ''}" />
            </label>
            <label>
              Due date
              <input type="date" name="due_date" value="${task?.due_date || ''}" />
            </label>
          </div>

          <div class="task-form-actions">
            ${isEditing ? '<button type="button" class="danger-button" data-action="delete-task">Delete</button>' : ''}
            <button type="button" class="secondary-button" data-action="close-modal">Cancel</button>
            <button type="submit" class="primary-button">Save</button>
          </div>
        </form>
      </aside>
    </section>
  `
}
