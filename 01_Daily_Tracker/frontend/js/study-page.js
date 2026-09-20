// ================================
// Study Elements
// ================================

const studyList =
    document.getElementById("studyList");

const todayStudyTime =
    document.getElementById("todayStudyTime");

const todaySessions =
    document.getElementById("todaySessions");

const totalSubjects =
    document.getElementById("totalSubjects");

const totalStudyTime =
    document.getElementById("totalStudyTime");


// ================================
// Study Modal
// ================================

const studyModal =
    document.getElementById("studyModal");

const openStudyModal =
    document.getElementById("openStudyModal");

const closeStudyModal =
    document.getElementById("closeStudyModal");

const cancelStudy =
    document.getElementById("cancelStudy");

const studyForm =
    document.getElementById("studyForm");

const studyModalTitle =
    document.getElementById("studyModalTitle");

const studySubject =
    document.getElementById("studySubject");

const studyDuration =
    document.getElementById("studyDuration");

const studyDate =
    document.getElementById("studyDate");

let currentEditingSession = null;


// ================================
// Current Filter
// ================================

let currentFilter = "today";


// ================================
// Get Today's Date
// ================================

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


// ================================
// Load Sessions
// ================================

function loadStudySessions() {

    const sessions =
        JSON.parse(
            localStorage.getItem("studySessions")
        ) || [];

    displayStudySessions(sessions);

    updateStudyStats(sessions);
}


// ================================
// Display Sessions
// ================================

