/* ================================
   Daily Tracker - Dashboard
================================ */


/* ================================
   Backend API
================================ */

const API_URL = "http://localhost:5000/api";

let dashboardTasks = [];


/* ================================
   Date & Time
================================ */

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

    const currentDate =
        now.toLocaleDateString(
            "en-IN",
            dateOptions
        );

    const currentTime =
        now.toLocaleTimeString(
            "en-IN",
            timeOptions
        );

    const currentDateElement =
        document.getElementById("currentDate");

    const currentTimeElement =
        document.getElementById("currentTime");

    if (currentDateElement) {

        currentDateElement.textContent =
            currentDate;

    }

    if (currentTimeElement) {

        currentTimeElement.textContent =
            currentTime;

    }

}

updateDateTime();

setInterval(
    updateDateTime,
    1000
);


/* ================================
   Get Today
================================ */

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* ================================
   Get Task Date
================================ */

function getTaskDate(task) {

    return task.date || "";

}


/* ================================
   Check Completed
================================ */

function isTaskCompleted(task) {

    return (
        task.completed === true ||
        task.completed === "true"
    );

}


/* ================================
   Escape Text
================================ */

function escapeText(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* ================================
   Format Task Time
================================ */

function formatTaskTime(time) {

    if (!time) {

        return "";

    }

    const parts =
        time.split(":");

    if (parts.length < 2) {

        return time;

    }

    let hour =
        parseInt(
            parts[0],
            10
        );

    const minute =
        parts[1];

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minute} ${period}`;

}


/* ================================
   Load Tasks
================================ */

async function loadDashboardTasks() {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load tasks"
            );

        }

        const data =
            await response.json();

        if (
            data.success &&
            Array.isArray(data.tasks)
        ) {

            dashboardTasks =
                data.tasks;

        } else {

            dashboardTasks = [];

        }

        displayDashboardTasks();

        updateTaskSummary();

        updateStreak();

    } catch (error) {

        console.error(
            "Dashboard task error:",
            error
        );

        dashboardTasks = [];

        displayDashboardTasks();

        updateTaskSummary();

        updateStreak();

    }

}


/* ================================
   Display Today's Tasks
================================ */

function displayDashboardTasks() {

    const taskList =
        document.getElementById(
            "dashboardTaskList"
        );

    if (!taskList) {

        return;

    }

    const today =
        getToday();

    const todayTasks =
        dashboardTasks.filter(
            task =>
                getTaskDate(task) === today
        );

    taskList.innerHTML = "";


    /* ================================
       No Tasks
    ================================ */

    if (todayTasks.length === 0) {

        taskList.innerHTML = `
            <div class="no-tasks">
                No tasks for today.
            </div>
        `;

        return;

    }


    /* ================================
       Create Tasks
    ================================ */

    todayTasks.forEach(
        function (task) {

            const taskElement =
                document.createElement("div");

            if (
                isTaskCompleted(task)
            ) {

                taskElement.className =
                    "task completed";

            } else {

                taskElement.className =
                    "task";

            }


            const dueTime =
                task.dueTime
                    ? ` • Due: ${escapeText(
                        formatTaskTime(
                            task.dueTime
                        )
                    )}`
                    : "";


            taskElement.innerHTML = `
                <input
                    type="checkbox"
                    class="dashboard-task-checkbox"
                    data-id="${task.id}"
                    ${isTaskCompleted(task) ? "checked" : ""}
                >

                <div class="task-info">

                    <span>
                        ${escapeText(
                            task.name
                        )}
                    </span>

                    <small>
                        Priority:
                        ${escapeText(
                            task.priority || "Medium"
                        )}
                        ${dueTime}
                    </small>

                </div>
            `;


            taskList.appendChild(
                taskElement
            );

        }
    );


    /* ================================
       Checkbox Events
    ================================ */

    const checkboxes =
        taskList.querySelectorAll(
            ".dashboard-task-checkbox"
        );

    checkboxes.forEach(
        function (checkbox) {

            checkbox.addEventListener(
                "change",
                async function () {

                    const id =
                        Number(
                            this.dataset.id
                        );

                    const completed =
                        this.checked;

                    await updateDashboardTask(
                        id,
                        completed
                    );

                }
            );

        }
    );

}


/* ================================
   Update Task
================================ */

async function updateDashboardTask(
    id,
    completed
) {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            completed:
                                completed
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to update task"
            );

        }

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                "Task update failed"
            );

        }

        await loadDashboardTasks();

    } catch (error) {

        console.error(
            "Task update error:",
            error
        );

        alert(
            "Could not update task."
        );

        await loadDashboardTasks();

    }

}


/* ================================
   Update Task Summary
================================ */

function updateTaskSummary() {

    const taskCount =
        document.getElementById(
            "taskCount"
        );

    const progressText =
        document.getElementById(
            "taskProgressText"
        );

    const progressBar =
        document.getElementById(
            "taskProgress"
        );


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


    let percentage =
        0;


    if (total > 0) {

        percentage =
            Math.round(
                (
                    completed /
                    total
                ) * 100
            );

    }


    if (taskCount) {

        taskCount.textContent =
            `${completed}/${total}`;

    }


    if (progressText) {

        progressText.textContent =
            `${percentage}%`;

    }


    if (progressBar) {

        progressBar.style.width =
            `${percentage}%`;

    }

}


/* ================================
   Check Daily Activity
================================ */

function hasActivity(date) {

    const completedTask =
        dashboardTasks.some(
            task =>
                getTaskDate(task) === date &&
                isTaskCompleted(task)
        );


    if (completedTask) {

        return true;

    }


    const studySessions =
        JSON.parse(
            localStorage.getItem(
                "studySessions"
            )
        ) || [];


    const studyActivity =
        studySessions.some(
            session =>
                session.date === date
        );


    if (studyActivity) {

        return true;

    }


    const journals =
        JSON.parse(
            localStorage.getItem(
                "journals"
            )
        ) || [];


    const journalActivity =
        journals.some(
            journal =>
                journal.date === date
        );


    if (journalActivity) {

        return true;

    }


    return false;

}


/* ================================
   Previous Date
================================ */

function getPreviousDate(dateString) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    date.setDate(
        date.getDate() - 1
    );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* ================================
   Calculate Streak
================================ */

function calculateStreak() {

    let streak = 0;

    let currentDate =
        getToday();


    while (
        hasActivity(currentDate)
    ) {

        streak++;

        currentDate =
            getPreviousDate(
                currentDate
            );

    }


    return streak;

}


/* ================================
   Update Streak
================================ */

function updateStreak() {

    const streakCount =
        document.getElementById(
            "streakCount"
        );

    if (!streakCount) {

        return;

    }

    streakCount.textContent =
        calculateStreak();

}


/* ================================
   Reminder Elements
================================ */

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


/* ================================
   Reminder Dropdown
================================ */

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


/* ================================
   Open Reminder Modal
================================ */

if (
    openReminderModal &&
    reminderModal
) {

    openReminderModal.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (reminderDropdown) {

                reminderDropdown.classList.remove(
                    "show"
                );

            }

            reminderModal.style.display =
                "flex";


            const reminderDate =
                document.getElementById(
                    "reminderDate"
                );


            if (reminderDate) {

                reminderDate.value =
                    getToday();

            }

        }
    );

}


/* ================================
   Close Reminder Modal
================================ */

if (
    closeReminderModal &&
    reminderModal
) {

    closeReminderModal.addEventListener(
        "click",
        function () {

            reminderModal.style.display =
                "none";

        }
    );

}


if (
    cancelReminder &&
    reminderModal
) {

    cancelReminder.addEventListener(
        "click",
        function () {

            reminderModal.style.display =
                "none";

        }
    );

}


if (reminderModal) {

    reminderModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                reminderModal
            ) {

                reminderModal.style.display =
                    "none";

            }

        }
    );

}


/* ================================
   Get Reminders
================================ */

function getReminders() {

    return (
        JSON.parse(
            localStorage.getItem(
                "reminders"
            )
        ) || []
    );

}


/* ================================
   Save Reminders
================================ */

function saveReminders(reminders) {

    localStorage.setItem(
        "reminders",
        JSON.stringify(
            reminders
        )
    );

}


/* ================================
   Reminder Count
================================ */

function updateReminderCount() {

    const reminderCount =
        document.getElementById(
            "reminderCount"
        );

    if (!reminderCount) {

        return;

    }

    reminderCount.textContent =
        getReminders().length;

}


/* ================================
   Reminder Time
================================ */

function formatReminderTime(time) {

    if (!time) {

        return "";

    }

    const parts =
        time.split(":");

    let hour =
        parseInt(
            parts[0],
            10
        );

    const minute =
        parts[1];

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minute} ${period}`;

}


