/* ================================
   Calendar Page
================================ */

const calendarGrid =
    document.getElementById("calendarGrid");

const currentMonthTitle =
    document.getElementById("currentMonth");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const activityList =
    document.getElementById("activityList");


/* ================================
   Load Data
================================ */

let tasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

let studySessions =
    JSON.parse(localStorage.getItem("studySessions")) || [];

let journals =
    JSON.parse(localStorage.getItem("journals")) || [];

let goals =
    JSON.parse(localStorage.getItem("goals")) || [];


/* ================================
   Calendar State
================================ */

let currentDate = new Date();

/*
   null = normal monthly graph
   date = selected-date graph
*/

let selectedDate = null;


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


/* ================================
   Today
================================ */

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


/* ================================
   Date Format
================================ */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


/* ================================
   Date Key
================================ */

function dateKey(
    year,
    month,
    day
) {

    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

}


/* ================================
   Task Date
================================ */

function getTaskDate(task) {

    return (
        task.date ||
        task.dueDate ||
        task.deadline ||
        ""
    );

}


/* ================================
   Study Date
================================ */

function getStudyDate(session) {

    return session.date || "";

}


/* ================================
   Journal Date
================================ */

function getJournalDate(journal) {

    return journal.date || "";

}


/* ================================
   Calendar
================================ */

function renderCalendar() {

    calendarGrid.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    /* Month Name */

    currentMonthTitle.textContent =
        currentDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    /* First Day */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /* Days */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* Empty Cells */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarGrid.appendChild(
            emptyDay
        );

    }


    /* Calendar Days */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            dateKey(
                year,
                month,
                day
            );


        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        /* Today */

        if (
            date === getToday()
        ) {

            dayElement.classList.add(
                "today"
            );

        }


        /* Selected */

        if (
            date === selectedDate
        ) {

            dayElement.classList.add(
                "selected"
            );

        }


        dayElement.innerHTML = `

            <div class="day-number">
                ${day}
            </div>

            <div class="activity-indicators">

                ${
                    hasTask(date)
                        ? `<span class="activity-dot task-dot"></span>`
                        : ""
                }

                ${
                    hasStudy(date)
                        ? `<span class="activity-dot study-dot"></span>`
                        : ""
                }

                ${
                    hasJournal(date)
                        ? `<span class="activity-dot journal-dot"></span>`
                        : ""
                }

                ${
                    hasGoal(date)
                        ? `<span class="activity-dot goal-dot"></span>`
                        : ""
                }

            </div>

        `;


        /* Date Click */

        dayElement.addEventListener(
            "click",
            function () {

                selectedDate =
                    date;

                renderCalendar();

                renderSelectedDate();

                renderGraphs();

            }
        );


        calendarGrid.appendChild(
            dayElement
        );

    }

}


/* ================================
   Activity Check
================================ */

function hasTask(date) {

    return tasks.some(
        task =>
            getTaskDate(task) === date
    );

}


function hasStudy(date) {

    return studySessions.some(
        session =>
            getStudyDate(session) === date
    );

}


function hasJournal(date) {

    return journals.some(
        journal =>
            getJournalDate(journal) === date
    );

}


function hasGoal(date) {

    return goals.some(
        goal =>
            goal.deadline === date
    );

}


/* ================================
   Selected Date Activity
================================ */

