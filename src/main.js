
import './style.css'

// 1. Create the app interface
document.querySelector('#app').innerHTML = `
  <main class="min-h-screen bg-rose-50 px-4 py-10 text-slate-800">
    <section class="mx-auto max-w-xl">
      <header class="mb-8 text-center">
        <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-rose-500">
          Your daily planner
        </p>
        <h1 class="text-4xl font-extrabold tracking-tight text-slate-900">
          My To-Do List
        </h1>
        <p class="mt-3 text-slate-500">
          Small steps make big progress.
        </p>
      </header>

      <section class="rounded-2xl bg-white p-5 shadow-lg shadow-rose-100 sm:p-7">
        <form id="todo-form" class="flex flex-col gap-3">
          <input
            id="todo-input"
            type="text"
            placeholder="What do you need to do?"
            maxlength="150"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            aria-label="New task"
          />

          <div class="flex flex-col gap-3 sm:flex-row">
            <select
              id="priority-input"
              class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
              aria-label="Task priority"
            >
              <option value="Low">Low priority</option>
              <option value="Medium" selected>Medium priority</option>
              <option value="High">High priority</option>
            </select>

            <button
              type="submit"
              class="rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-600 focus:ring-2 focus:ring-rose-400"
            >
              + Add task
            </button>
          </div>
        </form>

        <p id="form-message" class="mt-2 text-sm text-rose-600" role="alert"></p>

        <input
          id="search-input"
          type="search"
          placeholder="Search your tasks..."
          class="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          aria-label="Search tasks"
        />

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p id="task-counter" class="text-sm font-medium text-slate-500">
            0 tasks left
          </p>

          <div class="flex flex-wrap gap-2" aria-label="Filter tasks">
            <button data-filter="all" class="filter-btn rounded-lg bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700" aria-pressed="true">All</button>
            <button data-filter="active" class="filter-btn rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100" aria-pressed="false">Active</button>
            <button data-filter="completed" class="filter-btn rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100" aria-pressed="false">Completed</button>
          </div>
        </div>

        <ul id="todo-list" class="mt-5 space-y-3"></ul>

        <div id="empty-state" class="py-10 text-center">
          <p class="text-4xl">🌷</p>
          <p id="empty-title" class="mt-3 font-semibold text-slate-700">
            Nothing on your list yet
          </p>
          <p id="empty-description" class="mt-1 text-sm text-slate-400">
            Add a task and make today count!
          </p>
        </div>

        <div class="mt-5 flex justify-end border-t border-slate-100 pt-4">
          <button
            id="clear-completed"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:ring-2 focus:ring-rose-300"
          >
            Clear completed
          </button>
        </div>
      </section>

      <p class="mt-5 text-center text-xs text-slate-400">
        Made with care · One task at a time ♡
      </p>
    </section>
  </main>
`

// 2. Select HTML elements
const form = document.querySelector('#todo-form')
const input = document.querySelector('#todo-input')
const priorityInput = document.querySelector('#priority-input')
const message = document.querySelector('#form-message')
const todoList = document.querySelector('#todo-list')
const counter = document.querySelector('#task-counter')
const emptyState = document.querySelector('#empty-state')
const emptyTitle = document.querySelector('#empty-title')
const emptyDescription = document.querySelector('#empty-description')
const searchInput = document.querySelector('#search-input')
const clearCompletedButton = document.querySelector('#clear-completed')
const filterButtons = document.querySelectorAll('.filter-btn')

// 3. Load saved tasks
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem('week4-todo-tasks')
    return savedTasks ? JSON.parse(savedTasks) : []
  } catch (error) {
    console.error('Could not load saved tasks:', error)
    return []
  }
}

let tasks = loadTasks()
let currentFilter = 'all'
let searchTerm = ''

// 4. Save tasks to localStorage
function saveTasks() {
  try {
    localStorage.setItem('week4-todo-tasks', JSON.stringify(tasks))
  } catch (error) {
    console.error('Could not save tasks:', error)
    message.textContent = 'Could not save tasks in this browser.'
  }
}

// 5. Add a new task with validation
form.addEventListener('submit', function (event) {
  event.preventDefault()

  const title = input.value.trim()

  if (title === '') {
    message.textContent = 'Please enter a task first!'
    input.focus()
    return
  }

  const newTask = {
    id: Date.now(),
    title: title,
    completed: false,
    priority: priorityInput.value
  }

  tasks.push(newTask)

  saveTasks()
  form.reset()
  message.textContent = ''
  priorityInput.value = 'Medium'

  renderTasks()
  input.focus()
})

// 6. Filter and search tasks
filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    currentFilter = button.dataset.filter

    filterButtons.forEach(function (item) {
      const selected = item.dataset.filter === currentFilter

      item.setAttribute('aria-pressed', String(selected))
      item.classList.toggle('bg-rose-100', selected)
      item.classList.toggle('text-rose-700', selected)
      item.classList.toggle('text-slate-500', !selected)
    })

    renderTasks()
  })
})