/* ================================
   Reminder Date
================================ */

function formatReminderDate(dateString) {

    if (!dateString) {

        return "";

    }

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );

}


/* ================================
   Display Reminders
================================ */

function displayReminderList() {

    const reminderList =
        document.getElementById(
            "reminderList"
        );

    if (!reminderList) {

        return;

    }

    const reminders =
        getReminders();


    reminderList.innerHTML =
        "";


    if (reminders.length === 0) {

        reminderList.innerHTML = `
            <div class="no-reminders">
                No reminders yet.
            </div>
        `;

        return;

    }


    reminders.sort(
        function (a, b) {

            const dateA =
                `${a.date || ""} ${a.time || ""}`;

            const dateB =
                `${b.date || ""} ${b.time || ""}`;

            return dateA.localeCompare(
                dateB
            );

        }
    );


    reminders.forEach(
        function (reminder) {

            const reminderItem =
                document.createElement(
                    "div"
                );

            reminderItem.className =
                "reminder-item";


            const reminderDate =
                reminder.date
                    ? formatReminderDate(
                        reminder.date
                    )
                    : "";


            reminderItem.innerHTML = `
                <div class="reminder-item-info">

                    <div class="reminder-item-text">
                        🔔
                        ${escapeText(
                            reminder.text
                        )}
                    </div>

                    <div class="reminder-item-time">

                        ⏰
                        ${formatReminderTime(
                            reminder.time
                        )}

                        ${
                            reminderDate
                                ? " • " +
                                  reminderDate
                                : ""
                        }

                    </div>

                </div>

                <button
                    type="button"
                    class="delete-reminder"
                    data-id="${reminder.id}"
                    title="Delete Reminder"
                >
                    🗑️
                </button>
            `;


            reminderList.appendChild(
                reminderItem
            );

        }
    );


    const deleteButtons =
        reminderList.querySelectorAll(
            ".delete-reminder"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    deleteReminder(
                        Number(
                            this.dataset.id
                        )
                    );

                }
            );

        }
    );

}


