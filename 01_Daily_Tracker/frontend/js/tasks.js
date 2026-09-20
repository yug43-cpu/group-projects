// ================================
// Task Elements
// ================================

const addTaskButton =
    document.querySelector(".section-header button");

const taskList =
    document.querySelector(".task-list");

const taskCount =
    document.getElementById("taskCount");

const taskProgressText =
    document.getElementById("taskProgressText");

const taskProgress =
    document.getElementById("taskProgress");


// ================================
// Add Task Modal
// ================================

const taskModal =
    document.getElementById("taskModal");

const closeTaskModal =
    document.getElementById("closeTaskModal");

const cancelTask =
    document.getElementById("cancelTask");

const taskForm =
    document.getElementById("taskForm");

const taskNameInput =
    document.getElementById("taskName");

const taskPriorityInput =
    document.getElementById("taskPriority");

const taskDueTimeInput =
    document.getElementById("taskDueTime");


// ================================
// Edit Task Modal
// ================================

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

let currentEditingTask = null;


// ================================
// Load Tasks
// ================================

function loadTasks() {

    const savedTasks =
        JSON.parse(localStorage.getItem("tasks")) || [];

    taskList.innerHTML = "";

    savedTasks.forEach(function (task) {

        createTaskElement(task);

    });

    updateTaskCount();
}


// ================================
// Create Task Element
// ================================

function createTaskElement(task) {

    const taskDiv =
        document.createElement("div");

    taskDiv.classList.add("task");


    if (task.completed) {

        taskDiv.classList.add("completed");

    }


    taskDiv.innerHTML = `
        <input
            type="checkbox"
            ${task.completed ? "checked" : ""}
        >

        <div class="task-info">

            <span>${task.name}</span>

            <small>
                Priority: ${task.priority}
                ${task.dueTime ? " | Due: " + task.dueTime : ""}
            </small>

        </div>

        <div class="task-actions">

            <button class="edit-task">
                Edit
            </button>

            <button class="delete-task">
                Delete
            </button>

        </div>
    `;


    taskList.appendChild(taskDiv);
}


// ================================
// Save Tasks
// ================================

function saveTasks() {

    const tasks = [];


    taskList
        .querySelectorAll(".task")
        .forEach(function (task) {

            const name =
                task
                    .querySelector(".task-info span")
                    .textContent;


            const details =
                task
                    .querySelector(".task-info small")
                    .textContent;


            let priority = "Medium";

            let dueTime = "";


            // Get Priority

            if (
                details.includes("Priority: High")
            ) {

                priority = "High";

            }
            else if (
                details.includes("Priority: Low")
            ) {

                priority = "Low";

            }


            // Get Due Time

            if (
                details.includes(" | Due: ")
            ) {

                dueTime =
                    details
                        .split(" | Due: ")[1]
                        .trim();

            }


            tasks.push({

                name: name,

                priority: priority,

                dueTime: dueTime,

                completed:
                    task.classList.contains("completed")

            });

        });


    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}


// ================================
// Update Task Count & Progress
// ================================

function updateTaskCount() {

    const tasks =
        taskList.querySelectorAll(".task");

    const completedTasks =
        taskList.querySelectorAll(".task.completed");


    const totalTasks =
        tasks.length;

    const completedCount =
        completedTasks.length;


    // Task Count

    taskCount.textContent =
        `${completedCount}/${totalTasks}`;


    // Calculate Progress

    let progress = 0;


    if (totalTasks > 0) {

        progress =
            Math.round(
                (completedCount / totalTasks) * 100
            );

    }


    // Progress Percentage Text

    taskProgressText.textContent =
        `${progress}%`;


    // Progress Bar

    taskProgress.style.width =
        `${progress}%`;
}


// ================================
// Open Add Task Modal
// ================================

addTaskButton.addEventListener(
    "click",
    function () {

        taskForm.reset();

        taskPriorityInput.value = "Medium";

        taskModal.classList.add("active");

        taskNameInput.focus();

    }
);


