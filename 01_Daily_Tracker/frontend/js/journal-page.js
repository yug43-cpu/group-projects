// ================================
// Backend API
// ================================

const API_URL = "http://localhost:5000/api";


// ================================
// Current User
// ================================

let currentUser = null;

const currentUserData =
    localStorage.getItem("currentUser");

if (!currentUserData) {

    window.location.href = "login.html";

} else {

    try {

        currentUser =
            JSON.parse(currentUserData);

    } catch (error) {

        console.error(
            "Invalid current user data:",
            error
        );

        localStorage.removeItem("currentUser");

        window.location.href = "login.html";

    }

}

if (!currentUser || !currentUser.id) {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";

}


// ================================
// Journal Elements
// ================================

const journalList =
    document.getElementById("journalList");

const journalModal =
    document.getElementById("journalModal");

const openJournalModal =
    document.getElementById("openJournalModal");

const closeJournalModal =
    document.getElementById("closeJournalModal");

const cancelJournal =
    document.getElementById("cancelJournal");

const journalForm =
    document.getElementById("journalForm");

const journalTitle =
    document.getElementById("journalTitle");

const journalDate =
    document.getElementById("journalDate");

const journalMood =
    document.getElementById("journalMood");

const journalContent =
    document.getElementById("journalContent");

const journalModalTitle =
    document.getElementById("journalModalTitle");

const searchJournal =
    document.getElementById("searchJournal");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const totalEntries =
    document.getElementById("totalEntries");

const monthlyEntries =
    document.getElementById("monthlyEntries");

const latestEntry =
    document.getElementById("latestEntry");


// ================================
// State
// ================================

let journals = [];

let currentFilter = "all";

let editingId = null;


// ================================
// Date & Time
// ================================

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
        document.getElementById("currentDate");

    const currentTime =
        document.getElementById("currentTime");

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
// Get Today's Date
// ================================

function getToday() {

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
// Escape HTML
// ================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

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

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid date";

    }

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
// Load Journals From Backend
// ================================

