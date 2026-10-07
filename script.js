const API_URL = 'http://localhost:3500/todo';
let tasks = [];

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('taskInput');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const totalTasks = document.getElementById('totalTasks');
const clearCompleted = document.getElementById('clearCompleted');

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erreur API');
    const data = await response.json();
    tasks = Array.isArray(data) ? data : [];
    render();
  } catch (error) {
    console.error('Impossible de charger les tâches:', error);
    todoList.innerHTML = '<li class="empty-state">Impossible de charger les tâches.</li>';
  }
}

async function addTask(taskText) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tache: taskText,
      completed: false
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l’ajout');
  }

  await fetchTasks();
}

async function updateTask(taskId, completed) {
  const response = await fetch(`${API_URL}/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ completed })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour');
  }

  await fetchTasks();
}

async function deleteTask(taskId) {
  const response = await fetch(`${API_URL}/${taskId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression');
  }

  await fetchTasks();
}

function updateCounts() {
  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${tasks.length} tâche${tasks.length > 1 ? 's' : ''}`;
  totalTasks.textContent = remaining;
}

function createTodoItem(task) {
  const item = document.createElement('li');
  item.className = `todo-item ${task.completed ? 'completed' : ''}`;
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.className = 'todo-check';
  checkbox.setAttribute('aria-label', `Marquer comme terminée: ${task.tache}`);

  const content = document.createElement('div');
  content.className = 'todo-content';

  const label = document.createElement('div');
  label.className = 'todo-text';
  label.textContent = task.tache;

  const meta = document.createElement('div');
  meta.className = 'todo-meta';

  const tag = document.createElement('span');
  tag.className = 'todo-tag';
  tag.textContent = task.completed ? 'Terminée' : 'À faire';

  const time = document.createElement('span');
  time.textContent = task.completed ? 'Validée' : 'En cours';

  meta.append(tag, time);
  content.append(label, meta);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'delete-btn';
  removeBtn.setAttribute('aria-label', `Supprimer ${task.tache}`);
  removeBtn.textContent = '×';

  item.append(checkbox, content, removeBtn);

  checkbox.addEventListener('change', async () => {
    await updateTask(task.id, checkbox.checked);
  });

  removeBtn.addEventListener('click', async () => {
    await deleteTask(task.id);
  });

  return item;
}

function render() {
  todoList.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'Aucune tâche pour le moment. Ajoutez votre première idée !';
    todoList.appendChild(empty);
  } else {
    tasks.forEach((task) => todoList.appendChild(createTodoItem(task)));
  }

  updateCounts();
}

todoForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const value = todoInput.value.trim();
  if (!value) {
    todoInput.focus();
    return;
  }

  try {
    await addTask(value);
    todoForm.reset();
    todoInput.focus();
  } catch (error) {
    console.error(error);
  }
});

clearCompleted.addEventListener('click', async () => {
  const completedTasks = tasks.filter((task) => task.completed);

  for (const task of completedTasks) {
    await deleteTask(task.id);
  }
});

fetchTasks();