// ================================
// Close Add Task Modal
// ================================

function closeModal() {

    taskModal.classList.remove("active");

    taskForm.reset();

    taskPriorityInput.value = "Medium";
}


closeTaskModal.addEventListener(
    "click",
    closeModal
);


cancelTask.addEventListener(
    "click",
    closeModal
);


// ================================
// Close Add Modal Outside
// ================================

taskModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === taskModal
        ) {

            closeModal();

        }

    }
);


// ================================
// Add Task
// ================================

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            taskNameInput.value.trim();


        const priority =
            taskPriorityInput.value;


        const dueTime =
            taskDueTimeInput.value;


        if (name === "") {

            return;

        }


        const task = {

            name: name,

            priority: priority,

            dueTime: dueTime,

            completed: false

        };


        createTaskElement(task);

        saveTasks();

        updateTaskCount();

        closeModal();

    }
);


// ================================
// Complete / Uncomplete Task
// ================================

taskList.addEventListener(
    "change",
    function (event) {

        if (
            event.target.type === "checkbox"
        ) {

            const task =
                event.target.closest(".task");


            task.classList.toggle(
                "completed"
            );


            saveTasks();

            updateTaskCount();

        }

    }
);


// ================================
// Open Edit Task Modal
// ================================

taskList.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "edit-task"
            )
        ) {

            currentEditingTask =
                event.target.closest(".task");


            const name =
                currentEditingTask
                    .querySelector(
                        ".task-info span"
                    )
                    .textContent;


            const details =
                currentEditingTask
                    .querySelector(
                        ".task-info small"
                    )
                    .textContent;


            let priority = "Medium";

            let dueTime = "";


            // Get Priority

            if (
                details.includes(
                    "Priority: High"
                )
            ) {

                priority = "High";

            }
            else if (
                details.includes(
                    "Priority: Low"
                )
            ) {

                priority = "Low";

            }


            // Get Due Time

            if (
                details.includes(
                    " | Due: "
                )
            ) {

                dueTime =
                    details
                        .split(" | Due: ")[1]
                        .trim();

            }


            // Fill Edit Form

            editTaskName.value =
                name;

            editTaskPriority.value =
                priority;

            editTaskDueTime.value =
                dueTime;


            // Open Edit Modal

            editTaskModal.classList.add(
                "active"
            );


            editTaskName.focus();

        }

    }
);


// ================================
// Save Edited Task
// ================================

editTaskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (!currentEditingTask) {

            return;

        }


        const name =
            editTaskName.value.trim();


        const priority =
            editTaskPriority.value;


        const dueTime =
            editTaskDueTime.value;


        if (name === "") {

            return;

        }


        // Update Name

        currentEditingTask
            .querySelector(
                ".task-info span"
            )
            .textContent =
                name;


        // Update Priority & Due Time

        currentEditingTask
            .querySelector(
                ".task-info small"
            )
            .textContent =
                `Priority: ${priority}` +
                (
                    dueTime
                        ? ` | Due: ${dueTime}`
                        : ""
                );


        saveTasks();

        updateTaskCount();

        closeEditModal();

    }
);


// ================================
// Close Edit Modal
// ================================

function closeEditModal() {

    editTaskModal.classList.remove(
        "active"
    );


    editTaskForm.reset();


    editTaskPriority.value =
        "Medium";


    currentEditingTask = null;
}


closeEditTaskModal.addEventListener(
    "click",
    closeEditModal
);


cancelEditTask.addEventListener(
    "click",
    closeEditModal
);


// ================================
// Close Edit Modal Outside
// ================================

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


// ================================
// Delete Task
// ================================

taskList.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "delete-task"
            )
        ) {

            const task =
                event.target.closest(".task");


            const confirmDelete =
                confirm(
                    "Delete this task?"
                );


            if (!confirmDelete) {

                return;

            }


            task.remove();

            saveTasks();

            updateTaskCount();

        }

    }
);


// ================================
// Load Saved Tasks
// ================================

loadTasks();