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

    /* Tasks */

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


    /* Study */

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


    /* Journal */

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

const reminderBox =
    document.querySelector(
        ".reminder-mini"
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
   Open Reminder Modal
================================ */

if (
    reminderBox &&
    reminderModal
) {

    reminderBox.addEventListener(
        "click",
        function () {

            reminderModal.style.display =
                "flex";

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
        JSON.parse(
            localStorage.getItem(
                "reminders"
            )
        ) || [];

    reminderCount.textContent =
        reminders.length;

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
                    reminderText,
                icon:
                    "assets/icon.png"
            }
        );

    }

}


/* ================================
   Reminder Beep Sound
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


            const reminderTime =
                document.getElementById(
                    "reminderTime"
                ).value;


            if (
                reminderText === "" ||
                reminderTime === ""
            ) {

                alert(
                    "Please fill all fields!"
                );

                return;

            }


            let reminders =
                JSON.parse(
                    localStorage.getItem(
                        "reminders"
                    )
                ) || [];


            reminders.push({

                id:
                    Date.now(),

                text:
                    reminderText,

                time:
                    reminderTime,

                notified:
                    false

            });


            localStorage.setItem(
                "reminders",
                JSON.stringify(
                    reminders
                )
            );


            updateReminderCount();


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
        JSON.parse(
            localStorage.getItem(
                "reminders"
            )
        ) || [];


    const now =
        new Date();


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


    let changed = false;


    reminders.forEach(
        reminder => {

            if (
                reminder.time === currentTime &&
                reminder.notified === false
            ) {

                /* Sound */

                playReminderSound();


                /* Browser Notification */

                showBrowserNotification(
                    reminder.text
                );


                /* Alert */

                alert(
                    "🔔 Reminder: " +
                    reminder.text
                );


                reminder.notified =
                    true;


                changed = true;

            }

        }
    );


    if (changed) {

        localStorage.setItem(
            "reminders",
            JSON.stringify(
                reminders
            )
        );

    }

}


/* ================================
   Refresh Dashboard Data
================================ */

function refreshDashboard() {

    updateStreak();

    updateReminderCount();

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
   Refresh When Page Becomes Active
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