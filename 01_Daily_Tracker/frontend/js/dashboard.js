// =================================
// Daily Tracker - Dashboard
// User-Specific Backend Connected
// =================================

const API_URL = "http://localhost:5000/api";

// =================================
// Current User
// =================================

let currentUser = null;

const currentUserData = localStorage.getItem("currentUser");

if (!currentUserData) {

    window.location.href = "login.html";

} else {

    try {

        currentUser = JSON.parse(currentUserData);

    } catch (error) {

        console.error("Invalid current user data:", error);

        localStorage.removeItem("currentUser");

        window.location.href = "login.html";
    }
}

if (!currentUser || !currentUser.id) {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";
}


// =================================
// Dashboard Data
// =================================

let dashboardTasks = [];
let dashboardStudySessions = [];
let dashboardGoals = [];
let dashboardJournals = [];


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
// Today's Date
// =================================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =================================
// Escape Text
// =================================

function escapeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =================================
// Task Helpers
// =================================

function getTaskDate(task) {

    if (!task || !task.date) {

        return "";
    }

    return String(task.date).trim();
}


function isTaskCompleted(task) {

    return task &&
        (
            task.completed === true ||
            task.completed === "true"
        );
}


function formatTaskTime(timeString) {

    if (!timeString) {

        return "";
    }

    const parts =
        String(timeString).split(":");

    let hour =
        parseInt(parts[0], 10);

    if (Number.isNaN(hour)) {

        return timeString;
    }

    const minute =
        parts[1] || "00";

    const period =
        hour >= 12 ? "PM" : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
}


// =================================
// Load Dashboard Data
// =================================

async function loadDashboardData() {

    if (!currentUser || !currentUser.id) {

        return;
    }

    const userId =
        encodeURIComponent(currentUser.id);

    try {

        // -----------------------------
        // Tasks
        // -----------------------------

        const tasksResponse =
            await fetch(
                `${API_URL}/tasks?userId=${userId}`
            );

        if (tasksResponse.ok) {

            const tasksData =
                await tasksResponse.json();

            dashboardTasks =
                Array.isArray(tasksData.tasks)
                    ? tasksData.tasks
                    : [];

        } else {

            dashboardTasks = [];

            console.warn(
                "Unable to load dashboard tasks."
            );
        }


        // -----------------------------
        // Study
        // -----------------------------

        const studyResponse =
            await fetch(
                `${API_URL}/study?userId=${userId}`
            );

        if (studyResponse.ok) {

            const studyData =
                await studyResponse.json();

            dashboardStudySessions =
                Array.isArray(studyData.sessions)
                    ? studyData.sessions
                    : [];

        } else {

            dashboardStudySessions = [];

            console.warn(
                "Unable to load dashboard study sessions."
            );
        }


        // -----------------------------
        // Goals
        // -----------------------------

        try {

            const goalsResponse =
                await fetch(
                    `${API_URL}/goals?userId=${userId}`
                );

            if (goalsResponse.ok) {

                const goalsData =
                    await goalsResponse.json();

                dashboardGoals =
                    Array.isArray(goalsData.goals)
                        ? goalsData.goals
                        : [];

            } else {

                dashboardGoals = [];
            }

        } catch (error) {

            console.warn(
                "Goals could not be loaded:",
                error
            );

            dashboardGoals = [];
        }


        // -----------------------------
        // Journals
        // -----------------------------

        try {

            const journalsResponse =
                await fetch(
                    `${API_URL}/journals?userId=${userId}`
                );

            if (journalsResponse.ok) {

                const journalsData =
                    await journalsResponse.json();

                dashboardJournals =
                    Array.isArray(journalsData.journals)
                        ? journalsData.journals
                        : [];

            } else {

                dashboardJournals = [];
            }

        } catch (error) {

            console.warn(
                "Journals could not be loaded:",
                error
            );

            dashboardJournals = [];
        }


        // -----------------------------
        // Update Dashboard
        // -----------------------------

        displayDashboardTasks();

        updateTaskSummary();

        displayDashboardStudy();

        updateTotalStudyTime();

        displayDashboardGoals();

        updateGoalCount();

        updateStreak();

        loadReminders();

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );
    }
}