/* ================================
   Delete Reminder
================================ */

function deleteReminder(id) {

    const reminders =
        getReminders();


    const updatedReminders =
        reminders.filter(
            reminder =>
                reminder.id !== id
        );


    saveReminders(
        updatedReminders
    );


    updateReminderCount();

    displayReminderList();

}


/* ================================
   Notification Permission
================================ */

function requestNotificationPermission() {

    if (
        "Notification" in window &&
        Notification.permission ===
            "default"
    ) {

        Notification.requestPermission();

    }

}


/* ================================
   Browser Notification
================================ */

function showBrowserNotification(
    text
) {

    if (
        "Notification" in window &&
        Notification.permission ===
            "granted"
    ) {

        new Notification(
            "🔔 Daily Tracker",
            {
                body: text
            }
        );

    }

}


/* ================================
   Reminder Sound
================================ */

function playReminderSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            return;

        }


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gainNode =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            800;


        gainNode.gain.setValueAtTime(
            0.3,
            audioContext.currentTime
        );


        oscillator.connect(
            gainNode
        );


        gainNode.connect(
            audioContext.destination
        );


        oscillator.start();


        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime +
            0.8
        );


        oscillator.stop(
            audioContext.currentTime +
            0.8
        );

    } catch (error) {

        console.log(
            "Reminder sound could not play."
        );

    }

}


/* ================================
   Add Reminder
================================ */

