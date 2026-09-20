/* ================================
   Statistics Page
================================ */


/* ================================
   Elements
================================ */

const currentDateElement =
    document.getElementById("currentDate");

const currentTimeElement =
    document.getElementById("currentTime");


const totalTasksElement =
    document.getElementById("totalTasks");

const completedTasksElement =
    document.getElementById("completedTasks");

const totalStudyElement =
    document.getElementById("totalStudy");

const totalJournalsElement =
    document.getElementById("totalJournals");


const taskPercentageElement =
    document.getElementById("taskPercentage");

const taskProgressBar =
    document.getElementById("taskProgressBar");


const weeklyStudyElement =
    document.getElementById("weeklyStudy");

const weeklyTasksElement =
    document.getElementById("weeklyTasks");

const weeklyJournalsElement =
    document.getElementById("weeklyJournals");

const activeGoalsElement =
    document.getElementById("activeGoals");


const monthlyStudySessionsElement =
    document.getElementById("monthlyStudySessions");

const monthlyStudyMinutesElement =
    document.getElementById("monthlyStudyMinutes");

const monthlyCompletedTasksElement =
    document.getElementById("monthlyCompletedTasks");

const monthlyJournalsElement =
    document.getElementById("monthlyJournals");


const taskRateElement =
    document.getElementById("taskRate");

const totalGoalsElement =
    document.getElementById("totalGoals");

const completedGoalsElement =
    document.getElementById("completedGoals");

const averageGoalProgressElement =
    document.getElementById("averageGoalProgress");


/* ================================
   Load Data
================================ */

let tasks = [];

let studySessions = [];

let journals = [];

let goals = [];


function loadData() {

    tasks =
        JSON.parse(
            localStorage.getItem("tasks")
        ) || [];


    studySessions =
        JSON.parse(
            localStorage.getItem("studySessions")
        ) || [];


    journals =
        JSON.parse(
            localStorage.getItem("journals")
        ) || [];


    goals =
        JSON.parse(
            localStorage.getItem("goals")
        ) || [];

}


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


    currentDateElement.textContent =
        now.toLocaleDateString(
            "en-IN",
            dateOptions
        );


    currentTimeElement.textContent =
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


/* ================================
   Get Today
================================ */

function getToday() {

    const now =
        new Date();


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
   Date Helpers
================================ */

function getDateValue(item) {

    return (
        item.date ||
        item.dueDate ||
        item.deadline ||
        ""
    );

}


function getStudyDate(session) {

    return session.date || "";

}


function getJournalDate(journal) {

    return journal.date || "";

}


/* ================================
   Completed Task
================================ */

function isTaskCompleted(task) {

    return (
        task.completed === true ||
        task.completed === "true"
    );

}


/* ================================
   Goal Status
================================ */

function isGoalCompleted(goal) {

    return (
        goal.completed === true ||
        goal.completed === "true" ||
        goal.status === "completed" ||
        Number(goal.progress || 0) >= 100
    );

}


/* ================================
   Get Date Object
================================ */

function parseDate(dateString) {

    if (!dateString) {

        return null;

    }


    return new Date(
        dateString + "T00:00:00"
    );

}


/* ================================
   Last 7 Days
================================ */

function getLast7Days() {

    const dates = [];

    const today =
        new Date();


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() - i
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


        dates.push(
            `${year}-${month}-${day}`
        );

    }


    return dates;

}


/* ================================
   Current Month
================================ */

function isCurrentMonth(dateString) {

    const date =
        parseDate(
            dateString
        );


    if (!date) {

        return false;

    }


    const now =
        new Date();


    return (
        date.getMonth() ===
            now.getMonth() &&

        date.getFullYear() ===
            now.getFullYear()
    );

}


/* ================================
   Total Statistics
================================ */

function updateTotalStatistics() {

    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(
            isTaskCompleted
        ).length;


    const totalStudy =
        studySessions.reduce(
            (
                total,
                session
            ) => {

                return (
                    total +
                    Number(
                        session.duration || 0
                    )
                );

            },
            0
        );


    const totalJournals =
        journals.length;


    totalTasksElement.textContent =
        totalTasks;


    completedTasksElement.textContent =
        completedTasks;


    totalStudyElement.textContent =
        totalStudy;


    totalJournalsElement.textContent =
        totalJournals;


    /* Task Percentage */

    let percentage = 0;


    if (
        totalTasks > 0
    ) {

        percentage =
            Math.round(
                (
                    completedTasks /
                    totalTasks
                ) * 100
            );

    }


    taskPercentageElement.textContent =
        `${percentage}%`;


    taskProgressBar.style.width =
        `${percentage}%`;


    taskRateElement.textContent =
        `${percentage}%`;

}


