const STATUS_OPTIONS = ['backlog', 'todo', 'in_progress', 'in_review', 'done']
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'urgent']

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?'
}

export function FilterBar({ users, filters, view, selectedUserId }) {
  const selectedAssignee = users.find((user) => String(user.id) === String(filters.assigneeId))
  const selectedActiveUser = users.find((user) => String(user.id) === String(selectedUserId))

  const userOptions = users
    .map(
      (user) => `
        <button class="filter-user-option ${String(filters.assigneeId) === String(user.id) ? 'is-selected' : ''}" type="button" data-action="filter-assignee" data-user-id="${user.id}">
          <span class="filter-avatar" style="background:${user.avatar_color || '#3b82f6'}">${getInitials(user.name)}</span>
          <span class="filter-user-name">${user.name}</span>
          ${String(filters.assigneeId) === String(user.id) ? '<span class="filter-check">✓</span>' : ''}
        </button>
      `
    )
    .join('')

  const statusChips = STATUS_OPTIONS
    .map((status) => {
      const isActive = filters.statuses.includes(status)
      return `
        <button type="button" class="chip ${isActive ? 'is-active' : ''}" data-action="toggle-status" data-status="${status}">
          ${status.replaceAll('_', ' ')}
        </button>
      `
    })
    .join('')

  const priorityOptionsMarkup = PRIORITY_OPTIONS
    .map(
      (priority) => `
        <option value="${priority}" ${filters.priority === priority ? 'selected' : ''}>${priority ? priority : 'All priorities'}</option>
      `
    )
    .join('')

  return `
    <div class="filter-bar">
      <div class="filter-bar-row filter-bar-row--top">
        <div class="filter-group filter-group--search">
          <label class="search-field">
            <span class="field-label">Search</span>
            <input data-action="filter-search" type="search" value="${filters.search || ''}" placeholder="Search by title" />
          </label>
        </div>

        <div class="view-switcher">
          <button class="chip ${view === 'list' ? 'is-active' : ''}" data-action="set-view" data-view="list">List</button>
          <button class="chip ${view === 'timeline' ? 'is-active' : ''}" data-action="set-view" data-view="timeline">Timeline</button>
        </div>
      </div>

      <div class="filter-bar-row">
        <div class="filter-group filter-group--assignee">
          <div class="filter-dropdown">
            <button class="filter-dropdown-trigger" type="button" data-action="toggle-filter-menu">
              <span class="field-label">Assignee</span>
              <span class="filter-dropdown-value">
                <span class="filter-avatar" style="background:${selectedAssignee?.avatar_color || '#2c2c2c'}">${selectedAssignee ? getInitials(selectedAssignee.name) : selectedActiveUser ? getInitials(selectedActiveUser.name) : '?'}</span>
                ${selectedAssignee?.name || 'Everyone'}
              </span>
            </button>
            <div class="filter-dropdown-menu" data-filter-menu>
              <button class="filter-user-option ${!filters.assigneeId ? 'is-selected' : ''}" type="button" data-action="filter-assignee" data-user-id="">
                <span class="filter-user-name">Everyone</span>
                ${!filters.assigneeId ? '<span class="filter-check">✓</span>' : ''}
              </button>
              ${userOptions}
            </div>
          </div>

          <label class="filter-select">
            <span class="field-label">Priority</span>
            <select data-action="filter-priority">
              ${priorityOptionsMarkup}
            </select>
          </label>
        </div>

        <div class="filter-group filter-group--status">
          <div class="field-label">Status</div>
          <div class="status-chip-row">
            ${statusChips}
          </div>
        </div>

        <div class="filter-actions">
          <button class="secondary-button" type="button" data-action="clear-filters">Clear filters</button>
        </div>
      </div>
    </div>
  `
}