// Extra feature: search
searchInput.addEventListener('input', function () {
  searchTerm = searchInput.value.trim().toLowerCase()
  renderTasks()
})

// 7. Render tasks on the page
function renderTasks() {
  todoList.innerHTML = ''

  const visibleTasks = tasks.filter(function (task) {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed)

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm)

    return matchesFilter && matchesSearch
  })

  visibleTasks.forEach(function (task) {
    const li = document.createElement('li')
    li.className =
      'flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 sm:p-4'

    // Complete checkbox
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = task.completed
    checkbox.setAttribute('aria-label', `Complete ${task.title}`)
    checkbox.className = 'h-5 w-5 accent-rose-500'

    checkbox.addEventListener('change', function () {
      task.completed = checkbox.checked
      saveTasks()
      renderTasks()
    })

    // Task information
    const details = document.createElement('div')
    details.className = 'min-w-0 flex-1'

    const title = document.createElement('p')
    title.textContent = task.title
    title.className = 'break-words font-medium'

    if (task.completed) {
      title.classList.add('text-slate-400', 'line-through')
    }

    const priority = document.createElement('span')
    priority.textContent = `${task.priority || 'Medium'} priority`

    const priorityColors = {
      Low: 'text-emerald-600',
      Medium: 'text-amber-600',
      High: 'text-rose-600'
    }

    priority.className =
      `mt-1 inline-block text-xs font-semibold ${priorityColors[task.priority] || priorityColors.Medium}`

    details.append(title, priority)

    // Edit task in place
    const editButton = document.createElement('button')
    editButton.type = 'button'
    editButton.textContent = 'Edit'
    editButton.className =
      'rounded-lg px-2 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50'
    editButton.setAttribute('aria-label', `Edit ${task.title}`)

    editButton.addEventListener('click', function () {
      const editForm = document.createElement('form')
      editForm.className = 'flex w-full flex-wrap gap-2'

      const editInput = document.createElement('input')
      editInput.type = 'text'
      editInput.maxLength = 150
      editInput.value = task.title
      editInput.className =
        'min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2'
      editInput.setAttribute('aria-label', 'Edit task title')

      const saveButton = document.createElement('button')
      saveButton.type = 'submit'
      saveButton.textContent = 'Save'
      saveButton.className =
        'rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white'

      const cancelButton = document.createElement('button')
      cancelButton.type = 'button'
      cancelButton.textContent = 'Cancel'
      cancelButton.className =
        'rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold'

      editForm.append(editInput, saveButton, cancelButton)
      li.replaceChildren(editForm)
      editInput.focus()
      editInput.select()

      editForm.addEventListener('submit', function (event) {
        event.preventDefault()

        const updatedTitle = editInput.value.trim()

        if (!updatedTitle) {
          editInput.focus()
          return
        }

        task.title = updatedTitle
        saveTasks()
        renderTasks()
      })

      cancelButton.addEventListener('click', renderTasks)
    })

    // Delete task with confirmation
    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.textContent = 'Delete'
    deleteButton.className =
      'rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600'
    deleteButton.setAttribute('aria-label', `Delete ${task.title}`)

    deleteButton.addEventListener('click', function () {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
      )

      if (confirmed) {
        tasks = tasks.filter(function (item) {
          return item.id !== task.id
        })

        saveTasks()
        renderTasks()
      }
    })

    li.append(checkbox, details, editButton, deleteButton)
    todoList.appendChild(li)
  })

  // 8. Update remaining-task counter
  const remainingTasks = tasks.filter(function (task) {
    return !task.completed
  }).length

  counter.textContent =
    `${remainingTasks} ${remainingTasks === 1 ? 'task' : 'tasks'} left`

  // 9. Empty state
  emptyState.classList.toggle('hidden', visibleTasks.length > 0)

  if (visibleTasks.length === 0) {
    if (tasks.length === 0) {
      emptyTitle.textContent = 'Nothing on your list yet'
      emptyDescription.textContent = 'Add a task and make today count!'
    } else {
      emptyTitle.textContent = 'No matching tasks'
      emptyDescription.textContent = 'Try another filter or search term.'
    }
  }
}

// 10. Clear completed tasks
clearCompletedButton.addEventListener('click', function () {
  const completedCount = tasks.filter(function (task) {
    return task.completed
  }).length

  if (completedCount === 0) {
    message.textContent = 'There are no completed tasks to clear.'
    return
  }

  tasks = tasks.filter(function (task) {
    return !task.completed
  })

  message.textContent = ''
  saveTasks()
  renderTasks()
})

// Display tasks when the app starts
renderTasks()
