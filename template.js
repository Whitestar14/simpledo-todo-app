const template = `
    <header>
      <h1>SimpleDo Tasks</h1>
      <div class="search-filter">
        <input type="text" class="search-input" placeholder="Search tasks..." />

        <div class="filters">
          <select class="category-filter">
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="shopping">Shopping</option>
          </select>

          <select class="priority-filter">
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar"></div>
        <span class="progress-text"></span>
      </div>
    </header>

    <main>
      <section id="taskList"></section>
      <section class="input-field">
        <div class="task-form">
          <input type="text" class="taskInput" placeholder="Add new task" />
          <div class="input-flex">
            <select class="category-select">
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="shopping">Shopping</option>
            </select>
            <select class="priority-select">
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
            <input type="date" class="due-date" />
          </div>
          <textarea
            class="task-description"
            placeholder="Add description"
          ></textarea>
          <div class="btn-container">
            <button class="addTaskBtn">
              <span>+</span>
            </button>
            <div class="clear-container">
              <button class="clearCompleted">Clear Completed Tasks</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Add modal for task editing -->
<div id="editTaskModal" class="modal">
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <h2>Edit Task</h2>
    <form id="editTaskForm">
      <input type="hidden" id="editTaskId" name="taskId" />
      <div class="form-group">
        <label for="editTaskText">Task Name</label>
        <input type="text" id="editTaskText" name="taskText" required />
      </div>
      <div class="form-group">
        <label for="editCategory">Category</label>
        <select id="editCategory" name="category">
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>
      <div class="form-group">
        <label for="editPriority">Priority</label>
        <select id="editPriority" name="priority">
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div class="form-group">
        <label for="editDueDate">Due Date</label>
        <input type="date" id="editDueDate" name="dueDate" />
      </div>
      <div class="form-group">
        <label for="editDescription">Description</label>
        <textarea id="editDescription" name="description"></textarea>
      </div>
      <div class="form-group">
        <h3>Subtasks</h3>
        <div id="editSubtasksList"></div>
        <button type="button" id="addSubtaskBtn">Add Subtask</button>
      </div>
      <button type="submit">Save Changes</button>
    </form>
  </div>
</div>

<!-- Add modal for adding subtasks -->
<!-- Add subtask modal -->
<div id="subtaskModal" class="modal">
  <div class="modal-content">
    <span class="close-modal-subtask">&times;</span>
    <h2>Add Subtask</h2>
    <form id="subtaskForm">
      <input type="hidden" id="subtaskParentId" name="parentTaskId" />
      <div class="form-group">
        <label for="subtaskText">Subtask Name</label>
        <input type="text" id="subtaskText" name="subtaskText" required />
      </div>
      <button type="submit">Add Subtask</button>
    </form>
  </div>
</div>

    </main>
  `;

export default template;
