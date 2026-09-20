// ================================
// Study Elements
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

const studySubject =
    document.getElementById("studySubject");

const studyDuration =
    document.getElementById("studyDuration");

const studyList =
    document.getElementById("studyList");

const totalStudyTime =
    document.getElementById("totalStudyTime");


// ================================
// Edit Study Elements
// ================================

let currentEditingSession = null;


// ================================
// Load Study Sessions
// ================================

function loadStudySessions() {

    const sessions =
        JSON.parse(
            localStorage.getItem("studySessions")
        ) || [];

    displayStudySessions(sessions);

    updateTotalStudyTime(sessions);
}


// ================================
// Display Study Sessions
// ================================

function displayStudySessions(sessions) {

    studyList.innerHTML = "";

    if (sessions.length === 0) {

        studyList.innerHTML = `
            <div>
                <span>No study sessions yet</span>
                <strong>0m</strong>
            </div>
        `;

        return;
    }


    sessions.forEach(function (session, index) {

        const studyDiv =
            document.createElement("div");

        studyDiv.classList.add("study-session");

        studyDiv.innerHTML = `
            <div class="study-session-info">

                <span>
                    ${session.subject}
                </span>

                <strong>
                    ${formatDuration(session.duration)}
                </strong>

            </div>

            <div class="study-session-actions">

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

    });
}


// ================================
// Format Duration
// ================================

function formatDuration(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;


    if (hours > 0 && remainingMinutes > 0) {

        return `${hours}h ${remainingMinutes}m`;

    }


    if (hours > 0) {

        return `${hours}h`;

    }


    return `${remainingMinutes}m`;
}


// ================================
// Update Total Study Time
// ================================

function updateTotalStudyTime(sessions) {

    let totalMinutes = 0;


    sessions.forEach(function (session) {

        totalMinutes +=
            Number(session.duration);

    });


    totalStudyTime.textContent =
        formatDuration(totalMinutes);
}


// ================================
// Open Study Modal
// ================================

openStudyModal.addEventListener(
    "click",
    function () {

        currentEditingSession = null;

        studyForm.reset();

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

        if (event.target === studyModal) {

            closeStudyModalFunction();

        }

    }
);


// ================================
// Add / Edit Study Session
// ================================

studyForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const subject =
            studySubject.value.trim();

        const duration =
            Number(studyDuration.value);


        if (subject === "") {

            return;

        }


        if (duration <= 0) {

            return;

        }


        const sessions =
            JSON.parse(
                localStorage.getItem("studySessions")
            ) || [];


        // Edit Existing Session

        if (currentEditingSession !== null) {

            sessions[currentEditingSession].subject =
                subject;

            sessions[currentEditingSession].duration =
                duration;

        }

        // Add New Session

        else {

            const newSession = {

                subject: subject,

                duration: duration,

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0]

            };

            sessions.push(newSession);

        }


        localStorage.setItem(
            "studySessions",
            JSON.stringify(sessions)
        );


        displayStudySessions(sessions);

        updateTotalStudyTime(sessions);

        closeStudyModalFunction();

    }
);


// ================================
// Edit / Delete Buttons
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


            sessions.splice(index, 1);


            localStorage.setItem(
                "studySessions",
                JSON.stringify(sessions)
            );


            displayStudySessions(sessions);

            updateTotalStudyTime(sessions);

        }

    }
);


// ================================
// Load Saved Sessions
// ================================

loadStudySessions();