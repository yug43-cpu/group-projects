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
   Backend
================================ */

const API_URL =
    "http://localhost:5000/api";


let currentUser = null;

let tasks = [];

let studySessions = [];

let journals = [];

let goals = [];


/* ================================
   Current User
================================ */

function loadCurrentUser() {

    const currentUserRaw =
        localStorage.getItem("currentUser");


    if (!currentUserRaw) {

        window.location.href =
            "login.html";

        return false;
    }


    try {

        currentUser =
            JSON.parse(
                currentUserRaw
            );


        if (
            !currentUser ||
            !currentUser.id
        ) {

            window.location.href =
                "login.html";

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "Invalid current user:",
            error
        );


        localStorage.removeItem(
            "currentUser"
        );


        window.location.href =
            "login.html";

        return false;
    }
}


/* ================================
   Load Data From Backend
================================ */

async function loadData() {

    if (!currentUser) {
        return;
    }


    try {

        const userId =
            encodeURIComponent(
                currentUser.id
            );


        const [
            tasksResponse,
            studyResponse,
            journalsResponse,
            goalsResponse
        ] = await Promise.all([

            fetch(
                `${API_URL}/tasks?userId=${userId}`
            ),

            fetch(
                `${API_URL}/study?userId=${userId}`
            ),

            fetch(
                `${API_URL}/journals?userId=${userId}`
            ),

            fetch(
                `${API_URL}/goals?userId=${userId}`
            )

        ]);


        if (
            !tasksResponse.ok ||
            !studyResponse.ok ||
            !journalsResponse.ok ||
            !goalsResponse.ok
        ) {

            throw new Error(
                "Failed to load statistics data."
            );
        }


        const tasksData =
            await tasksResponse.json();

        const studyData =
            await studyResponse.json();

        const journalsData =
            await journalsResponse.json();

        const goalsData =
            await goalsResponse.json();


        /* ================================
           User Specific Data
        ================================ */

        tasks =
            Array.isArray(
                tasksData.tasks
            )
                ? tasksData.tasks
                : [];


        studySessions =
            Array.isArray(
                studyData.sessions
            )
                ? studyData.sessions
                : [];


        journals =
            Array.isArray(
                journalsData.journals
            )
                ? journalsData.journals
                : [];


        goals =
            Array.isArray(
                goalsData.goals
            )
                ? goalsData.goals
                : [];


        /*
           Update UI only.
           Do NOT call loadData() from updateStatistics().
        */

        updateTotalStatistics();

        updateWeeklyStatistics();

        updateMonthlyStatistics();

        updateGoalStatistics();

    } catch (error) {

        console.error(
            "Failed to load statistics data:",
            error
        );


        tasks = [];

        studySessions = [];

        journals = [];

        goals = [];


        updateTotalStatistics();

        updateWeeklyStatistics();

        updateMonthlyStatistics();

        updateGoalStatistics();
    }
}


/* ================================
   Date & Time
================================ */

function updateDateTime() {

    const now =
        new Date();


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


    if (currentDateElement) {

        currentDateElement.textContent =
            now.toLocaleDateString(
                "en-IN",
                dateOptions
            );
    }


    if (currentTimeElement) {

        currentTimeElement.textContent =
            now.toLocaleTimeString(
                "en-IN",
                timeOptions
            );
    }
}


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
        Number(
            goal.progress || 0
        ) >= 100
    );
}


/* ================================
   Get Date Object
================================ */