// =================================
// Display Today's Tasks
// =================================

function displayDashboardTasks() {

    const taskList =
        document.getElementById(
            "dashboardTaskList"
        );

    if (!taskList) {

        return;
    }

    taskList.innerHTML = "";

    const today =
        getToday();

    const todayTasks =
        dashboardTasks.filter(
            task =>
                getTaskDate(task) === today
        );


    if (todayTasks.length === 0) {

        taskList.innerHTML = `
            <div class="no-reminders">
                No tasks for today.
            </div>
        `;

        return;
    }


    todayTasks.forEach(task => {

        // -----------------------------
        // Main Task
        // -----------------------------

        const taskElement =
            document.createElement("div");

        taskElement.className = "task";


        if (isTaskCompleted(task)) {

            taskElement.classList.add(
                "completed"
            );
        }


        // -----------------------------
        // Checkbox
        // -----------------------------

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked =
            isTaskCompleted(task);

        checkbox.addEventListener(
            "change",
            function () {

                updateDashboardTask(
                    task,
                    checkbox.checked
                );
            }
        );


        // -----------------------------
        // Task Info
        // -----------------------------

        const taskInfo =
            document.createElement("div");

        taskInfo.className =
            "task-info";


        const taskName =
            document.createElement("span");

        taskName.textContent =
            task.name || "Untitled Task";


        const taskMeta =
            document.createElement("small");

        let metaText = "";


        if (task.priority) {

            metaText =
                `Priority: ${task.priority}`;
        }


        if (task.dueTime) {

            if (metaText) {

                metaText += " • ";
            }

            metaText +=
                formatTaskTime(task.dueTime);
        }


        if (metaText) {

            taskMeta.textContent =
                metaText;

            taskInfo.appendChild(
                taskName
            );

            taskInfo.appendChild(
                taskMeta
            );

        } else {

            taskInfo.appendChild(
                taskName
            );
        }


        // -----------------------------
        // Task Actions
        // -----------------------------

        const taskActions =
            document.createElement("div");

        taskActions.className =
            "task-actions";


        // Edit Button

        const editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.className =
            "edit-task";

        editButton.textContent =
            "Edit";

        editButton.addEventListener(
            "click",
            function () {

                openEditTaskModal(task);
            }
        );


        // Delete Button

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "delete-task";

        deleteButton.textContent =
            "Delete";

        deleteButton.addEventListener(
            "click",
            function () {

                deleteDashboardTask(task);
            }
        );


        taskActions.appendChild(
            editButton
        );

        taskActions.appendChild(
            deleteButton
        );


        // -----------------------------
        // Final Task Structure
        // -----------------------------

        taskElement.appendChild(
            checkbox
        );

        taskElement.appendChild(
            taskInfo
        );

        taskElement.appendChild(
            taskActions
        );

        taskList.appendChild(
            taskElement
        );

    });
}


// =================================
// Update Task
// =================================

async function updateDashboardTask(
    task,
    completed
) {

    if (!currentUser || !currentUser.id) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${task.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            currentUser.id,

                        name:
                            task.name,

                        priority:
                            task.priority || "Medium",

                        dueTime:
                            task.dueTime || "",

                        date:
                            task.date || getToday(),

                        completed:
                            completed

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update task."
            );
        }


        await loadDashboardData();


    } catch (error) {

        console.error(
            "Task update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update task."
        );
    }
}


// =================================
// Delete Task
// =================================

async function deleteDashboardTask(task) {

    if (!currentUser || !currentUser.id) {

        window.location.href =
            "login.html";

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${task.id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            currentUser.id

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete task."
            );
        }


        await loadDashboardData();


    } catch (error) {

        console.error(
            "Task delete error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete task."
        );
    }
}


// =================================
// Task Summary
// =================================

function updateTaskSummary() {

    const today =
        getToday();

    const todayTasks =
        dashboardTasks.filter(
            task =>
                getTaskDate(task) === today
        );


    const total =
        todayTasks.length;


    const completed =
        todayTasks.filter(
            task =>
                isTaskCompleted(task)
        ).length;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );
    }


    const taskCount =
        document.getElementById(
            "taskCount"
        );

    if (taskCount) {

        taskCount.textContent =
            `${completed}/${total}`;
    }


    const taskProgressText =
        document.getElementById(
            "taskProgressText"
        );

    if (taskProgressText) {

        taskProgressText.textContent =
            `${progress}%`;
    }


    const taskProgress =
        document.getElementById(
            "taskProgress"
        );

    if (taskProgress) {

        taskProgress.style.width =
            `${progress}%`;
    }
}