/* ================================
   Weekly Statistics
================================ */

function updateWeeklyStatistics() {

    const last7Days =
        getLast7Days();


    /* Weekly Study */

    const weeklyStudy =
        studySessions
            .filter(
                session =>
                    last7Days.includes(
                        getStudyDate(session)
                    )
            )
            .reduce(
                (
                    total,
                    session
                ) => {

                    return (
                        total +
                        Number(
                            session.duration || 0
                        )
                    );

                },
                0
            );


    /* Weekly Tasks */

    const weeklyTasks =
        tasks.filter(
            task => {

                return (
                    last7Days.includes(
                        getDateValue(task)
                    ) &&
                    isTaskCompleted(task)
                );

            }
        ).length;


    /* Weekly Journals */

    const weeklyJournals =
        journals.filter(
            journal =>
                last7Days.includes(
                    getJournalDate(journal)
                )
        ).length;


    /* Active Goals */

    const activeGoals =
        goals.filter(
            goal =>
                !isGoalCompleted(goal)
        ).length;


    weeklyStudyElement.textContent =
        `${weeklyStudy} minutes`;


    weeklyTasksElement.textContent =
        weeklyTasks;


    weeklyJournalsElement.textContent =
        weeklyJournals;


    activeGoalsElement.textContent =
        activeGoals;

}


/* ================================
   Monthly Statistics
================================ */

function updateMonthlyStatistics() {

    /* Study Sessions */

    const monthlyStudySessions =
        studySessions.filter(
            session =>
                isCurrentMonth(
                    getStudyDate(session)
                )
        );


    /* Study Minutes */

    const monthlyStudyMinutes =
        monthlyStudySessions.reduce(
            (
                total,
                session
            ) => {

                return (
                    total +
                    Number(
                        session.duration || 0
                    )
                );

            },
            0
        );


    /* Completed Tasks */

    const monthlyCompletedTasks =
        tasks.filter(
            task => {

                return (
                    isCurrentMonth(
                        getDateValue(task)
                    ) &&
                    isTaskCompleted(task)
                );

            }
        ).length;


    /* Journal Entries */

    const monthlyJournals =
        journals.filter(
            journal =>
                isCurrentMonth(
                    getJournalDate(journal)
                )
        ).length;


    monthlyStudySessionsElement.textContent =
        monthlyStudySessions.length;


    monthlyStudyMinutesElement.textContent =
        monthlyStudyMinutes;


    monthlyCompletedTasksElement.textContent =
        monthlyCompletedTasks;


    monthlyJournalsElement.textContent =
        monthlyJournals;

}


/* ================================
   Goal Statistics
================================ */

function updateGoalStatistics() {

    const totalGoals =
        goals.length;


    const completedGoals =
        goals.filter(
            isGoalCompleted
        ).length;


    let averageProgress = 0;


    if (
        totalGoals > 0
    ) {

        const totalProgress =
            goals.reduce(
                (
                    total,
                    goal
                ) => {

                    return (
                        total +
                        Number(
                            goal.progress || 0
                        )
                    );

                },
                0
            );


        averageProgress =
            Math.round(
                totalProgress /
                totalGoals
            );

    }


    totalGoalsElement.textContent =
        totalGoals;


    completedGoalsElement.textContent =
        completedGoals;


    averageGoalProgressElement.textContent =
        `${averageProgress}%`;

}


/* ================================
   Update All Statistics
================================ */

function updateStatistics() {

    loadData();

    updateTotalStatistics();

    updateWeeklyStatistics();

    updateMonthlyStatistics();

    updateGoalStatistics();

}


/* ================================
   Refresh When Page Becomes Active
================================ */

window.addEventListener(
    "focus",
    function () {

        updateStatistics();

    }
);


/* ================================
   Initial Load
================================ */

updateStatistics();