async function loadJournals() {

    if (!currentUser || !currentUser.id) {

        window.location.href = "login.html";

        return;

    }

    try {

        const response =
            await fetch(
                `${API_URL}/journals?userId=${encodeURIComponent(currentUser.id)}`
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to load journal entries."
            );

        }

        journals =
            Array.isArray(data.journals)
                ? data.journals
                : [];

        renderJournals();

        updateStatistics();

    } catch (error) {

        console.error(
            "Journal loading error:",
            error
        );

        journalList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load journal entries
                </h3>

                <p>
                    Please make sure the backend server is running.
                </p>

            </div>

        `;

    }

}


// ================================
// Render Journals
// ================================

function renderJournals() {

    const searchText =
        searchJournal.value
            .trim()
            .toLowerCase();

    let filteredJournals =
        [...journals];


    // ================================
    // Today Filter
    // ================================

    if (
        currentFilter === "today"
    ) {

        filteredJournals =
            filteredJournals.filter(
                function (journal) {

                    return (
                        journal.date ===
                        getToday()
                    );

                }
            );

    }


    // ================================
    // Search
    // ================================

    if (
        searchText !== ""
    ) {

        filteredJournals =
            filteredJournals.filter(
                function (journal) {

                    const title =
                        String(
                            journal.title || ""
                        ).toLowerCase();

                    const content =
                        String(
                            journal.content || ""
                        ).toLowerCase();

                    const mood =
                        String(
                            journal.mood || ""
                        ).toLowerCase();

                    return (
                        title.includes(searchText) ||
                        content.includes(searchText) ||
                        mood.includes(searchText)
                    );

                }
            );

    }


    // ================================
    // Sort Newest First
    // ================================

    filteredJournals.sort(
        function (a, b) {

            return (
                new Date(
                    b.date + "T00:00:00"
                ) -
                new Date(
                    a.date + "T00:00:00"
                )
            );

        }
    );


    // ================================
    // Empty State
    // ================================

    if (
        filteredJournals.length === 0
    ) {

        journalList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No journal entries found
                </h3>

                <p>
                    Create a new journal entry to start writing.
                </p>

            </div>

        `;

        return;

    }


    // ================================
    // Create Journal Elements
    // ================================

    journalList.innerHTML =
        filteredJournals.map(
            function (journal) {

                return `

                    <div
                        class="journal-entry"
                        data-id="${journal.id}"
                    >

                        <div class="journal-entry-header">

                            <div>

                                <div class="journal-entry-title">

                                    ${escapeHTML(
                                        journal.title
                                    )}

                                </div>

                                <div class="journal-entry-meta">

                                    ${formatDate(
                                        journal.date
                                    )}

                                </div>

                            </div>

                            <div class="journal-mood">

                                ${escapeHTML(
                                    journal.mood || ""
                                )}

                            </div>

                        </div>


                        <div class="journal-entry-content">

                            ${escapeHTML(
                                journal.content
                            )}

                        </div>


                        <div class="journal-entry-actions">

                            <button
                                class="edit-journal"
                                data-id="${journal.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-journal"
                                data-id="${journal.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ================================
// Update Statistics
// ================================

function updateStatistics() {

    const total =
        journals.length;

    totalEntries.textContent =
        total;

    const now =
        new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    const monthCount =
        journals.filter(
            function (journal) {

                const date =
                    new Date(
                        journal.date +
                        "T00:00:00"
                    );

                return (
                    date.getMonth() ===
                    currentMonth &&

                    date.getFullYear() ===
                    currentYear
                );

            }
        ).length;

    monthlyEntries.textContent =
        monthCount;

    if (total === 0) {

        latestEntry.textContent =
            "None";

        return;

    }

    const sorted =
        [...journals].sort(
            function (a, b) {

                return (
                    new Date(
                        b.date +
                        "T00:00:00"
                    ) -
                    new Date(
                        a.date +
                        "T00:00:00"
                    )
                );

            }
        );

    latestEntry.textContent =
        formatDate(
            sorted[0].date
        );

}


// ================================
// Open Add Journal Modal
// ================================

openJournalModal.addEventListener(
    "click",
    function () {

        editingId = null;

        journalForm.reset();

        journalModalTitle.textContent =
            "New Journal Entry";

        journalDate.value =
            getToday();

        journalModal.classList.add(
            "show"
        );

        journalTitle.focus();

    }
);


// ================================
// Close Journal Modal
// ================================

function closeJournalModalFunction() {

    journalModal.classList.remove(
        "show"
    );

    journalForm.reset();

    editingId = null;

}


closeJournalModal.addEventListener(
    "click",
    closeJournalModalFunction
);


cancelJournal.addEventListener(
    "click",
    closeJournalModalFunction
);


// ================================
// Close Modal Outside
// ================================

journalModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === journalModal
        ) {

            closeJournalModalFunction();

        }

    }
);


// ================================
// Add / Edit Journal
// ================================

journalForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const title =
            journalTitle.value.trim();

        const date =
            journalDate.value;

        const mood =
            journalMood.value;

        const content =
            journalContent.value.trim();


        // ================================
        // Validation
        // ================================

        if (
            title === "" ||
            date === "" ||
            content === ""
        ) {

            alert(
                "Please fill all required fields!"
            );

            return;

        }


        if (!currentUser || !currentUser.id) {

            window.location.href = "login.html";

            return;

        }


        try {

            let response;


            // ================================
            // Edit Existing Journal
            // ================================

            if (
                editingId !== null
            ) {

                response =
                    await fetch(
                        `${API_URL}/journals/${editingId}`,
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

                                    title:
                                        title,

                                    date:
                                        date,

                                    mood:
                                        mood,

                                    content:
                                        content

                                })

                        }
                    );

            }


            // ================================
            // Add New Journal
            // ================================

            else {

                response =
                    await fetch(
                        `${API_URL}/journals`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        currentUser.id,

                                    title:
                                        title,

                                    date:
                                        date,

                                    mood:
                                        mood,

                                    content:
                                        content

                                })

                        }
                    );

            }


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Journal operation failed."
                );

            }


            closeJournalModalFunction();

            await loadJournals();


        } catch (error) {

            console.error(
                "Journal save error:",
                error
            );

            alert(
                error.message ||
                "Could not save journal entry."
            );

        }

    }
);


// ================================
// Edit / Delete Journal
// ================================

journalList.addEventListener(
    "click",
    async function (event) {


        // ================================
        // Edit
        // ================================

        if (
            event.target.classList.contains(
                "edit-journal"
            )
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );

            const journal =
                journals.find(
                    function (item) {

                        return (
                            Number(item.id) ===
                            id
                        );

                    }
                );

            if (!journal) {

                return;

            }

            editingId =
                id;

            journalModalTitle.textContent =
                "Edit Journal Entry";

            journalTitle.value =
                journal.title || "";

            journalDate.value =
                journal.date || "";

            journalMood.value =
                journal.mood || "";

            journalContent.value =
                journal.content || "";

            journalModal.classList.add(
                "show"
            );

            journalTitle.focus();

        }


        // ================================
        // Delete
        // ================================

        if (
            event.target.classList.contains(
                "delete-journal"
            )
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );

            const confirmDelete =
                confirm(
                    "Are you sure you want to delete this journal entry?"
                );

            if (!confirmDelete) {

                return;

            }


            if (!currentUser || !currentUser.id) {

                window.location.href = "login.html";

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/journals/${id}`,
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


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to delete journal entry."
                    );

                }


                await loadJournals();


            } catch (error) {

                console.error(
                    "Journal delete error:",
                    error
                );

                alert(
                    error.message ||
                    "Could not delete journal entry."
                );

            }

        }

    }
);


// ================================
// Search
// ================================

searchJournal.addEventListener(
    "input",
    function () {

        renderJournals();

    }
);


// ================================
// Filters
// ================================

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

                renderJournals();

            }
        );

    }
);


// ================================
// Initial Load
// ================================

loadJournals();