// =================================
// Add Task Modal
// =================================

const openTaskModal =
    document.getElementById(
        "openTaskModal"
    );

const taskModal =
    document.getElementById(
        "taskModal"
    );

const closeTaskModal =
    document.getElementById(
        "closeTaskModal"
    );

const cancelTask =
    document.getElementById(
        "cancelTask"
    );

const taskForm =
    document.getElementById(
        "taskForm"
    );


// Open Modal

if (
    openTaskModal &&
    taskModal
) {

    openTaskModal.addEventListener(
        "click",
        function () {

            taskModal.classList.add(
                "show"
            );

        }
    );
}


// Close Modal

function closeTaskModalFunction() {

    if (!taskModal) {

        return;
    }

    taskModal.classList.remove(
        "show"
    );
}


if (closeTaskModal) {

    closeTaskModal.addEventListener(
        "click",
        closeTaskModalFunction
    );
}


if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModalFunction
    );
}


if (taskModal) {

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
}


// =================================
// Add Task
// =================================

let isAddingTask = false;


if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (isAddingTask) {

                return;
            }


            isAddingTask = true;


            const taskNameElement =
                document.getElementById(
                    "taskName"
                );

            const taskPriorityElement =
                document.getElementById(
                    "taskPriority"
                );

            const taskDueTimeElement =
                document.getElementById(
                    "taskDueTime"
                );


            const taskName =
                taskNameElement
                    ? taskNameElement.value.trim()
                    : "";


            const taskPriority =
                taskPriorityElement
                    ? taskPriorityElement.value
                    : "Medium";


            const taskDueTime =
                taskDueTimeElement
                    ? taskDueTimeElement.value
                    : "";


            if (!taskName) {

                alert(
                    "Please enter task name."
                );

                isAddingTask = false;

                return;
            }


            if (
                !currentUser ||
                !currentUser.id
            ) {

                window.location.href =
                    "login.html";

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/tasks`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    currentUser.id,

                                name:
                                    taskName,

                                priority:
                                    taskPriority ||
                                    "Medium",

                                dueTime:
                                    taskDueTime ||
                                    "",

                                date:
                                    getToday()

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to add task."
                    );
                }


                taskForm.reset();


                closeTaskModalFunction();


                await loadDashboardData();


            } catch (error) {

                console.error(
                    "Error adding task:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to add task."
                );
            }


            isAddingTask = false;

        }
    );
}


// =================================
// Edit Task Modal
// =================================

const editTaskModal =
    document.getElementById(
        "editTaskModal"
    );

const closeEditTaskModal =
    document.getElementById(
        "closeEditTaskModal"
    );

const cancelEditTask =
    document.getElementById(
        "cancelEditTask"
    );

const editTaskForm =
    document.getElementById(
        "editTaskForm"
    );


let editingTaskId = null;


// Open Edit Modal

function openEditTaskModal(task) {

    if (!editTaskModal) {

        return;
    }


    editingTaskId =
        task.id;


    const nameElement =
        document.getElementById(
            "editTaskName"
        );

    const priorityElement =
        document.getElementById(
            "editTaskPriority"
        );

    const dueTimeElement =
        document.getElementById(
            "editTaskDueTime"
        );


    if (nameElement) {

        nameElement.value =
            task.name || "";
    }


    if (priorityElement) {

        priorityElement.value =
            task.priority || "Medium";
    }


    if (dueTimeElement) {

        dueTimeElement.value =
            task.dueTime || "";
    }


    editTaskModal.classList.add(
        "show"
    );
}


// Close Edit Modal

function closeEditTaskModalFunction() {

    if (!editTaskModal) {

        return;
    }

    editTaskModal.classList.remove(
        "show"
    );

    editingTaskId = null;
}


if (closeEditTaskModal) {

    closeEditTaskModal.addEventListener(
        "click",
        closeEditTaskModalFunction
    );
}


if (cancelEditTask) {

    cancelEditTask.addEventListener(
        "click",
        closeEditTaskModalFunction
    );
}


if (editTaskModal) {

    editTaskModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === editTaskModal
            ) {

                closeEditTaskModalFunction();
            }
        }
    );
}


// =================================
// Save Edited Task
// =================================

if (editTaskForm) {

    editTaskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                !editingTaskId ||
                !currentUser ||
                !currentUser.id
            ) {

                return;
            }


            const nameElement =
                document.getElementById(
                    "editTaskName"
                );

            const priorityElement =
                document.getElementById(
                    "editTaskPriority"
                );

            const dueTimeElement =
                document.getElementById(
                    "editTaskDueTime"
                );


            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";


            const priority =
                priorityElement
                    ? priorityElement.value
                    : "Medium";


            const dueTime =
                dueTimeElement
                    ? dueTimeElement.value
                    : "";


            if (!name) {

                alert(
                    "Please enter task name."
                );

                return;
            }


            const oldTask =
                dashboardTasks.find(
                    task =>
                        Number(task.id) ===
                        Number(editingTaskId)
                );


            try {

                const response =
                    await fetch(
                        `${API_URL}/tasks/${editingTaskId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    currentUser.id,

                                name:
                                    name,

                                priority:
                                    priority,

                                dueTime:
                                    dueTime,

                                date:
                                    oldTask &&
                                    oldTask.date
                                        ? oldTask.date
                                        : getToday(),

                                completed:
                                    oldTask
                                        ? isTaskCompleted(oldTask)
                                        : false

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update task."
                    );
                }


                editTaskForm.reset();

                closeEditTaskModalFunction();

                await loadDashboardData();


            } catch (error) {

                console.error(
                    "Task edit error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to edit task."
                );
            }

        }
    );
}


