/* ================================
   Dashboard
================================ */


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
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


/* ================================
   Get Activity Date
================================ */

function getActivityDate(item) {

    return (
        item.date ||
        item.dueDate ||
        item.deadline ||
        ""
    );

}


/* ================================
   Check Task Completed
================================ */

function isTaskCompleted(task) {

    return (
        task.completed === true ||
        task.completed === "true"
    );

}


/* ================================
   Check Daily Activity
================================ */

function hasActivity(date) {

    const tasks =
        JSON.parse(
            localStorage.getItem("tasks")
        ) || [];

    const hasCompletedTask =
        tasks.some(
            task =>
                getActivityDate(task) === date &&
                isTaskCompleted(task)
        );

    if (hasCompletedTask) {
        return true;
    }


    const studySessions =
        JSON.parse(
            localStorage.getItem("studySessions")
        ) || [];

    const hasStudy =
        studySessions.some(
            session =>
                session.date === date
        );

    if (hasStudy) {
        return true;
    }


    const journals =
        JSON.parse(
            localStorage.getItem("journals")
        ) || [];

    const hasJournal =
        journals.some(
            journal =>
                journal.date === date
        );

    if (hasJournal) {
        return true;
    }


    return false;

}


/* ================================
   Get Previous Date
================================ */

function getPreviousDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    date.setDate(
        date.getDate() - 1
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

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

    const streak =
        calculateStreak();

    streakCount.textContent =
        streak;

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
   Toggle Reminder Dropdown
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


/* ================================
   Close Dropdown
================================ */

document.addEventListener(
    "click",
    function (event) {

        if (
            reminderWrapper &&
            reminderDropdown &&
            !reminderWrapper.contains(event.target)
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

            reminderDropdown.classList.remove(
                "show"
            );

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


/* ================================
   Cancel Reminder
================================ */

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


/* ================================
   Close Modal Outside
================================ */

if (reminderModal) {

    reminderModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === reminderModal
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
   Update Reminder Count
================================ */

function updateReminderCount() {

    const reminderCount =
        document.getElementById(
            "reminderCount"
        );

    if (!reminderCount) {
        return;
    }

    const reminders =
        getReminders();

    reminderCount.textContent =
        reminders.length;

}


/* ================================
   Format Reminder Time
================================ */

function formatReminderTime(time) {

    if (!time) {
        return "";
    }

    const parts =
        time.split(":");

    let hour =
        parseInt(
            parts[0]
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
   Format Reminder Date
================================ */

function formatReminderDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
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
   Reminder List
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

        reminderList.innerHTML =
            `
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
        reminder => {

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

            reminderItem.innerHTML =
                `
                <div class="reminder-item-info">

                    <div class="reminder-item-text">
                        🔔 ${escapeReminderText(
                            reminder.text
                        )}
                    </div>

                    <div class="reminder-item-time">

                        ⏰ ${formatReminderTime(
                            reminder.time
                        )}

                        ${
                            reminderDate
                                ? " • " + reminderDate
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
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const id =
                        Number(
                            this.dataset.id
                        );

                    deleteReminder(
                        id
                    );

                }
            );

        }
    );

}


/* ================================
   Escape Reminder Text
================================ */

function escapeReminderText(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

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
   Request Notification Permission
================================ */

function requestNotificationPermission() {

    if (
        "Notification" in window &&
        Notification.permission === "default"
    ) {

        Notification.requestPermission();

    }

}


/* ================================
   Browser Notification
================================ */

function showBrowserNotification(
    reminderText
) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "🔔 Daily Tracker",
            {
                body:
                    reminderText
            }
        );

    }

}


/* ================================
   Reminder Beep
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
            audioContext.currentTime + 0.8
        );

        oscillator.stop(
            audioContext.currentTime + 0.8
        );

    } catch (error) {

        console.log(
            "Reminder sound could not play."
        );

    }

}


/* ================================
   Save Reminder
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

            let reminders =
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

    let reminders =
        getReminders();

    const now =
        new Date();

    const currentDate =
        getToday();

    const currentHours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

    const currentMinutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );

    const currentTime =
        `${currentHours}:${currentMinutes}`;

    let changed =
        false;

    reminders.forEach(
        reminder => {

            const reminderDate =
                reminder.date ||
                currentDate;

            if (
                reminderDate === currentDate &&
                reminder.time === currentTime &&
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
   Refresh Dashboard
================================ */

function refreshDashboard() {

    updateStreak();

    updateReminderCount();

    displayReminderList();

}


/* ================================
   Initial Load
================================ */

refreshDashboard();


/* ================================
   Request Notification
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
   Check Reminder Every Second
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