// ================================
// Daily Tracker - Dashboard Study
// ================================


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

    window.location.href = "login.html";

}


// ================================
// Elements
// ================================

const studyList =
    document.getElementById("studyList");

const openStudyPage =
    document.getElementById("openStudyPage");


// ================================
// Edit Modal
// ================================

const studyModal =
    document.getElementById("studyModal");

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


// ================================
// Editing Session
// ================================

let currentEditingSession = null;


// ================================
// Today's Date
// ================================

function getStudyToday() {

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


// ================================
// Escape Text
// ================================

function escapeStudyText(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;
}


// ================================
// Format Duration
// ================================

function formatStudyDuration(minutes) {

    minutes =
        Number(minutes) || 0;

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;


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
// Load Study Sessions
// ================================

async function loadStudySessions() {

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


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => ({}));


            throw new Error(
                errorData.message ||
                "Failed to load study sessions."
            );

        }


        const data =
            await response.json();


        if (
            !data.success ||
            !Array.isArray(
                data.sessions
            )
        ) {

            throw new Error(
                "Invalid study data."
            );

        }


        displayStudySessions(
            data.sessions
        );


    } catch (error) {

        console.error(
            "Study load error:",
            error
        );

    }

}


// ================================
// Display Today's Sessions
// ================================

function displayStudySessions(
    sessions
) {

    if (!studyList) {

        return;

    }


    const today =
        getStudyToday();


    const todaySessions =
        sessions.filter(
            function (session) {

                return (
                    String(
                        session.date || ""
                    ).trim() === today
                );

            }
        );


    studyList.innerHTML = "";


    // No sessions

    if (
        todaySessions.length === 0
    ) {

        studyList.innerHTML = `
            <div>

                <span>
                    No study sessions yet
                </span>

                <strong>
                    0m
                </strong>

            </div>
        `;

        return;

    }


    // Show sessions

    todaySessions.forEach(
        function (session) {

            const studyDiv =
                document.createElement(
                    "div"
                );


            studyDiv.className =
                "study-session";


            studyDiv.innerHTML = `

                <div class="study-session-info">

                    <span>
                        ${escapeStudyText(
                            session.subject
                        )}
                    </span>

                    <strong>
                        ${formatStudyDuration(
                            session.duration
                        )}
                    </strong>

                </div>


                <div class="study-session-actions">

                    <button
                        type="button"
                        class="edit-study"
                        data-id="${session.id}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
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
    );

}


// ================================
// Add Session Button
// ================================

if (openStudyPage) {

    openStudyPage.addEventListener(
        "click",
        function () {

            window.location.href =
                "study.html";

        }
    );

}


// ================================
// Close Edit Modal
// ================================

function closeStudyModalFunction() {

    if (studyModal) {

        studyModal.classList.remove(
            "active"
        );

        studyModal.style.display =
            "none";

    }


    if (studyForm) {

        studyForm.reset();

    }


    currentEditingSession =
        null;

}


if (closeStudyModal) {

    closeStudyModal.addEventListener(
        "click",
        closeStudyModalFunction
    );

}


if (cancelStudy) {

    cancelStudy.addEventListener(
        "click",
        closeStudyModalFunction
    );

}


// ================================
// Close Modal Outside
// ================================

if (studyModal) {

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

}


// ================================
// Save Edited Session
// ================================

if (studyForm) {

    studyForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                !currentUser ||
                !currentUser.id
            ) {

                window.location.href =
                    "login.html";

                return;

            }


            if (
                currentEditingSession === null
            ) {

                return;

            }


            const subject =
                studySubject.value.trim();


            const duration =
                Number(
                    studyDuration.value
                );


            if (subject === "") {

                alert(
                    "Please enter a subject."
                );

                return;

            }


            if (
                Number.isNaN(duration) ||
                duration <= 0
            ) {

                alert(
                    "Please enter a valid duration."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${STUDY_API_URL}/study/${currentEditingSession}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        currentUser.id,

                                    subject:
                                        subject,

                                    duration:
                                        duration

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update study session."
                    );

                }


                closeStudyModalFunction();


                await loadStudySessions();


                if (
                    typeof loadDashboardData ===
                    "function"
                ) {

                    await loadDashboardData();

                }


            } catch (error) {

                console.error(
                    "Study edit error:",
                    error
                );


                alert(
                    error.message ||
                    "Something went wrong."
                );

            }

        }
    );

}


// ================================
// Edit / Delete
// ================================

if (studyList) {

    studyList.addEventListener(
        "click",
        async function (event) {


            // ================================
            // EDIT
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


                    if (
                        !response.ok ||
                        !data.success ||
                        !Array.isArray(
                            data.sessions
                        )
                    ) {

                        throw new Error(
                            data.message ||
                            "Failed to load study sessions."
                        );

                    }


                    const session =
                        data.sessions.find(
                            function (item) {

                                return (
                                    Number(
                                        item.id
                                    ) === id
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


                    studyModal.classList.add(
                        "active"
                    );


                    studyModal.style.display =
                        "flex";


                    studySubject.focus();


                } catch (error) {

                    console.error(
                        "Study edit error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Something went wrong."
                    );

                }

            }


            // ================================
            // DELETE
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


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to delete study session."
                        );

                    }


                    await loadStudySessions();


                    if (
                        typeof loadDashboardData ===
                        "function"
                    ) {

                        await loadDashboardData();

                    }


                } catch (error) {

                    console.error(
                        "Study delete error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Something went wrong."
                    );

                }

            }

        }
    );

}


// ================================
// Initial Load
// ================================

loadStudySessions();