// =================================
// Study Today
// =================================

function displayDashboardStudy() {

    const studyList =
        document.getElementById(
            "studyList"
        );

    if (!studyList) {

        return;
    }


    const today =
        getToday();


    const todaySessions =
        dashboardStudySessions.filter(
            session =>
                String(
                    session.date || ""
                ).trim() === today
        );


    if (todaySessions.length === 0) {

        studyList.innerHTML = `
            <div>
                <span>No study sessions yet</span>
                <strong>0m</strong>
            </div>
        `;

        return;
    }


    studyList.innerHTML = "";


    todaySessions.forEach(
        session => {

            const row =
                document.createElement("div");

            row.className =
                "study-session";


            const subject =
                document.createElement("span");

            subject.textContent =
                session.subject ||
                "Study";


            const duration =
                document.createElement("strong");

            duration.textContent =
                formatDashboardStudyDuration(
                    session.duration
                );


            row.appendChild(
                subject
            );

            row.appendChild(
                duration
            );

            studyList.appendChild(
                row
            );
        }
    );
}


// =================================
// Study Duration
// =================================

function formatDashboardStudyDuration(
    minutes
) {

    const totalMinutes =
        Number(minutes) || 0;


    if (totalMinutes < 60) {

        return `${totalMinutes}m`;
    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const remainingMinutes =
        totalMinutes % 60;


    if (remainingMinutes === 0) {

        return `${hours}h`;
    }


    return `${hours}h ${remainingMinutes}m`;
}


// =================================
// Total Study Time
// =================================

function updateTotalStudyTime() {

    const totalStudyTime =
        document.getElementById(
            "totalStudyTime"
        );

    if (!totalStudyTime) {

        return;
    }


    const totalMinutes =
        dashboardStudySessions.reduce(
            (total, session) => {

                return total +
                    (
                        Number(
                            session.duration
                        ) || 0
                    );

            },
            0
        );


    totalStudyTime.textContent =
        formatDashboardStudyDuration(
            totalMinutes
        );
}


// =================================
// Open Study Page
// =================================

const openStudyPage =
    document.getElementById(
        "openStudyPage"
    );

if (openStudyPage) {

    openStudyPage.addEventListener(
        "click",
        function () {

            window.location.href =
                "study.html";
        }
    );
}


// =================================
// Goals
// =================================

function displayDashboardGoals() {

    const goalList =
        document.getElementById(
            "dashboardGoalList"
        );

    if (!goalList) {

        return;
    }


    if (dashboardGoals.length === 0) {

        goalList.innerHTML = `
            <div>
                <span>No goals yet.</span>
                <strong>0%</strong>
            </div>
        `;

        return;
    }


    goalList.innerHTML = "";


    dashboardGoals
        .slice(0, 3)
        .forEach(goal => {

            const row =
                document.createElement("div");


            const name =
                document.createElement("span");

            name.textContent =
                goal.name ||
                goal.title ||
                "Goal";


            const progress =
                document.createElement("strong");


            const value =
                Number(
                    goal.progress
                ) || 0;


            progress.textContent =
                `${value}%`;


            row.appendChild(
                name
            );

            row.appendChild(
                progress
            );

            goalList.appendChild(
                row
            );

        });
}


// =================================
// Goal Count
// =================================

function updateGoalCount() {

    const goalCount =
        document.getElementById(
            "goalCount"
        );

    if (!goalCount) {

        return;
    }


    goalCount.textContent =
        dashboardGoals.length;
}


// =================================
// Open Goal Page
// =================================

const openGoalPage =
    document.getElementById(
        "openGoalPage"
    );

if (openGoalPage) {

    openGoalPage.addEventListener(
        "click",
        function () {

            window.location.href =
                "goals.html";
        }
    );
}


// =================================
// Streak
// =================================

function updateStreak() {

    const streakElement =
        document.getElementById(
            "streakCount"
        );

    if (!streakElement) {

        return;
    }


    let streak = 0;


    const completedDates =
        dashboardTasks
            .filter(
                task =>
                    isTaskCompleted(task) &&
                    task.date
            )
            .map(
                task =>
                    String(task.date)
            );


    const uniqueDates =
        [
            ...new Set(
                completedDates
            )
        ];


    if (
        uniqueDates.includes(
            getToday()
        )
    ) {

        streak = 1;
    }


    streakElement.textContent =
        streak;
}


// =================================
// Study Modal
// =================================

// Study modal functionality is handled
// by study.js


// =================================
// Reminder System
// =================================

const reminderWrapper =
    document.getElementById(
        "reminderWrapper"
    );

const reminderBell =
    document.getElementById(
        "reminderBell"
    );

const reminderDropdown =
    document.getElementById(
        "reminderDropdown"
    );

const openReminderModal =
    document.getElementById(
        "openReminderModal"
    );

const reminderModal =
    document.getElementById(
        "reminderModal"
    );

const closeReminderModal =
    document.getElementById(
        "closeReminderModal"
    );

const cancelReminder =
    document.getElementById(
        "cancelReminder"
    );

const reminderForm =
    document.getElementById(
        "reminderForm"
    );


// =================================
// Reminder Bell
// =================================

if (
    reminderBell &&
    reminderDropdown
) {

    reminderBell.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            reminderDropdown.classList.toggle(
                "show"
            );
        }
    );
}