function renderSelectedDate() {

    if (!selectedDate) {

        selectedDateTitle.textContent =
            "Today's Activity";

        return;

    }


    selectedDateTitle.textContent =
        formatDate(selectedDate);


    let activities = [];


    /* Tasks */

    tasks.forEach(
        task => {

            if (
                getTaskDate(task) ===
                selectedDate
            ) {

                activities.push({

                    icon: "✅",

                    title:
                        task.title ||
                        "Task",

                    description:
                        task.completed === true ||
                        task.completed === "true"

                            ? "Completed task"

                            : "Pending task"

                });

            }

        }
    );


    /* Study */

    studySessions.forEach(
        session => {

            if (
                getStudyDate(session) ===
                selectedDate
            ) {

                activities.push({

                    icon: "📚",

                    title:
                        session.subject ||
                        "Study Session",

                    description:
                        `${session.duration || 0} minutes`

                });

            }

        }
    );


    /* Journal */

    journals.forEach(
        journal => {

            if (
                getJournalDate(journal) ===
                selectedDate
            ) {

                activities.push({

                    icon: "📝",

                    title:
                        journal.title ||
                        "Journal Entry",

                    description:
                        journal.mood ||
                        "Journal entry"

                });

            }

        }
    );


    /* Goals */

    goals.forEach(
        goal => {

            if (
                goal.deadline ===
                selectedDate
            ) {

                activities.push({

                    icon: "🎯",

                    title:
                        goal.title ||
                        "Goal",

                    description:
                        `Progress: ${goal.progress || 0}%`

                });

            }

        }
    );


    /* No Activity */

    if (
        activities.length === 0
    ) {

        activityList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📅
                </div>

                <h3>
                    No activity
                </h3>

                <p>
                    No tasks, study sessions,
                    journal entries or goals
                    found for this date.
                </p>

            </div>

        `;

        return;

    }


    /* Activity List */

    activityList.innerHTML =
        activities.map(
            activity => `

                <div class="activity-item">

                    <div class="activity-icon">
                        ${activity.icon}
                    </div>

                    <div class="activity-info">

                        <h3>
                            ${escapeHTML(
                                activity.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                activity.description
                            )}
                        </p>

                    </div>

                </div>

            `
        ).join("");

}


/* ================================
   Escape HTML
================================ */

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ================================
   Month Navigation
================================ */

previousMonth.addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        /*
           Reset selected date.
           Graph returns to monthly mode.
        */

        selectedDate = null;

        renderCalendar();

        renderSelectedDate();

        renderGraphs();

    }
);


nextMonth.addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        /*
           Reset selected date.
           Graph returns to monthly mode.
        */

        selectedDate = null;

        renderCalendar();

        renderSelectedDate();

        renderGraphs();

    }
);


/* ================================
   Current Month Helpers
================================ */

function getDaysInCurrentMonth() {

    return new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

}


function getCurrentMonthDate(day) {

    return dateKey(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
    );

}


/* ================================
   Study Minutes
================================ */

function getStudyMinutes(date) {

    return studySessions
        .filter(
            session =>
                getStudyDate(session) === date
        )
        .reduce(
            (
                total,
                session
            ) => {

                return total +
                    Number(
                        session.duration || 0
                    );

            },
            0
        );

}


/* ================================
   Completed Tasks
================================ */

function getCompletedTasks(date) {

    return tasks.filter(
        task => {

            const completed =
                task.completed === true ||
                task.completed === "true";

            return (
                getTaskDate(task) === date &&
                completed
            );

        }
    ).length;

}


/* ================================
   Journal Count
================================ */

function getJournalCount(date) {

    return journals.filter(
        journal =>
            getJournalDate(journal) === date
    ).length;

}


/* ================================
   Draw Chart
================================ */

function drawChart(
    canvasId,
    data,
    label
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    const ratio =
        window.devicePixelRatio || 1;


    canvas.width =
        width * ratio;

    canvas.height =
        height * ratio;


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const padding = 35;


    const chartWidth =
        width - padding * 2;

    const chartHeight =
        height - padding * 2;


    const maxValue =
        Math.max(
            ...data,
            1
        );


    /* Grid Lines */

    ctx.strokeStyle =
        "#1e293b";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (
                chartHeight / 4
            ) * i;


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width - padding,
            y
        );

        ctx.stroke();

    }


    /* Bars */

    const slotWidth =
        chartWidth /
        data.length;


    const barWidth =
        Math.max(
            4,
            slotWidth * 0.6
        );


    data.forEach(
        (
            value,
            index
        ) => {

            const x =
                padding +
                slotWidth * index +
                (
                    slotWidth -
                    barWidth
                ) / 2;


            const barHeight =
                (
                    value /
                    maxValue
                ) *
                chartHeight;


            const y =
                height -
                padding -
                barHeight;


            ctx.fillStyle =
                "#2563eb";


            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );


            /*
               Show value when
               selected-date mode.
            */

            if (
                data.length === 1
            ) {

                ctx.fillStyle =
                    "#f8fafc";

                ctx.font =
                    "12px Arial";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    value,
                    x + barWidth / 2,
                    y - 8
                );

            }


            /*
               Show day number
               in monthly mode.
            */

            else if (
                index % 5 === 0 ||
                index === data.length - 1
            ) {

                ctx.fillStyle =
                    "#64748b";

                ctx.font =
                    "10px Arial";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    index + 1,
                    x + barWidth / 2,
                    height - 12
                );

            }

        }
    );


    /* Graph Label */

    ctx.fillStyle =
        "#94a3b8";

    ctx.font =
        "11px Arial";

    ctx.textAlign =
        "left";

    ctx.fillText(
        label,
        padding,
        15
    );

}


/* ================================
   Render Graphs
================================ */

function renderGraphs() {

    /*
       SELECTED DATE MODE
    */

    if (selectedDate) {

        const studyMinutes =
            getStudyMinutes(
                selectedDate
            );


        const completedTasks =
            getCompletedTasks(
                selectedDate
            );


        const journalCount =
            getJournalCount(
                selectedDate
            );


        drawChart(
            "studyChart",
            [studyMinutes],
            "Selected Date"
        );


        drawChart(
            "taskChart",
            [completedTasks],
            "Selected Date"
        );


        drawChart(
            "journalChart",
            [journalCount],
            "Selected Date"
        );


        return;
    }


    /*
       NORMAL MONTHLY MODE
    */

    const days =
        getDaysInCurrentMonth();


    const studyData = [];

    const taskData = [];

    const journalData = [];


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const date =
            getCurrentMonthDate(day);


        studyData.push(
            getStudyMinutes(
                date
            )
        );


        taskData.push(
            getCompletedTasks(
                date
            )
        );


        journalData.push(
            getJournalCount(
                date
            )
        );

    }


    drawChart(
        "studyChart",
        studyData,
        "Minutes"
    );


    drawChart(
        "taskChart",
        taskData,
        "Tasks"
    );


    drawChart(
        "journalChart",
        journalData,
        "Entries"
    );

}


/* ================================
   Window Resize
================================ */

window.addEventListener(
    "resize",
    function () {

        renderGraphs();

    }
);


/* ================================
   Initial Load
================================ */

renderCalendar();

renderSelectedDate();

renderGraphs();


