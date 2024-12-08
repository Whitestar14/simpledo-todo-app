import template from "../js/template.min.js";

const STORAGE_KEY = "tasks";
const SELECTORS = {
  taskInput: ".taskInput",
  taskList: "#taskList",
  clearBtn: ".clearCompleted",
  addBtn: ".addTaskBtn",
  searchInput: ".search-input",
  filters: ".filters",
};

let tasks = (() => {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return savedTasks.map((task) => ({
      id: task.id || Date.now(),
      text: task.text,
      completed: task.completed || false,
      category: task.category || "personal",
      priority: task.priority || "medium",
      dueDate: task.dueDate || null,
      description: task.description || "",
      subtasks: task.subtasks || [],
      order: task.order || 0,
    }));
  } catch (e) {
    console.error("Failed to load tasks:", e);
    return [];
  }
})();

const renderPage = () => {
  // Add a fallback to prevent complete document loss
  if (template) {
    document.body.innerHTML = template;
  } else {
    document.body.innerHTML = "<div>Error rendering page</div>";
  }

  setupEditModalListeners();
  setupSubtaskModalListeners();
  initializeComponents();
  console.log("Code by Whitestar Studios (Whitestar14, O.S David, Dec 2024)");
};

const initializeComponents = () => {
  const elements = {
    input: document.querySelector(SELECTORS.taskInput),
    list: document.querySelector(SELECTORS.taskList),
    completedBtn: document.querySelector(SELECTORS.clearBtn),
    searchInput: document.querySelector(SELECTORS.searchInput),
    categorySelect: document.querySelector(".category-select"),
    prioritySelect: document.querySelector(".priority-select"),
    dueDate: document.querySelector(".due-date"),
    description: document.querySelector(".task-description"),
  };

  setupEventListeners(elements);
  initDragAndDrop();
  renderTasks();
  updateProgress();
};

const setupEditModalListeners = () => {
  const modal = document.getElementById("editTaskModal");
  const closeModalBtn = document.querySelector(".close-modal");
  const editForm = document.getElementById("editTaskForm");
  const addSubtaskBtn = document.getElementById("addSubtaskBtn");
  const subtasksList = document.getElementById("editSubtasksList");

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  addSubtaskBtn.addEventListener("click", () => {
    const subtaskItem = document.createElement("div");
    subtaskItem.className = "subtask-edit-item";
    subtaskItem.innerHTML = `
      <input type="text" class="subtask-text" placeholder="Subtask description">
      <button type="button" class="remove-subtask">×</button>
    `;

    subtaskItem
      .querySelector(".remove-subtask")
      .addEventListener("click", () => {
        subtaskItem.remove();
      });

    subtasksList.appendChild(subtaskItem);
  });

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskId = Number(document.getElementById("editTaskId").value);
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      task.text = document.getElementById("editTaskText").value.trim();
      task.category = document.getElementById("editCategory").value;
      task.priority = document.getElementById("editPriority").value;
      task.dueDate = document.getElementById("editDueDate").value || null;
      task.description = document
        .getElementById("editDescription")
        .value.trim();

      task.subtasks = Array.from(
        document.querySelectorAll("#editSubtasksList .subtask-text")
      )
        .map((input) => input.value.trim())
        .filter((text) => text)
        .map((text) => ({
          id: Date.now(),
          text: text,
          completed: false,
        }));

      renderTasks();
      saveToStorage();
      modal.style.display = "none";
    }
  });
};

const renderTasks = () => {
  const fragment = document.createDocumentFragment();
  const list = document.querySelector(SELECTORS.taskList);
  const filteredTasks = filterTasks();

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "task-message";
    emptyState.innerHTML = "<p>There are no tasks yet</p>";
    fragment.appendChild(emptyState);
  }

  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    fragment.appendChild(taskElement);
  });

  list.innerHTML = "";
  list.appendChild(fragment);
  saveToStorage();
  updateProgress();
};

