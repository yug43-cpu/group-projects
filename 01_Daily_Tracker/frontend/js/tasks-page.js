// =================================
// Daily Tracker - Tasks
// =================================


// =================================
// Prevent Double Script Loading
// =================================

if (window.dailyTrackerTasksLoaded) {
    console.warn("tasks-page.js is already loaded.");
} else {

window.dailyTrackerTasksLoaded = true;


// =================================
// Date & Time
// =================================

function updateDateTime() {

    const now = new Date();

    const dateElement =
        document.getElementById("currentDate");

    const timeElement =
        document.getElementById("currentTime");

    if (dateElement) {

        dateElement.textContent =
            now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

    }

    if (timeElement) {

        timeElement.textContent =
            now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

    }

}

updateDateTime();

setInterval(updateDateTime, 1000);


// =================================
// Get Today's Date
// =================================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =================================
// DOM Elements
// =================================

const taskModal =
    document.getElementById("taskModal");

const editTaskModal =
    document.getElementById("editTaskModal");

const openTaskModal =
    document.getElementById("openTaskModal");

const closeTaskModal =
    document.getElementById("closeTaskModal");

const closeEditTaskModal =
    document.getElementById("closeEditTaskModal");

const cancelTask =
    document.getElementById("cancelTask");

const cancelEditTask =
    document.getElementById("cancelEditTask");

const taskForm =
    document.getElementById("taskForm");

const editTaskForm =
    document.getElementById("editTaskForm");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

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

const filterButtons =
    document.querySelectorAll(".filter-btn");


// =================================
// Task Data
// =================================

function getTasks() {

    try {

        const savedTasks =
            localStorage.getItem("tasks");

        if (!savedTasks) {
            return [];
        }

        const tasks =
            JSON.parse(savedTasks);

        return Array.isArray(tasks)
            ? tasks
            : [];

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        return [];

    }

}


function saveTasks(tasks) {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// =================================
// Display Tasks
// =================================

let currentFilter = "all";

function displayTasks() {

    const tasks =
        getTasks();

    taskList.innerHTML = "";


    let filteredTasks =
        tasks;


    // Filter
    if (currentFilter === "pending") {

        filteredTasks =
            tasks.filter(
                task =>
                    task.completed !== true
            );

    }


    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(
                task =>
                    task.completed === true
            );

    }


    // Empty State
    if (filteredTasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    // Create Tasks
    filteredTasks.forEach(task => {

        const taskItem =
            document.createElement("div");

        taskItem.className =
            "task-item";


        if (task.completed === true) {

            taskItem.classList.add(
                "completed"
            );

        }


        // =================================
        // Task Left
        // =================================

        const taskLeft =
            document.createElement("div");

        taskLeft.className =
            "task-left";


        // Checkbox
        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.checked =
            task.completed === true;


        checkbox.addEventListener(
            "change",
            function () {

                toggleTask(task.id);

            }
        );


        // =================================
        // Task Information
        // =================================

        const taskInfo =
            document.createElement("div");

        taskInfo.className =
            "task-info";


        // Task Name
        const taskName =
            document.createElement("h3");

        taskName.textContent =
            task.name || "Untitled Task";


        // Priority
        const priority =
            document.createElement("span");

        priority.className =
            "priority " +
            String(
                task.priority || "Medium"
            ).toLowerCase();

        priority.textContent =
            task.priority || "Medium";


        // Date
        if (task.date) {

            const taskDate =
                document.createElement("small");

            taskDate.className =
                "task-date";

            taskDate.textContent =
                "📅 " +
                formatDate(task.date);

            taskInfo.appendChild(
                taskDate
            );

        }


        // Due Time
        if (task.dueTime) {

            const dueTime =
                document.createElement("small");

            dueTime.className =
                "due-time";

            dueTime.textContent =
                "⏰ " +
                formatTime(task.dueTime);

            taskInfo.appendChild(
                dueTime
            );

        }


        taskInfo.insertBefore(
            priority,
            taskInfo.firstChild
        );

        taskInfo.insertBefore(
            taskName,
            taskInfo.firstChild
        );


        taskLeft.appendChild(
            checkbox
        );

        taskLeft.appendChild(
            taskInfo
        );


        // =================================
        // Task Actions
        // =================================

        const taskActions =
            document.createElement("div");

        taskActions.className =
            "task-actions";


        // Edit Button
        const editButton =
            document.createElement("button");

        editButton.type =
            "button";

        editButton.className =
            "edit-btn";

        editButton.textContent =
            "✏️";

        editButton.title =
            "Edit Task";


        editButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                openEditModal(task);

            }
        );


        // Delete Button
        const deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.className =
            "delete-btn";

        deleteButton.textContent =
            "🗑️";

        deleteButton.title =
            "Delete Task";


        deleteButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                deleteTask(task.id);

            }
        );


        taskActions.appendChild(
            editButton
        );

        taskActions.appendChild(
            deleteButton
        );


        taskItem.appendChild(
            taskLeft
        );

        taskItem.appendChild(
            taskActions
        );


        taskList.appendChild(
            taskItem
        );

    });


    updateStats();

}


// =================================
// Format Date
// =================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// =================================
// Format Time
// =================================

