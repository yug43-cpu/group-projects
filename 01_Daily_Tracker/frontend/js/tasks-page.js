// ==================================================
// Tasks Page
// ==================================================


// ==================================================
// Date & Time
// ==================================================

function updateDateTime() {

    const now = new Date();


    const dateOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    };


    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    };


    document.getElementById("currentDate").textContent =
        now.toLocaleDateString(
            "en-IN",
            dateOptions
        );


    document.getElementById("currentTime").textContent =
        now.toLocaleTimeString(
            "en-IN",
            timeOptions
        );

}


updateDateTime();

setInterval(
    updateDateTime,
    1000
);


// ==================================================
// Elements
// ==================================================

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const openTaskModal =
    document.getElementById("openTaskModal");

const taskModal =
    document.getElementById("taskModal");

const closeTaskModal =
    document.getElementById("closeTaskModal");

const cancelTask =
    document.getElementById("cancelTask");

const taskForm =
    document.getElementById("taskForm");

const taskName =
    document.getElementById("taskName");

const taskPriority =
    document.getElementById("taskPriority");

const taskDueTime =
    document.getElementById("taskDueTime");


const editTaskModal =
    document.getElementById("editTaskModal");

const closeEditTaskModal =
    document.getElementById("closeEditTaskModal");

const cancelEditTask =
    document.getElementById("cancelEditTask");

const editTaskForm =
    document.getElementById("editTaskForm");

const editTaskName =
    document.getElementById("editTaskName");

const editTaskPriority =
    document.getElementById("editTaskPriority");

const editTaskDueTime =
    document.getElementById("editTaskDueTime");


const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const pendingTasks =
    document.getElementById("pendingTasks");

const taskProgressText =
    document.getElementById("taskProgressText");

const progressPercent =
    document.getElementById("progressPercent");

const taskProgress =
    document.getElementById("taskProgress");


let editingIndex = null;

let currentFilter = "all";


// ==================================================
// Get Tasks
// ==================================================

function getTasks() {

    return (
        JSON.parse(
            localStorage.getItem("tasks")
        ) || []
    );

}


// ==================================================
// Save Tasks
// ==================================================

function saveTasks(tasks) {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// ==================================================
// Load Tasks
// ==================================================

function loadTasks() {

    const tasks = getTasks();

    displayTasks(tasks);

    updateStatistics(tasks);

}


// ==================================================
// Display Tasks
// ==================================================

function displayTasks(tasks) {

    taskList.innerHTML = "";


    let filteredTasks = tasks;


    if (currentFilter === "pending") {

        filteredTasks =
            tasks.filter(
                task => !task.completed
            );

    }


    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(
                task => task.completed
            );

    }


    if (filteredTasks.length === 0) {

        emptyState.classList.add("show");

        return;

    }


    emptyState.classList.remove("show");


    filteredTasks.forEach(
        function (task) {

            const realIndex =
                tasks.indexOf(task);

            createTaskElement(
                task,
                realIndex
            );

        }
    );

}


// ==================================================
// Create Task Element
// ==================================================

function createTaskElement(
    task,
    index
) {

    const taskElement =
        document.createElement("div");


    taskElement.className =
        "task-item";


    if (task.completed) {

        taskElement.classList.add(
            "completed"
        );

    }


    let priorityClass =
        "priority-medium";


    if (task.priority === "High") {

        priorityClass =
            "priority-high";

    }
    else if (task.priority === "Low") {

        priorityClass =
            "priority-low";

    }


    taskElement.innerHTML = `

        <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? "checked" : ""}
            data-index="${index}"
        >


        <div class="task-content">

            <span class="task-name">
                ${escapeHTML(task.name)}
            </span>


            <div class="task-details">

                <span
                    class="priority ${priorityClass}"
                >
                    ${task.priority}
                </span>

                ${
                    task.dueTime
                        ? `
                            <span class="due-time">
                                Due: ${task.dueTime}
                            </span>
                        `
                        : ""
                }

            </div>

        </div>


        <div class="task-actions">

            <button
                class="task-action-btn edit-btn"
                data-index="${index}"
            >
                Edit
            </button>


            <button
                class="task-action-btn delete-btn"
                data-index="${index}"
            >
                Delete
            </button>

        </div>

    `;


    taskList.appendChild(
        taskElement
    );

}


// ==================================================
// Escape HTML
// ==================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==================================================
// Statistics
// ==================================================

