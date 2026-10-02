/* =================================
   Calendar Page
================================= */

let currentDate = new Date();
let selectedDate = null;

let graphDesign =
    localStorage.getItem("calendarGraphDesign") || "modern";

let activeTooltip = null;

const API_URL = "http://localhost:5000/api";

let tasks = [];
let studySessions = [];
let journals = [];
let goals = [];

let currentUser = null;


/* =================================
   Current User
================================= */

function loadCurrentUser() {

    const currentUserRaw =
        localStorage.getItem("currentUser");

    if (!currentUserRaw) {
        window.location.href = "login.html";
        return false;
    }

    try {

        currentUser =
            JSON.parse(currentUserRaw);

        if (
            !currentUser ||
            !currentUser.id
        ) {
            window.location.href = "login.html";
            return false;
        }

        return true;

    } catch (error) {

        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
        return false;
    }
}


/* =================================
   Load Backend Data
================================= */

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


        const tasksData =
            await tasksResponse.json();

        const studyData =
            await studyResponse.json();

        const journalsData =
            await journalsResponse.json();

        const goalsData =
            await goalsResponse.json();


        tasks =
            Array.isArray(tasksData.tasks)
                ? tasksData.tasks
                : [];


        studySessions =
            Array.isArray(studyData.sessions)
                ? studyData.sessions
                : [];


        journals =
            Array.isArray(journalsData.journals)
                ? journalsData.journals
                : [];


        goals =
            Array.isArray(goalsData.goals)
                ? goalsData.goals
                : [];


        renderCalendar();
        renderSelectedDate();
        renderGraphs();

    } catch (error) {

        console.error(
            "Failed to load calendar data:",
            error
        );

        tasks = [];
        studySessions = [];
        journals = [];
        goals = [];

        renderCalendar();
        renderSelectedDate();
        renderGraphs();
    }
}


/* =================================
   Date Helpers
================================= */