if (reminderForm) {

    reminderForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const reminderText =
                document.getElementById(
                    "reminderText"
                ).value.trim();


            const reminderDate =
                document.getElementById(
                    "reminderDate"
                ).value;


            const reminderTime =
                document.getElementById(
                    "reminderTime"
                ).value;


            if (
                reminderText === "" ||
                reminderDate === "" ||
                reminderTime === ""
            ) {

                alert(
                    "Please fill all fields!"
                );

                return;

            }


            const reminders =
                getReminders();


            reminders.push({

                id:
                    Date.now(),

                text:
                    reminderText,

                date:
                    reminderDate,

                time:
                    reminderTime,

                notified:
                    false

            });


            saveReminders(
                reminders
            );


            updateReminderCount();

            displayReminderList();

            requestNotificationPermission();


            alert(
                "Reminder added successfully!"
            );


            reminderForm.reset();


            reminderModal.style.display =
                "none";

        }
    );

}


/* ================================
   Check Reminders
================================ */

function checkReminders() {

    const reminders =
        getReminders();


    const now =
        new Date();


    const currentDate =
        getToday();


    const currentTime =
        `${String(
            now.getHours()
        ).padStart(2, "0")}:${String(
            now.getMinutes()
        ).padStart(2, "0")}`;


    let changed =
        false;


    reminders.forEach(
        function (reminder) {

            const reminderDate =
                reminder.date ||
                currentDate;


            if (
                reminderDate ===
                    currentDate &&
                reminder.time ===
                    currentTime &&
                reminder.notified !== true
            ) {

                playReminderSound();

                showBrowserNotification(
                    reminder.text
                );

                alert(
                    "🔔 Reminder: " +
                    reminder.text
                );


                reminder.notified =
                    true;


                changed =
                    true;

            }

        }
    );


    if (changed) {

        saveReminders(
            reminders
        );

        displayReminderList();

    }

}


/* ================================
   Open Task Modal
================================ */

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


if (
    openTaskModal &&
    taskModal
) {

    openTaskModal.addEventListener(
        "click",
        function () {

            taskModal.style.display =
                "flex";

        }
    );

}


if (
    closeTaskModal &&
    taskModal
) {

    closeTaskModal.addEventListener(
        "click",
        function () {

            taskModal.style.display =
                "none";

        }
    );

}


if (
    cancelTask &&
    taskModal
) {

    cancelTask.addEventListener(
        "click",
        function () {

            taskModal.style.display =
                "none";

        }
    );

}


if (taskModal) {

    taskModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                taskModal
            ) {

                taskModal.style.display =
                    "none";

            }

        }
    );

}


/* ================================
   Add Task From Dashboard
================================ */

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const taskName =
                document.getElementById(
                    "taskName"
                ).value.trim();


            const taskPriority =
                document.getElementById(
                    "taskPriority"
                ).value;


            const taskDueTime =
                document.getElementById(
                    "taskDueTime"
                ).value;


            if (!taskName) {

                alert(
                    "Please enter task name."
                );

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

                            body:
                                JSON.stringify({

                                    name:
                                        taskName,

                                    priority:
                                        taskPriority,

                                    dueTime:
                                        taskDueTime,

                                    date:
                                        getToday()

                                })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to add task"
                    );

                }


                const data =
                    await response.json();


                if (!data.success) {

                    throw new Error(
                        "Task was not added"
                    );

                }


                taskForm.reset();


                taskModal.style.display =
                    "none";


                await loadDashboardTasks();


                alert(
                    "Task added successfully!"
                );


            } catch (error) {

                console.error(
                    "Add task error:",
                    error
                );


                alert(
                    "Could not add task. Make sure backend is running."
                );

            }

        }
    );

}


/* ================================
   Initial Dashboard Load
================================ */

async function refreshDashboard() {

    updateReminderCount();

    displayReminderList();

    await loadDashboardTasks();

}


refreshDashboard();


/* ================================
   Notification Permission
================================ */

window.addEventListener(
    "click",
    function () {

        requestNotificationPermission();

    },
    {
        once: true
    }
);


/* ================================
   Reminder Check
================================ */

setInterval(
    checkReminders,
    1000
);


/* ================================
   Refresh On Focus
================================ */

window.addEventListener(
    "focus",
    function () {

        refreshDashboard();

    }
);


/* ================================
   Refresh Every Minute
================================ */

setInterval(
    refreshDashboard,
    60000
);