const createTaskElement = (task) => {
  const taskElement = document.createElement("div");
  taskElement.className = `task ${task.completed ? "completed" : ""} priority-${
    task.priority
  }`;
  taskElement.setAttribute("draggable", true);
  taskElement.dataset.id = task.id;

  taskElement.innerHTML = `
    <div class="task-header">
      <span class="category-badge ${task.category}">${task.category}</span>
      <span class="priority-badge">${task.priority}</span>
      ${
        task.dueDate
          ? `<span class="due-date">Due: ${new Date(
              task.dueDate
            ).toLocaleDateString()}</span>`
          : ""
      }
    </div>
    <div class="task-content">
      <input class="checkbox" type="checkbox" ${
        task.completed ? "checked" : ""
      } data-id="${task.id}" />
      <span class="task-text">${escapeHtml(task.text)}</span>
    </div>
    ${
      task.description
        ? `<div class="task-description">${escapeHtml(task.description)}</div>`
        : ""
    }
    <div class="subtasks">
      ${renderSubtasks(task.subtasks)}
    </div>
    <div class="task-actions">
      <button class="edit" data-id="${task.id}">Edit</button>
      <button class="delete" data-id="${task.id}">Delete</button>
      <button class="add-subtask" data-id="${task.id}">+ Subtask</button>
    </div>
  `;

  return taskElement;
};

const addTask = () => {
  const input = document.querySelector(SELECTORS.taskInput);
  const taskText = input.value.trim();

  if (taskText) {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      category: document.querySelector(".category-select").value,
      priority: document.querySelector(".priority-select").value,
      dueDate: document.querySelector(".due-date").value || null,
      description: document.querySelector(".task-description").value.trim(),
      subtasks: [],
      order: tasks.length,
    };

    tasks.push(newTask);
    input.value = "";
    document.querySelector(".task-description").value = "";
    renderTasks();
  }
};

const filterTasks = () => {
  const searchQuery =
    document.querySelector(".search-input")?.value.toLowerCase() || "";
  const categoryFilter =
    document.querySelector(".category-filter")?.value || "all";
  const priorityFilter =
    document.querySelector(".priority-filter")?.value || "all";

  return tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery);
    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });
};

const initDragAndDrop = () => {
  const taskList = document.querySelector(SELECTORS.taskList);

  taskList.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("task")) {
      e.target.classList.add("dragging");
    }
  });

  taskList.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("task")) {
      e.target.classList.remove("dragging");
      updateTasksOrder();
    }
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggable = document.querySelector(".dragging");
    if (!draggable) return;

    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement) {
      taskList.insertBefore(draggable, afterElement);
    } else {
      taskList.appendChild(draggable);
    }
  });
};