function formatTime(timeString) {

    if (!timeString) {
        return "";
    }

    const parts =
        timeString.split(":");

    let hour =
        parseInt(parts[0], 10);

    const minute =
        parts[1] || "00";

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minute} ${period}`;

}


// =================================
// Update Statistics
// =================================

function updateStats() {

    const tasks =
        getTasks();

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task =>
                task.completed === true
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


// =================================
// Add Task
// =================================

let isAddingTask = false;

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        if (isAddingTask) {
            return;
        }

        isAddingTask = true;


        const name =
            document
                .getElementById("taskName")
                .value
                .trim();

        const priority =
            document
                .getElementById("taskPriority")
                .value;

        const dueTime =
            document
                .getElementById("taskDueTime")
                .value;

        const date =
            document
                .getElementById("taskDate")
                .value;


        if (!name) {

            alert(
                "Please enter task name."
            );

            isAddingTask = false;

            return;

        }


        if (!date) {

            alert(
                "Please select a task date."
            );

            isAddingTask = false;

            return;

        }


        const tasks =
            getTasks();


        // Unique ID
        const newId =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 9);


        const newTask = {

            id: newId,

            name: name,

            priority:
                priority || "Medium",

            dueTime:
                dueTime || "",

            date: date,

            completed: false

        };


        // Add ONLY new task
        tasks.push(newTask);

        saveTasks(tasks);


        // Reset form
        taskForm.reset();


        // Default date for next task
        document
            .getElementById("taskDate")
            .value =
            getToday();


        closeModal();

        displayTasks();


        setTimeout(
            function () {

                isAddingTask = false;

            },
            300
        );

    }
);


// =================================
// Open Add Task Modal
// =================================

openTaskModal.addEventListener(
    "click",
    function () {

        document
            .getElementById("taskDate")
            .value =
            getToday();

        taskModal.classList.add(
            "active"
        );

    }
);


// =================================
// Close Add Task Modal
// =================================

function closeModal() {

    taskModal.classList.remove(
        "active"
    );

}


closeTaskModal.addEventListener(
    "click",
    closeModal
);


cancelTask.addEventListener(
    "click",
    closeModal
);


// =================================
// Edit Task
// =================================

let editingTaskId = null;


function openEditModal(task) {

    editingTaskId =
        task.id;


    document
        .getElementById("editTaskName")
        .value =
        task.name || "";


    document
        .getElementById("editTaskPriority")
        .value =
        task.priority || "Medium";


    document
        .getElementById("editTaskDueTime")
        .value =
        task.dueTime || "";


    // Keep existing task date
    document
        .getElementById("editTaskDate")
        .value =
        task.date || getToday();


    editTaskModal.classList.add(
        "active"
    );

}


// =================================
// Save Edited Task
// =================================

editTaskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (editingTaskId === null) {
            return;
        }


        const name =
            document
                .getElementById("editTaskName")
                .value
                .trim();

        const priority =
            document
                .getElementById("editTaskPriority")
                .value;

        const dueTime =
            document
                .getElementById("editTaskDueTime")
                .value;

        const date =
            document
                .getElementById("editTaskDate")
                .value;


        if (!name) {

            alert(
                "Please enter task name."
            );

            return;

        }


        if (!date) {

            alert(
                "Please select a task date."
            );

            return;

        }


        const tasks =
            getTasks();


        const taskIndex =
            tasks.findIndex(
                task =>
                    String(task.id) ===
                    String(editingTaskId)
            );


        if (taskIndex === -1) {

            alert(
                "Task not found."
            );

            closeEditModal();

            return;

        }


        // Update ONLY selected task

        tasks[taskIndex].name =
            name;

        tasks[taskIndex].priority =
            priority || "Medium";

        tasks[taskIndex].dueTime =
            dueTime || "";

        tasks[taskIndex].date =
            date;


        // Keep:
        // id
        // completed


        saveTasks(tasks);

        closeEditModal();

        displayTasks();

    }
);


// =================================
// Close Edit Modal
// =================================

function closeEditModal() {

    editTaskModal.classList.remove(
        "active"
    );

    editingTaskId =
        null;

}


closeEditTaskModal.addEventListener(
    "click",
    closeEditModal
);


cancelEditTask.addEventListener(
    "click",
    closeEditModal
);


// =================================
// Delete Task
// =================================

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    const tasks =
        getTasks();


    const updatedTasks =
        tasks.filter(
            task =>
                String(task.id) !==
                String(id)
        );


    if (
        updatedTasks.length ===
        tasks.length
    ) {

        return;

    }


    saveTasks(updatedTasks);

    displayTasks();

}


// =================================
// Complete / Uncomplete Task
// =================================

function toggleTask(id) {

    const tasks =
        getTasks();


    const taskIndex =
        tasks.findIndex(
            task =>
                String(task.id) ===
                String(id)
        );


    if (taskIndex === -1) {
        return;
    }


    tasks[taskIndex].completed =
        tasks[taskIndex].completed !== true;


    saveTasks(tasks);

    displayTasks();

}


// =================================
// Filters
// =================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                currentFilter =
                    this.dataset.filter;


                displayTasks();

            }
        );

    }
);


// =================================
// Close Modal on Outside Click
// =================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target === taskModal
        ) {

            closeModal();

        }


        if (
            event.target === editTaskModal
        ) {

            closeEditModal();

        }

    }
);


// =================================
// Initial Load
// =================================

displayTasks();

}