function getDateString(date) {

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


function formatDate(dateString) {

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
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* =================================
   Data Helpers
================================= */

function getTasks() {
    return tasks;
}


function getStudySessions() {
    return studySessions;
}


function getJournals() {
    return journals;
}


function getGoals() {
    return goals;
}


/* =================================
   Current Date / Time
================================= */

function updateDateTime() {

    const now =
        new Date();

    const dateElement =
        document.getElementById(
            "currentDate"
        );

    const timeElement =
        document.getElementById(
            "currentTime"
        );

    if (dateElement) {

        dateElement.textContent =
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }

    if (timeElement) {

        timeElement.textContent =
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
    }
}


/* =================================
   Calendar
================================= */

function renderCalendar() {

    const calendarGrid =
        document.getElementById(
            "calendarGrid"
        );

    const currentMonthElement =
        document.getElementById(
            "currentMonth"
        );

    if (!calendarGrid) {
        return;
    }

    calendarGrid.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    if (currentMonthElement) {

        currentMonthElement.textContent =
            currentDate.toLocaleDateString(
                "en-IN",
                {
                    month: "long",
                    year: "numeric"
                }
            );
    }


    /* Empty Days */

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
            new Date(
                year,
                month,
                day
            );

        const dateString =
            getDateString(date);

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        if (
            dateString ===
            getDateString(new Date())
        ) {

            dayElement.classList.add(
                "today"
            );
        }


        if (
            selectedDate &&
            dateString === selectedDate
        ) {

            dayElement.classList.add(
                "selected"
            );
        }


        const dayNumber =
            document.createElement("div");

        dayNumber.className =
            "day-number";

        dayNumber.textContent =
            day;

        dayElement.appendChild(
            dayNumber
        );


        const indicators =
            document.createElement("div");

        indicators.className =
            "activity-indicators";


        const hasTask =
            tasks.some(
                task =>
                    (
                        task.date ||
                        task.dueDate
                    ) === dateString
            );


        const hasStudy =
            studySessions.some(
                session =>
                    session.date ===
                    dateString
            );


        const hasJournal =
            journals.some(
                journal =>
                    journal.date ===
                    dateString
            );


        const hasGoal =
            goals.some(
                goal =>
                    (
                        goal.deadline ||
                        goal.date
                    ) === dateString
            );


        if (hasTask) {

            const dot =
                document.createElement("span");

            dot.className =
                "activity-dot task-dot";

            dot.title =
                "Task activity";

            indicators.appendChild(dot);
        }


        if (hasStudy) {

            const dot =
                document.createElement("span");

            dot.className =
                "activity-dot study-dot";

            dot.title =
                "Study activity";

            indicators.appendChild(dot);
        }


        if (hasJournal) {

            const dot =
                document.createElement("span");

            dot.className =
                "activity-dot journal-dot";

            dot.title =
                "Journal activity";

            indicators.appendChild(dot);
        }


        if (hasGoal) {

            const dot =
                document.createElement("span");

            dot.className =
                "activity-dot goal-dot";

            dot.title =
                "Goal activity";

            indicators.appendChild(dot);
        }


        dayElement.appendChild(
            indicators
        );


        dayElement.addEventListener(
            "click",
            function () {

                if (
                    selectedDate ===
                    dateString
                ) {

                    selectedDate = null;

                } else {

                    selectedDate =
                        dateString;
                }

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


/* =================================
   Selected Date Activity
================================= */

function renderSelectedDate() {

    const title =
        document.getElementById(
            "selectedDateTitle"
        );

    const activityList =
        document.getElementById(
            "activityList"
        );

    if (!activityList) {
        return;
    }


    if (!selectedDate) {

        if (title) {

            title.textContent =
                "Today's Activity";
        }

        renderActivityForDate(
            getDateString(new Date()),
            activityList
        );

        return;
    }


    if (title) {

        title.textContent =
            formatDate(selectedDate);
    }


    renderActivityForDate(
        selectedDate,
        activityList
    );
}


/* =================================
   Activity List
================================= */

function renderActivityForDate(
    dateString,
    activityList
) {

    activityList.innerHTML = "";


    const filteredTasks =
        tasks.filter(
            task =>
                (
                    task.date ||
                    task.dueDate
                ) === dateString
        );


    const filteredStudySessions =
        studySessions.filter(
            session =>
                session.date === dateString
        );


    const filteredJournals =
        journals.filter(
            journal =>
                journal.date === dateString
        );


    const filteredGoals =
        goals.filter(
            goal =>
                (
                    goal.deadline ||
                    goal.date
                ) === dateString
        );


    let activityCount = 0;


    filteredTasks.forEach(
        task => {

            activityCount++;

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `
                <div class="activity-icon">
                    ✅
                </div>

                <div class="activity-info">

                    <h3>
                        ${escapeHtml(
                            task.name ||
                            task.title ||
                            "Task"
                        )}
                    </h3>

                    <p>
                        Task
                        ${
                            task.completed
                                ? "• Completed"
                                : "• Pending"
                        }
                    </p>

                </div>
            `;

            activityList.appendChild(
                item
            );
        }
    );


    filteredStudySessions.forEach(
        session => {

            activityCount++;

            const minutes =
                Number(
                    session.duration ||
                    session.minutes ||
                    session.studyTime ||
                    0
                );

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `
                <div class="activity-icon">
                    📚
                </div>

                <div class="activity-info">

                    <h3>
                        Study Session
                    </h3>

                    <p>
                        ${minutes} minutes
                    </p>

                </div>
            `;

            activityList.appendChild(
                item
            );
        }
    );


    filteredJournals.forEach(
        journal => {

            activityCount++;

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `
                <div class="activity-icon">
                    📝
                </div>

                <div class="activity-info">

                    <h3>
                        Journal Entry
                    </h3>

                    <p>
                        Journal activity recorded
                    </p>

                </div>
            `;

            activityList.appendChild(
                item
            );
        }
    );


    filteredGoals.forEach(
        goal => {

            activityCount++;

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `
                <div class="activity-icon">
                    🎯
                </div>

                <div class="activity-info">

                    <h3>
                        ${escapeHtml(
                            goal.name ||
                            goal.title ||
                            "Goal"
                        )}
                    </h3>

                    <p>
                        Goal deadline
                    </p>

                </div>
            `;

            activityList.appendChild(
                item
            );
        }
    );


    if (activityCount === 0) {

        activityList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📅
                </div>

                <h3>
                    No activity
                </h3>

                <p>
                    No tasks, study sessions or
                    journal entries found.
                </p>

            </div>

        `;
    }
}


/* =================================
   HTML Safety
================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


/* =================================
   Graph Data
================================= */

function getStudyMinutes(dateString) {

    return studySessions
        .filter(
            session =>
                session.date === dateString
        )
        .reduce(
            (
                total,
                session
            ) => {

                return total +
                    Number(
                        session.duration ||
                        session.minutes ||
                        session.studyTime ||
                        0
                    );

            },
            0
        );
}


function getCompletedTasks(dateString) {

    return tasks
        .filter(
            task =>
                (
                    task.date ||
                    task.dueDate
                ) === dateString &&
                task.completed === true
        )
        .length;
}


function getJournalCount(dateString) {

    return journals
        .filter(
            journal =>
                journal.date === dateString
        )
        .length;
}


/* =================================
   Nice Graph Scale
================================= */

function getNiceMax(values) {

    const max =
        Math.max(
            ...values,
            0
        );

    if (max <= 0) {
        return 5;
    }

    if (max <= 5) {
        return 5;
    }

    if (max <= 10) {
        return 10;
    }

    if (max <= 20) {
        return 20;
    }

    if (max <= 50) {
        return Math.ceil(
            max / 10
        ) * 10;
    }

    if (max <= 100) {
        return Math.ceil(
            max / 20
        ) * 20;
    }

    return Math.ceil(
        max / 50
    ) * 50;
}


/* =================================
   Rounded Rectangle
================================= */

function roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    ctx.beginPath();

    ctx.moveTo(
        x + r,
        y
    );

    ctx.lineTo(
        x + width - r,
        y
    );

    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + r
    );

    ctx.lineTo(
        x + width,
        y + height - r
    );

    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - r,
        y + height
    );

    ctx.lineTo(
        x + r,
        y + height
    );

    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - r
    );

    ctx.lineTo(
        x,
        y + r
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x + r,
        y
    );

    ctx.closePath();
}


/* =================================
   Canvas Setup
================================= */

function setupCanvas(canvas) {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

    const ctx =
        canvas.getContext("2d");

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    return {
        ctx,
        width: rect.width,
        height: rect.height
    };
}


/* =================================
   Graph Tooltip
================================= */

function createTooltip() {

    if (activeTooltip) {
        return activeTooltip;
    }

    const tooltip =
        document.createElement("div");

    tooltip.style.position =
        "fixed";

    tooltip.style.display =
        "none";

    tooltip.style.padding =
        "9px 12px";

    tooltip.style.background =
        "#020617";

    tooltip.style.border =
        "1px solid #334155";

    tooltip.style.borderRadius =
        "8px";

    tooltip.style.color =
        "#f8fafc";

    tooltip.style.fontSize =
        "12px";

    tooltip.style.lineHeight =
        "1.5";

    tooltip.style.pointerEvents =
        "none";

    tooltip.style.zIndex =
        "9999";

    tooltip.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.35)";

    document.body.appendChild(
        tooltip
    );

    activeTooltip =
        tooltip;

    return tooltip;
}


function showTooltip(
    event,
    title,
    value
) {

    const tooltip =
        createTooltip();

    tooltip.innerHTML = `
        <strong>${escapeHtml(title)}</strong>
        <br>
        Value: ${escapeHtml(value)}
    `;

    tooltip.style.display =
        "block";

    let left =
        event.clientX + 14;

    let top =
        event.clientY + 14;

    const rect =
        tooltip.getBoundingClientRect();

    if (
        left + rect.width >
        window.innerWidth - 10
    ) {

        left =
            event.clientX -
            rect.width -
            14;
    }

    if (
        top + rect.height >
        window.innerHeight - 10
    ) {

        top =
            event.clientY -
            rect.height -
            14;
    }

    tooltip.style.left =
        `${left}px`;

    tooltip.style.top =
        `${top}px`;
}


function hideTooltip() {

    if (activeTooltip) {

        activeTooltip.style.display =
            "none";
    }
}


/* =================================
   Draw Graph
================================= */

function drawChart(
    canvas,
    data,
    labels,
    type,
    tooltipTitles
) {

    if (!canvas) {
        return;
    }

    const {
        ctx,
        width,
        height
    } =
        setupCanvas(canvas);

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const padding = {
        top: 20,
        right: 20,
        bottom: 35,
        left: 42
    };

    const chartWidth =
        width -
        padding.left -
        padding.right;

    const chartHeight =
        height -
        padding.top -
        padding.bottom;

    const maxValue =
        getNiceMax(data);


    /* Grid */

    ctx.strokeStyle =
        "#1e293b";

    ctx.lineWidth = 1;

    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding.top +
            chartHeight -
            (
                chartHeight *
                i /
                4
            );

        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();

        const value =
            Math.round(
                maxValue *
                i /
                4
            );

        ctx.fillStyle =
            "#64748b";

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "right";

        ctx.fillText(
            value,
            padding.left - 7,
            y + 3
        );
    }


    const hasData =
        data.some(
            value =>
                Number(value) > 0
        );


    if (!hasData) {

        ctx.fillStyle =
            "#64748b";

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "No activity recorded",
            width / 2,
            height / 2
        );
    }


    const isSingleDate =
        data.length === 1;

    let points = [];


    /* BAR */

    if (type === "bar") {

        const barGap =
            isSingleDate
                ? 35
                : 4;

        const barWidth =
            isSingleDate
                ? Math.min(
                    80,
                    chartWidth / 2
                )
                : Math.max(
                    4,
                    (
                        chartWidth /
                        data.length
                    ) - barGap
                );

        data.forEach(
            (value, index) => {

                const x =
                    isSingleDate
                        ? padding.left +
                          (
                              chartWidth -
                              barWidth
                          ) / 2
                        : padding.left +
                          (
                              index *
                              chartWidth /
                              data.length
                          ) +
                          barGap / 2;

                const barHeight =
                    (
                        Number(value) /
                        maxValue
                    ) *
                    chartHeight;

                const y =
                    padding.top +
                    chartHeight -
                    barHeight;

                ctx.fillStyle =
                    "#3b82f6";

                roundRect(
                    ctx,
                    x,
                    y,
                    barWidth,
                    barHeight,
                    6
                );

                ctx.fill();

                ctx.fillStyle =
                    "#64748b";

                ctx.font =
                    "10px Arial";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    labels[index],
                    x + barWidth / 2,
                    height - 10
                );
            }
        );
    }


    /* LINE / AREA / MODERN */

    else {

        const step =
            isSingleDate
                ? chartWidth / 2
                : chartWidth /
                  Math.max(
                      data.length - 1,
                      1
                  );

        points =
            data.map(
                (value, index) => {

                    const x =
                        isSingleDate
                            ? padding.left +
                              chartWidth / 2
                            : padding.left +
                              index * step;

                    const y =
                        padding.top +
                        chartHeight -
                        (
                            Number(value) /
                            maxValue
                        ) *
                        chartHeight;

                    return {
                        x,
                        y,
                        value,
                        index
                    };
                }
            );


        if (
            type === "area" ||
            type === "modern"
        ) {

            ctx.beginPath();

            points.forEach(
                (
                    point,
                    index
                ) => {

                    if (index === 0) {

                        ctx.moveTo(
                            point.x,
                            point.y
                        );

                    } else {

                        ctx.lineTo(
                            point.x,
                            point.y
                        );
                    }
                }
            );

            if (points.length > 0) {

                ctx.lineTo(
                    points[
                        points.length - 1
                    ].x,
                    padding.top +
                    chartHeight
                );

                ctx.lineTo(
                    points[0].x,
                    padding.top +
                    chartHeight
                );

                ctx.closePath();

                ctx.fillStyle =
                    "rgba(59,130,246,0.10)";

                ctx.fill();
            }
        }


        if (
            type === "line" ||
            type === "area" ||
            type === "modern"
        ) {

            if (points.length > 0) {

                ctx.beginPath();

                points.forEach(
                    (
                        point,
                        index
                    ) => {

                        if (index === 0) {

                            ctx.moveTo(
                                point.x,
                                point.y
                            );

                        } else {

                            ctx.lineTo(
                                point.x,
                                point.y
                            );
                        }
                    }
                );

                ctx.strokeStyle =
                    "#3b82f6";

                ctx.lineWidth = 2;

                ctx.stroke();


                points.forEach(
                    point => {

                        ctx.beginPath();

                        ctx.arc(
                            point.x,
                            point.y,
                            isSingleDate
                                ? 7
                                : 3.5,
                            0,
                            Math.PI * 2
                        );

                        ctx.fillStyle =
                            "#3b82f6";

                        ctx.fill();


                        ctx.beginPath();

                        ctx.arc(
                            point.x,
                            point.y,
                            isSingleDate
                                ? 3
                                : 1.5,
                            0,
                            Math.PI * 2
                        );

                        ctx.fillStyle =
                            "#f8fafc";

                        ctx.fill();
                    }
                );
            }
        }


        ctx.fillStyle =
            "#64748b";

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "center";

        points.forEach(
            point => {

                if (
                    !isSingleDate &&
                    data.length > 15 &&
                    point.index % 5 !== 0 &&
                    point.index !==
                        data.length - 1
                ) {

                    return;
                }

                ctx.fillText(
                    labels[point.index],
                    point.x,
                    height - 10
                );
            }
        );
    }


    /* Tooltip Areas */

    canvas.onmousemove =
        function (event) {

            const rect =
                canvas.getBoundingClientRect();

            const mouseX =
                event.clientX -
                rect.left;

            const mouseY =
                event.clientY -
                rect.top;

            let hoveredIndex = -1;


            if (type === "bar") {

                const barGap =
                    isSingleDate
                        ? 35
                        : 4;

                const barWidth =
                    isSingleDate
                        ? Math.min(
                            80,
                            chartWidth / 2
                        )
                        : Math.max(
                            4,
                            (
                                chartWidth /
                                data.length
                            ) -
                            barGap
                        );

                data.forEach(
                    (
                        value,
                        index
                    ) => {

                        const x =
                            isSingleDate
                                ? padding.left +
                                  (
                                      chartWidth -
                                      barWidth
                                  ) / 2
                                : padding.left +
                                  (
                                      index *
                                      chartWidth /
                                      data.length
                                  ) +
                                  barGap / 2;

                        const barHeight =
                            (
                                Number(value) /
                                maxValue
                            ) *
                            chartHeight;

                        const y =
                            padding.top +
                            chartHeight -
                            barHeight;

                        if (
                            mouseX >= x &&
                            mouseX <=
                                x + barWidth &&
                            mouseY >= y &&
                            mouseY <=
                                padding.top +
                                chartHeight
                        ) {

                            hoveredIndex =
                                index;
                        }
                    }
                );

            } else {

                points.forEach(
                    point => {

                        const distance =
                            Math.sqrt(
                                Math.pow(
                                    mouseX -
                                    point.x,
                                    2
                                ) +
                                Math.pow(
                                    mouseY -
                                    point.y,
                                    2
                                )
                            );

                        if (
                            distance <= 12
                        ) {

                            hoveredIndex =
                                point.index;
                        }
                    }
                );
            }


            if (
                hoveredIndex !== -1
            ) {

                showTooltip(
                    event,
                    tooltipTitles[
                        hoveredIndex
                    ],
                    data[
                        hoveredIndex
                    ]
                );

            } else {

                hideTooltip();
            }
        };


    canvas.onmouseleave =
        function () {

            hideTooltip();
        };
}


/* =================================
   Graph Statistics
================================= */

function updateGraphStats(data) {

    const total =
        data.reduce(
            (
                sum,
                value
            ) =>
                sum +
                Number(value),
            0
        );

    const average =
        data.length > 0
            ? total / data.length
            : 0;

    const highest =
        data.length > 0
            ? Math.max(
                ...data
            )
            : 0;

    const totalElement =
        document.getElementById(
            "graphTotal"
        );

    const averageElement =
        document.getElementById(
            "graphAverage"
        );

    const highestElement =
        document.getElementById(
            "graphHighest"
        );

    if (totalElement) {
        totalElement.textContent =
            Math.round(total);
    }

    if (averageElement) {
        averageElement.textContent =
            Number(
                average.toFixed(1)
            );
    }

    if (highestElement) {
        highestElement.textContent =
            highest;
    }
}


/* =================================
   Render Graphs
================================= */

function renderGraphs() {

    const graphTitle =
        document.getElementById(
            "graphTitle"
        );


    if (!selectedDate) {

        if (graphTitle) {

            graphTitle.textContent =
                "Monthly Activity 📊";
        }

        const year =
            currentDate.getFullYear();

        const month =
            currentDate.getMonth();

        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

        const labels = [];
        const tooltipTitles = [];

        const studyData = [];
        const taskData = [];
        const journalData = [];


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );

            const dateString =
                getDateString(date);

            labels.push(
                String(day)
            );

            tooltipTitles.push(
                formatDate(dateString)
            );

            studyData.push(
                getStudyMinutes(
                    dateString
                )
            );

            taskData.push(
                getCompletedTasks(
                    dateString
                )
            );

            journalData.push(
                getJournalCount(
                    dateString
                )
            );
        }


        drawChart(
            document.getElementById(
                "studyChart"
            ),
            studyData,
            labels,
            graphDesign,
            tooltipTitles
        );

        drawChart(
            document.getElementById(
                "taskChart"
            ),
            taskData,
            labels,
            graphDesign,
            tooltipTitles
        );

        drawChart(
            document.getElementById(
                "journalChart"
            ),
            journalData,
            labels,
            graphDesign,
            tooltipTitles
        );


        const combinedData =
            studyData.map(
                (
                    value,
                    index
                ) =>
                    value +
                    taskData[index] +
                    journalData[index]
            );

        updateGraphStats(
            combinedData
        );

        return;
    }


    if (graphTitle) {

        graphTitle.textContent =
            "Selected Date Activity 📊";
    }


    const study =
        getStudyMinutes(
            selectedDate
        );

    const task =
        getCompletedTasks(
            selectedDate
        );

    const journal =
        getJournalCount(
            selectedDate
        );

    const selectedLabel =
        formatDate(
            selectedDate
        );


    drawChart(
        document.getElementById(
            "studyChart"
        ),
        [study],
        ["Study"],
        graphDesign,
        [selectedLabel]
    );

    drawChart(
        document.getElementById(
            "taskChart"
        ),
        [task],
        ["Tasks"],
        graphDesign,
        [selectedLabel]
    );

    drawChart(
        document.getElementById(
            "journalChart"
        ),
        [journal],
        ["Journal"],
        graphDesign,
        [selectedLabel]
    );


    updateGraphStats([
        study,
        task,
        journal
    ]);
}


/* =================================
   Graph Design Selector
================================= */

const graphDesignSelect =
    document.getElementById(
        "graphDesign"
    );

if (graphDesignSelect) {

    graphDesignSelect.value =
        graphDesign;

    graphDesignSelect.addEventListener(
        "change",
        function () {

            graphDesign =
                this.value;

            localStorage.setItem(
                "calendarGraphDesign",
                graphDesign
            );

            renderGraphs();
        }
    );
}


/* =================================
   Month Navigation
================================= */

const previousMonth =
    document.getElementById(
        "previousMonth"
    );

const nextMonth =
    document.getElementById(
        "nextMonth"
    );


if (previousMonth) {

    previousMonth.addEventListener(
        "click",
        function () {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            selectedDate = null;

            renderCalendar();
            renderSelectedDate();
            renderGraphs();
        }
    );
}


if (nextMonth) {

    nextMonth.addEventListener(
        "click",
        function () {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            selectedDate = null;

            renderCalendar();
            renderSelectedDate();
            renderGraphs();
        }
    );
}


/* =================================
   Window Resize
================================= */

window.addEventListener(
    "resize",
    function () {

        renderGraphs();
    }
);


/* =================================
   Initial Load
================================= */

if (loadCurrentUser()) {

    updateDateTime();

    setInterval(
        updateDateTime,
        1000
    );

    loadData();

}