// Close reminder dropdown

document.addEventListener(
    "click",
    function (event) {

        if (
            reminderWrapper &&
            reminderDropdown &&
            !reminderWrapper.contains(
                event.target
            )
        ) {

            reminderDropdown.classList.remove(
                "show"
            );
        }
    }
);


// =================================
// Reminder Storage
// =================================

function getReminders() {

    try {

        const reminders =
            JSON.parse(
                localStorage.getItem(
                    "reminders"
                ) || "[]"
            );


        return Array.isArray(reminders)
            ? reminders
            : [];

    } catch (error) {

        return [];
    }
}


function saveReminders(reminders) {

    localStorage.setItem(
        "reminders",
        JSON.stringify(reminders)
    );
}


// =================================
// Display Reminders
// =================================

function loadReminders() {

    const reminderList =
        document.getElementById(
            "reminderList"
        );

    const reminderCount =
        document.getElementById(
            "reminderCount"
        );


    if (!reminderList) {

        return;
    }


    const reminders =
        getReminders();


    if (reminderCount) {

        reminderCount.textContent =
            reminders.length;
    }


    if (reminders.length === 0) {

        reminderList.innerHTML = `
            <div class="no-reminders">
                No reminders yet.
            </div>
        `;

        return;
    }


    reminderList.innerHTML = "";


    reminders.forEach(
        (reminder, index) => {

            const item =
                document.createElement("div");

            item.className =
                "reminder-item";


            const info =
                document.createElement("div");

            info.className =
                "reminder-item-info";


            const text =
                document.createElement("div");

            text.className =
                "reminder-item-text";

            text.textContent =
                reminder.text ||
                "Reminder";


            const time =
                document.createElement("div");

            time.className =
                "reminder-item-time";


            let reminderDate =
                reminder.date || "";


            if (
                reminder.date &&
                reminder.time
            ) {

                reminderDate =
                    `${reminder.date} • ${formatTaskTime(reminder.time)}`;

            } else if (
                reminder.time
            ) {

                reminderDate =
                    formatTaskTime(
                        reminder.time
                    );
            }


            time.textContent =
                reminderDate;


            info.appendChild(
                text
            );

            info.appendChild(
                time
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.className =
                "delete-reminder";

            deleteButton.textContent =
                "×";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteReminder(index);
                }
            );


            item.appendChild(
                info
            );

            item.appendChild(
                deleteButton
            );


            reminderList.appendChild(
                item
            );
        }
    );
}