function updateStatistics(tasks) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );

    }


    totalTasks.textContent =
        total;


    completedTasks.textContent =
        completed;


    pendingTasks.textContent =
        pending;


    taskProgressText.textContent =
        `${progress}%`;


    progressPercent.textContent =
        `${progress}%`;


    taskProgress.style.width =
        `${progress}%`;

}


// ==================================================
// Open Add Modal
// ==================================================

openTaskModal.addEventListener(
    "click",
    function () {

        editingIndex = null;

        taskForm.reset();

        taskPriority.value =
            "Medium";

        taskModal.classList.add(
            "active"
        );

        taskName.focus();

    }
);


// ==================================================
// Close Add Modal
// ==================================================

function closeTaskModalFunction() {

    taskModal.classList.remove(
        "active"
    );

    taskForm.reset();

    taskPriority.value =
        "Medium";

}


closeTaskModal.addEventListener(
    "click",
    closeTaskModalFunction
);


cancelTask.addEventListener(
    "click",
    closeTaskModalFunction
);


// ==================================================
// Close Add Modal Outside
// ==================================================

taskModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === taskModal
        ) {

            closeTaskModalFunction();

        }

    }
);


// ==================================================
// Add Task
// ==================================================

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            taskName.value.trim();


        const priority =
            taskPriority.value;


        const dueTime =
            taskDueTime.value;


        if (name === "") {

            return;

        }


        const tasks =
            getTasks();


        tasks.push({

            name: name,

            priority: priority,

            dueTime: dueTime,

            completed: false

        });


        saveTasks(tasks);


        loadTasks();


        closeTaskModalFunction();

    }
);


// ==================================================
// Task List Actions
// ==================================================

taskList.addEventListener(
    "click",
    function (event) {


        // Edit

        if (
            event.target.classList.contains(
                "edit-btn"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            openEditModal(index);

        }


        // Delete

        if (
            event.target.classList.contains(
                "delete-btn"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            deleteTask(index);

        }

    }
);


// ==================================================
// Complete Task
// ==================================================

taskList.addEventListener(
    "change",
    function (event) {

        if (
            !event.target.classList.contains(
                "task-checkbox"
            )
        ) {

            return;

        }


        const index =
            Number(
                event.target.dataset.index
            );


        const tasks =
            getTasks();


        if (!tasks[index]) {

            return;

        }


        tasks[index].completed =
            event.target.checked;


        saveTasks(tasks);


        loadTasks();

    }
);


// ==================================================
// Delete Task
// ==================================================

function deleteTask(index) {

    const tasks =
        getTasks();


    if (!tasks[index]) {

        return;

    }


    const confirmDelete =
        confirm(
            "Delete this task?"
        );


    if (!confirmDelete) {

        return;

    }


    tasks.splice(
        index,
        1
    );


    saveTasks(tasks);


    loadTasks();

}


// ==================================================
// Open Edit Modal
// ==================================================

function openEditModal(index) {

    const tasks =
        getTasks();


    const task =
        tasks[index];


    if (!task) {

        return;

    }


    editingIndex =
        index;


    editTaskName.value =
        task.name;


    editTaskPriority.value =
        task.priority;


    editTaskDueTime.value =
        task.dueTime || "";


    editTaskModal.classList.add(
        "active"
    );


    editTaskName.focus();

}


// ==================================================
// Close Edit Modal
// ==================================================

function closeEditModal() {

    editTaskModal.classList.remove(
        "active"
    );

    editTaskForm.reset();

    editingIndex = null;

}


closeEditTaskModal.addEventListener(
    "click",
    closeEditModal
);


cancelEditTask.addEventListener(
    "click",
    closeEditModal
);


editTaskModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === editTaskModal
        ) {

            closeEditModal();

        }

    }
);


// ==================================================
// Save Edited Task
// ==================================================

editTaskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (
            editingIndex === null
        ) {

            return;

        }


        const name =
            editTaskName.value.trim();


        if (name === "") {

            return;

        }


        const tasks =
            getTasks();


        if (!tasks[editingIndex]) {

            return;

        }


        tasks[editingIndex].name =
            name;


        tasks[editingIndex].priority =
            editTaskPriority.value;


        tasks[editingIndex].dueTime =
            editTaskDueTime.value;


        saveTasks(tasks);


        loadTasks();


        closeEditModal();

    }
);


// ==================================================
// Filters
// ==================================================

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                loadTasks();

            }
        );

    }
);


// ==================================================
// Initial Load
// ==================================================

loadTasks();