const updateProgress = () => {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const progressBar = document.querySelector(".progress-bar");
  const progressText = document.querySelector(".progress-text");

  if (progressBar && progressText) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% Complete`;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderPage();

  document
    .querySelector(".search-input")
    ?.addEventListener("input", renderTasks);
  document
    .querySelector(".category-filter")
    ?.addEventListener("change", renderTasks);
  document
    .querySelector(".priority-filter")
    ?.addEventListener("change", renderTasks);
});

const renderSubtasks = (subtasks) => {
  if (!subtasks.length) return "";

  return `
    <div class="subtasks-list">
      ${subtasks
        .map(
          (subtask, index) => `
        <div class="subtask" data-index="${index}">
          <input type="checkbox" ${subtask.completed ? "checked" : ""} 
            class="subtask-checkbox" data-subtask-index="${index}">
          <span class="subtask-text">${escapeHtml(subtask.text)}</span>
          <button class="delete-subtask" data-subtask-index="${index}">×</button>
        </div>
      `
        )
        .join("")}
    </div>
  `;
};

const toggleSubtask = (taskId, subtaskIndex) => {
  const task = tasks.find((t) => t.id === taskId);
  if (task?.subtasks?.[subtaskIndex]) {
    task.subtasks[subtaskIndex].completed =
      !task.subtasks[subtaskIndex].completed;
    renderTasks();
    saveToStorage();
  }
};

const deleteSubtask = (taskId, subtaskIndex) => {
  const task = tasks.find((t) => t.id === taskId);
  if (task && task.subtasks[subtaskIndex]) {
    task.subtasks.splice(subtaskIndex, 1);
    renderTasks();
  }
};

const updateTasksOrder = () => {
  const taskElements = document.querySelectorAll(".task");
  const newOrder = Array.from(taskElements).map((el) =>
    parseInt(el.dataset.id)
  );

  tasks.sort((a, b) => {
    return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
  });

  saveToStorage();
};

const getDragAfterElement = (container, y) => {
  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
};

// Add these essential functions

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks:", e);
  }
};

const toggleTask = (taskId) => {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
  }
};

const deleteTask = (taskId) => {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks.splice(index, 1);
    renderTasks();
  }
};

// Modify the editTask function to open the modal
const editTask = (taskId) => {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  // Show the edit modal
  const modal = document.getElementById("editTaskModal");
  const form = document.getElementById("editTaskForm");
  const subtasksList = document.getElementById("editSubtasksList");

  // Populate modal with task details
  document.getElementById("editTaskId").value = task.id;
  document.getElementById("editTaskText").value = task.text;
  document.getElementById("editCategory").value = task.category || "personal";
  document.getElementById("editPriority").value = task.priority || "medium";
  document.getElementById("editDueDate").value = task.dueDate || "";
  document.getElementById("editDescription").value = task.description || "";

  // Populate subtasks
  subtasksList.innerHTML = "";
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((subtask) => {
      const subtaskItem = document.createElement("div");
      subtaskItem.className = "subtask-edit-item";
      subtaskItem.innerHTML = `
        <input type="text" class="subtask-text" value="${escapeHtml(
          subtask.text
        )}" placeholder="Subtask description">
        <button type="button" class="remove-subtask">×</button>
      `;

      subtaskItem
        .querySelector(".remove-subtask")
        .addEventListener("click", () => {
          subtaskItem.remove();
        });

      subtasksList.appendChild(subtaskItem);
    });
  }

  // Show the modal
  modal.style.display = "grid";
  saveToStorage();
};

const addSubtask = (taskId) => {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const modal = document.getElementById("subtaskModal");
  document.getElementById("subtaskParentId").value = taskId;
  modal.style.display = "grid";
};

// Add this to your setupEventListeners function
const setupSubtaskModalListeners = () => {
  const modal = document.getElementById("subtaskModal");
  const closeBtn = document.querySelector(".close-modal-subtask");
  const form = document.getElementById("subtaskForm");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const parentId = Number(document.getElementById("subtaskParentId").value);
    const task = tasks.find((t) => t.id === parentId);

    if (task) {
      const subtaskText = document.getElementById("subtaskText").value.trim();

      if (subtaskText) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({
          id: Date.now(),
          text: subtaskText,
          completed: false,
        });

        renderTasks();
        saveToStorage();
        modal.style.display = "none";
        form.reset();
      }
    }
  });
};

const escapeHtml = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

const setupEventListeners = (elements) => {
  const { list, completedBtn, input } = elements;

  list.addEventListener("click", (e) => {
    const taskElement = e.target.closest(".task");
    if (!taskElement) return;

    const taskId = Number(taskElement.dataset.id);

    if (e.target.classList.contains("checkbox")) {
      toggleTask(taskId);
    } else if (e.target.classList.contains("delete")) {
      deleteTask(taskId);
    } else if (e.target.classList.contains("edit")) {
      editTask(taskId);
    } else if (e.target.classList.contains("add-subtask")) {
      addSubtask(taskId);
    } else if (e.target.classList.contains("subtask-checkbox")) {
      const subtaskIndex = Number(e.target.dataset.subtaskIndex);
      toggleSubtask(taskId, subtaskIndex);
    } else if (e.target.classList.contains("delete-subtask")) {
      const subtaskIndex = Number(e.target.dataset.subtaskIndex);
      deleteSubtask(taskId, subtaskIndex);
    }
  });

  document.querySelector(SELECTORS.addBtn).addEventListener("click", addTask);

  document
    .querySelector(SELECTORS.taskInput)
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addTask();
      }
    });

  completedBtn.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    renderTasks();
  });

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };
};
