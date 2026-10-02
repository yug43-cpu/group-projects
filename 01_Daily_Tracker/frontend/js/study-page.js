// ================================
// API
// ================================

const STUDY_API_URL =
    "http://localhost:5000/api";


// ================================
// Current User
// ================================

let currentUser = null;

try {

    currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );

} catch (error) {

    currentUser = null;

}


if (!currentUser || !currentUser.id) {

    window.location.href =
        "login.html";

}


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

function getStudyToday() {

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


// ================================
// Load Sessions From Backend
// ================================

async function loadStudySessions() {

    try {

        if (!currentUser || !currentUser.id) {

            window.location.href =
                "login.html";

            return;

        }


        const userId =
            encodeURIComponent(
                currentUser.id
            );


        const response =
            await fetch(
                `${STUDY_API_URL}/study?userId=${userId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load study sessions."
            );

        }


        const data =
            await response.json();


        const sessions =
            data.sessions || [];


        displayStudySessions(
            sessions
        );


        updateStudyStats(
            sessions
        );


    } catch (error) {

        console.error(
            "Study load error:",
            error
        );


        studyList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load study sessions
                </h3>

                <p>
                    Make sure the backend server is running.
                </p>

            </div>
        `;

    }

}


// ================================
// Display Sessions
// ================================

function displayStudySessions(
    sessions
) {

    studyList.innerHTML = "";

    let filteredSessions =
        sessions;


    if (
        currentFilter === "today"
    ) {

        const today =
            getStudyToday();


        filteredSessions =
            sessions.filter(
                function (session) {

                    return (
                        session.date === today
                    );

                }
            );

    }


    if (
        filteredSessions.length === 0
    ) {

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


    filteredSessions.forEach(
        function (session) {

            createStudyElement(
                session
            );

        }
    );

}


// ================================
// Create Study Element
// ================================

function createStudyElement(
    session
) {

    const studyDiv =
        document.createElement(
            "div"
        );


    studyDiv.classList.add(
        "study-item"
    );


    studyDiv.innerHTML = `
        <div class="study-top">

            <div class="study-subject">
                ${escapeHTML(
                    session.subject
                )}
            </div>

            <div class="study-duration">
                ${formatDuration(
                    session.duration
                )}
            </div>

        </div>

        <div class="study-date">
            ${formatDate(
                session.date
            )}
        </div>

        <div class="study-actions">

            <button
                class="edit-study"
                data-id="${session.id}"
            >
                Edit
            </button>

            <button
                class="delete-study"
                data-id="${session.id}"
            >
                Delete
            </button>

        </div>
    `;


    studyList.appendChild(
        studyDiv
    );

}


// ================================
// Escape HTML
// ================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;

}


// ================================
// Format Duration
// ================================

function formatDuration(minutes) {

    const totalMinutes =
        Number(minutes) || 0;


    const hours =
        Math.floor(
            totalMinutes / 60
        );


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
            dateString +
            "T00:00:00"
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

function updateStudyStats(
    sessions
) {

    const today =
        getStudyToday();


    const todaySessionsList =
        sessions.filter(
            function (session) {

                return (
                    session.date === today
                );

            }
        );


    let todayMinutes = 0;


    todaySessionsList.forEach(
        function (session) {

            todayMinutes +=
                Number(
                    session.duration
                ) || 0;

        }
    );


    let totalMinutes = 0;


    sessions.forEach(
        function (session) {

            totalMinutes +=
                Number(
                    session.duration
                ) || 0;

        }
    );


    const subjects =
        new Set();


    sessions.forEach(
        function (session) {

            if (session.subject) {

                subjects.add(
                    session.subject
                        .trim()
                        .toLowerCase()
                );

            }

        }
    );


    todayStudyTime.textContent =
        formatDuration(
            todayMinutes
        );


    todaySessions.textContent =
        todaySessionsList.length;


    totalSubjects.textContent =
        subjects.size;


    totalStudyTime.textContent =
        formatDuration(
            totalMinutes
        );

}


// ================================
// Open Add Session Modal
// ================================

openStudyModal.addEventListener(
    "click",
    function () {

        currentEditingSession =
            null;


        studyForm.reset();


        studyModalTitle.textContent =
            "Add Study Session";


        studyDate.value =
            getStudyToday();


        studyModal.classList.add(
            "active"
        );


        studySubject.focus();

    }
);


// ================================
// Close Study Modal
// ================================

function closeStudyModalFunction() {

    studyModal.classList.remove(
        "active"
    );


    studyForm.reset();


    currentEditingSession =
        null;

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
    async function (event) {

        event.preventDefault();


        const subject =
            studySubject.value.trim();


        const duration =
            Number(
                studyDuration.value
            );


        const date =
            studyDate.value;


        if (subject === "") {

            alert(
                "Please enter a subject."
            );

            return;

        }


        if (duration <= 0) {

            alert(
                "Duration must be greater than 0."
            );

            return;

        }


        if (date === "") {

            alert(
                "Please select a date."
            );

            return;

        }


        if (!currentUser || !currentUser.id) {

            window.location.href =
                "login.html";

            return;

        }


        const studyData = {

            userId:
                currentUser.id,

            subject:
                subject,

            duration:
                duration,

            date:
                date

        };


        try {

            let response;


            if (
                currentEditingSession !== null
            ) {

                response =
                    await fetch(
                        `${STUDY_API_URL}/study/${currentEditingSession}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    studyData
                                )

                        }
                    );

            } else {

                response =
                    await fetch(
                        `${STUDY_API_URL}/study`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    studyData
                                )

                        }
                    );

            }


            const responseData =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    responseData.message ||
                    "Failed to save study session."
                );

            }


            closeStudyModalFunction();


            await loadStudySessions();


        } catch (error) {

            console.error(
                "Study save error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// ================================
// Edit / Delete
// ================================

studyList.addEventListener(
    "click",
    async function (event) {

        // ================================
        // Edit
        // ================================

        if (
            event.target.classList.contains(
                "edit-study"
            )
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );


            try {

                if (
                    !currentUser ||
                    !currentUser.id
                ) {

                    window.location.href =
                        "login.html";

                    return;

                }


                const userId =
                    encodeURIComponent(
                        currentUser.id
                    );


                const response =
                    await fetch(
                        `${STUDY_API_URL}/study?userId=${userId}`
                    );


                const data =
                    await response.json();


                const sessions =
                    data.sessions || [];


                const session =
                    sessions.find(
                        function (item) {

                            return (
                                item.id === id
                            );

                        }
                    );


                if (!session) {

                    alert(
                        "Study session not found."
                    );

                    return;

                }


                currentEditingSession =
                    session.id;


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


            } catch (error) {

                console.error(
                    "Study edit error:",
                    error
                );


                alert(
                    "Unable to open study session."
                );

            }

        }


        // ================================
        // Delete
        // ================================

        if (
            event.target.classList.contains(
                "delete-study"
            )
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );


            const confirmDelete =
                confirm(
                    "Delete this study session?"
                );


            if (!confirmDelete) {

                return;

            }


            try {

                if (
                    !currentUser ||
                    !currentUser.id
                ) {

                    window.location.href =
                        "login.html";

                    return;

                }


                const response =
                    await fetch(
                        `${STUDY_API_URL}/study/${id}`,
                        {
                            method: "DELETE",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        currentUser.id

                                })

                        }
                    );


                const errorData =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        errorData.message ||
                        "Failed to delete study session."
                    );

                }


                await loadStudySessions();


            } catch (error) {

                console.error(
                    "Study delete error:",
                    error
                );


                alert(
                    error.message
                );

            }

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


                loadStudySessions();

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


    const currentDate =
        document.getElementById(
            "currentDate"
        );


    const currentTime =
        document.getElementById(
            "currentTime"
        );


    if (currentDate) {

        currentDate.textContent =
            now.toLocaleDateString(
                "en-IN",
                dateOptions
            );

    }


    if (currentTime) {

        currentTime.textContent =
            now.toLocaleTimeString(
                "en-IN",
                timeOptions
            );

    }

}


updateDateTime();


setInterval(
    updateDateTime,
    1000
);


// ================================
// Initial Load
// ================================

loadStudySessions();