function displayStudySessions(sessions) {

    studyList.innerHTML = "";

    let filteredSessions = sessions;

    if (currentFilter === "today") {

        const today =
            getToday();

        filteredSessions =
            sessions.filter(function (session) {

                return session.date === today;

            });

    }


    if (filteredSessions.length === 0) {

        studyList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No study sessions found
                </h3>

                <p>
                    Add a study session to start tracking.
                </p>

            </div>
        `;

        return;

    }


    filteredSessions.forEach(function (session) {

        createStudyElement(
            session,
            sessions.indexOf(session)
        );

    });

}


// ================================
// Create Study Element
// ================================

function createStudyElement(session, index) {

    const studyDiv =
        document.createElement("div");

    studyDiv.classList.add("study-item");

    studyDiv.innerHTML = `
        <div class="study-top">

            <div class="study-subject">
                ${escapeHTML(session.subject)}
            </div>

            <div class="study-duration">
                ${formatDuration(session.duration)}
            </div>

        </div>

        <div class="study-date">
            ${formatDate(session.date)}
        </div>

        <div class="study-actions">

            <button
                class="edit-study"
                data-index="${index}"
            >
                Edit
            </button>

            <button
                class="delete-study"
                data-index="${index}"
            >
                Delete
            </button>

        </div>
    `;

    studyList.appendChild(studyDiv);

}


// ================================
// Escape HTML
// ================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ================================
// Format Duration
// ================================

function formatDuration(minutes) {

    const totalMinutes =
        Number(minutes);

    const hours =
        Math.floor(totalMinutes / 60);

    const remainingMinutes =
        totalMinutes % 60;


    if (
        hours > 0 &&
        remainingMinutes > 0
    ) {

        return `${hours}h ${remainingMinutes}m`;

    }


    if (hours > 0) {

        return `${hours}h`;

    }


    return `${remainingMinutes}m`;

}


// ================================
// Format Date
// ================================

function formatDate(dateString) {

    if (!dateString) {

        return "No date";

    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ================================
// Update Statistics
// ================================

function updateStudyStats(sessions) {

    const today =
        getToday();


    const todaySessionsList =
        sessions.filter(function (session) {

            return session.date === today;

        });


    let todayMinutes = 0;

    todaySessionsList.forEach(
        function (session) {

            todayMinutes +=
                Number(session.duration);

        }
    );


    let totalMinutes = 0;

    sessions.forEach(
        function (session) {

            totalMinutes +=
                Number(session.duration);

        }
    );


    const subjects =
        new Set();


    sessions.forEach(
        function (session) {

            subjects.add(
                session.subject
                    .trim()
                    .toLowerCase()
            );

        }
    );


    todayStudyTime.textContent =
        formatDuration(todayMinutes);

    todaySessions.textContent =
        todaySessionsList.length;

    totalSubjects.textContent =
        subjects.size;

    totalStudyTime.textContent =
        formatDuration(totalMinutes);

}


// ================================
// Open Add Session Modal
// ================================

openStudyModal.addEventListener(
    "click",
    function () {

        currentEditingSession = null;

        studyForm.reset();

        studyModalTitle.textContent =
            "Add Study Session";

        studyDate.value =
            getToday();

        studyModal.classList.add("active");

        studySubject.focus();

    }
);


// ================================
// Close Study Modal
// ================================

function closeStudyModalFunction() {

    studyModal.classList.remove("active");

    studyForm.reset();

    currentEditingSession = null;

}


closeStudyModal.addEventListener(
    "click",
    closeStudyModalFunction
);


cancelStudy.addEventListener(
    "click",
    closeStudyModalFunction
);


// ================================
// Close Modal Outside
// ================================

studyModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === studyModal
        ) {

            closeStudyModalFunction();

        }

    }
);


// ================================
// Add / Edit Session
// ================================

studyForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const subject =
            studySubject.value.trim();

        const duration =
            Number(studyDuration.value);

        const date =
            studyDate.value;


        if (subject === "") {

            return;

        }


        if (duration <= 0) {

            alert(
                "Duration must be greater than 0."
            );

            return;

        }


        if (date === "") {

            return;

        }


        const sessions =
            JSON.parse(
                localStorage.getItem(
                    "studySessions"
                )
            ) || [];


        // Edit Existing Session

        if (
            currentEditingSession !== null
        ) {

            sessions[
                currentEditingSession
            ] = {

                subject: subject,

                duration: duration,

                date: date

            };

        }


        // Add New Session

        else {

            sessions.push({

                subject: subject,

                duration: duration,

                date: date

            });

        }


        localStorage.setItem(
            "studySessions",
            JSON.stringify(sessions)
        );


        displayStudySessions(
            sessions
        );

        updateStudyStats(
            sessions
        );


        closeStudyModalFunction();

    }
);


// ================================
// Edit / Delete
// ================================

studyList.addEventListener(
    "click",
    function (event) {

        // Edit

        if (
            event.target.classList.contains(
                "edit-study"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            const sessions =
                JSON.parse(
                    localStorage.getItem(
                        "studySessions"
                    )
                ) || [];


            const session =
                sessions[index];


            if (!session) {

                return;

            }


            currentEditingSession =
                index;


            studySubject.value =
                session.subject;

            studyDuration.value =
                session.duration;

            studyDate.value =
                session.date;


            studyModalTitle.textContent =
                "Edit Study Session";


            studyModal.classList.add(
                "active"
            );


            studySubject.focus();

        }


        // Delete

        if (
            event.target.classList.contains(
                "delete-study"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            const confirmDelete =
                confirm(
                    "Delete this study session?"
                );


            if (!confirmDelete) {

                return;

            }


            const sessions =
                JSON.parse(
                    localStorage.getItem(
                        "studySessions"
                    )
                ) || [];


            sessions.splice(
                index,
                1
            );


            localStorage.setItem(
                "studySessions",
                JSON.stringify(sessions)
            );


            displayStudySessions(
                sessions
            );

            updateStudyStats(
                sessions
            );

        }

    }
);


// ================================
// Filters
// ================================

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                const sessions =
                    JSON.parse(
                        localStorage.getItem(
                            "studySessions"
                        )
                    ) || [];


                displayStudySessions(
                    sessions
                );

            }
        );

    }
);


// ================================
// Date & Time
// ================================

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


    document.getElementById(
        "currentDate"
    ).textContent =
        now.toLocaleDateString(
            "en-IN",
            dateOptions
        );


    document.getElementById(
        "currentTime"
    ).textContent =
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


// ================================
// Load Saved Sessions
// ================================

loadStudySessions();