function parseDate(dateString) {

    if (!dateString) {

        return null;
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date;
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


    if (totalTasksElement) {

        totalTasksElement.textContent =
            totalTasks;
    }


    if (completedTasksElement) {

        completedTasksElement.textContent =
            completedTasks;
    }


    if (totalStudyElement) {

        totalStudyElement.textContent =
            totalStudy;
    }


    if (totalJournalsElement) {

        totalJournalsElement.textContent =
            totalJournals;
    }


    /* ================================
       Task Percentage
    ================================ */

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


    if (taskPercentageElement) {

        taskPercentageElement.textContent =
            `${percentage}%`;
    }


    if (taskProgressBar) {

        taskProgressBar.style.width =
            `${percentage}%`;
    }


    if (taskRateElement) {

        taskRateElement.textContent =
            `${percentage}%`;
    }
}


/* ================================
   Weekly Statistics
================================ */

function updateWeeklyStatistics() {

    const last7Days =
        getLast7Days();


    /* ================================
       Weekly Study
    ================================ */

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


    /* ================================
       Weekly Tasks
    ================================ */

    const weeklyTasks =
        tasks.filter(
            task => {

                return (
                    last7Days.includes(
                        getDateValue(task)
                    ) &&

                    isTaskCompleted(
                        task
                    )
                );
            }
        ).length;


    /* ================================
       Weekly Journals
    ================================ */

    const weeklyJournals =
        journals.filter(
            journal =>
                last7Days.includes(
                    getJournalDate(
                        journal
                    )
                )
        ).length;


    /* ================================
       Active Goals
    ================================ */

    const activeGoals =
        goals.filter(
            goal =>
                !isGoalCompleted(
                    goal
                )
        ).length;


    if (weeklyStudyElement) {

        weeklyStudyElement.textContent =
            `${weeklyStudy} minutes`;
    }


    if (weeklyTasksElement) {

        weeklyTasksElement.textContent =
            weeklyTasks;
    }


    if (weeklyJournalsElement) {

        weeklyJournalsElement.textContent =
            weeklyJournals;
    }


    if (activeGoalsElement) {

        activeGoalsElement.textContent =
            activeGoals;
    }
}


/* ================================
   Monthly Statistics
================================ */

function updateMonthlyStatistics() {

    /* ================================
       Study Sessions
    ================================ */

    const monthlyStudySessions =
        studySessions.filter(
            session =>
                isCurrentMonth(
                    getStudyDate(
                        session
                    )
                )
        );


    /* ================================
       Study Minutes
    ================================ */

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


    /* ================================
       Completed Tasks
    ================================ */

    const monthlyCompletedTasks =
        tasks.filter(
            task => {

                return (
                    isCurrentMonth(
                        getDateValue(
                            task
                        )
                    ) &&

                    isTaskCompleted(
                        task
                    )
                );
            }
        ).length;


    /* ================================
       Journal Entries
    ================================ */

    const monthlyJournals =
        journals.filter(
            journal =>
                isCurrentMonth(
                    getJournalDate(
                        journal
                    )
                )
        ).length;


    if (monthlyStudySessionsElement) {

        monthlyStudySessionsElement.textContent =
            monthlyStudySessions.length;
    }


    if (monthlyStudyMinutesElement) {

        monthlyStudyMinutesElement.textContent =
            monthlyStudyMinutes;
    }


    if (monthlyCompletedTasksElement) {

        monthlyCompletedTasksElement.textContent =
            monthlyCompletedTasks;
    }


    if (monthlyJournalsElement) {

        monthlyJournalsElement.textContent =
            monthlyJournals;
    }
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


    if (totalGoalsElement) {

        totalGoalsElement.textContent =
            totalGoals;
    }


    if (completedGoalsElement) {

        completedGoalsElement.textContent =
            completedGoals;
    }


    if (averageGoalProgressElement) {

        averageGoalProgressElement.textContent =
            `${averageProgress}%`;
    }
}


/* ================================
   Update All Statistics
================================ */

function updateStatistics() {

    /*
       Only update the UI here.

       IMPORTANT:
       Do NOT call loadData() here.
       Otherwise:

       updateStatistics()
       -> loadData()
       -> updateStatistics()
       -> loadData()

       would create an infinite loop.
    */


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

        loadData();

    }
);


/* ================================
   Initial Load
================================ */

if (loadCurrentUser()) {

    updateDateTime();

    setInterval(
        updateDateTime,
        1000
    );

    loadData();
}