// =================================
// Delete Reminder
// =================================

function deleteReminder(index) {

    const reminders =
        getReminders();


    reminders.splice(
        index,
        1
    );


    saveReminders(
        reminders
    );


    loadReminders();
}


// =================================
// Open Reminder Modal
// =================================

if (
    openReminderModal &&
    reminderModal
) {

    openReminderModal.addEventListener(
        "click",
        function () {

            reminderDropdown.classList.remove(
                "show"
            );

            reminderModal.classList.add(
                "show"
            );


            const dateElement =
                document.getElementById(
                    "reminderDate"
                );


            if (
                dateElement &&
                !dateElement.value
            ) {

                dateElement.value =
                    getToday();
            }
        }
    );
}


// =================================
// Close Reminder Modal
// =================================

function closeReminder() {

    if (!reminderModal) {

        return;
    }


    reminderModal.classList.remove(
        "show"
    );
}


if (closeReminderModal) {

    closeReminderModal.addEventListener(
        "click",
        closeReminder
    );
}


if (cancelReminder) {

    cancelReminder.addEventListener(
        "click",
        closeReminder
    );
}


if (reminderModal) {

    reminderModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === reminderModal
            ) {

                closeReminder();
            }
        }
    );
}


// =================================
// Add Reminder
// =================================

if (reminderForm) {

    reminderForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const reminderText =
                document.getElementById(
                    "reminderText"
                );

            const reminderDate =
                document.getElementById(
                    "reminderDate"
                );

            const reminderTime =
                document.getElementById(
                    "reminderTime"
                );


            if (
                !reminderText ||
                !reminderText.value.trim()
            ) {

                alert(
                    "Please enter a reminder."
                );

                return;
            }


            if (
                !reminderDate ||
                !reminderDate.value
            ) {

                alert(
                    "Please select a date."
                );

                return;
            }


            if (
                !reminderTime ||
                !reminderTime.value
            ) {

                alert(
                    "Please select a time."
                );

                return;
            }


            const reminders =
                getReminders();


            reminders.push({

                text:
                    reminderText.value.trim(),

                date:
                    reminderDate.value,

                time:
                    reminderTime.value

            });


            saveReminders(
                reminders
            );


            reminderForm.reset();


            closeReminder();


            loadReminders();


            alert(
                "Reminder saved successfully!"
            );

        }
    );
}


// =================================
// Notification Permission
// =================================

if (
    "Notification" in window &&
    Notification.permission === "default"
) {

    Notification.requestPermission()
        .catch(
            function (error) {

                console.warn(
                    "Notification permission error:",
                    error
                );
            }
        );
}


// =================================
// Initial Load
// =================================

loadDashboardData();


// =================================
// Refresh When Page Gets Focus
// =================================

window.addEventListener(
    "focus",
    function () {

        loadDashboardData();

    }
);


// =================================
// Auto Refresh
// =================================

setInterval(
    function () {

        loadDashboardData();

    },
    60000
);