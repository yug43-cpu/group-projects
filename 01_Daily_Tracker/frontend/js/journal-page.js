const journalList = document.getElementById("journalList");

const journalModal = document.getElementById("journalModal");
const openJournalModal = document.getElementById("openJournalModal");
const closeJournalModal = document.getElementById("closeJournalModal");
const cancelJournal = document.getElementById("cancelJournal");

const journalForm = document.getElementById("journalForm");

const journalTitle = document.getElementById("journalTitle");
const journalDate = document.getElementById("journalDate");
const journalMood = document.getElementById("journalMood");
const journalContent = document.getElementById("journalContent");

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

let journals =
    JSON.parse(localStorage.getItem("journals")) || [];

let currentFilter = "all";
let editingId = null;


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
        now.toLocaleDateString("en-IN", dateOptions);

    document.getElementById("currentTime").textContent =
        now.toLocaleTimeString("en-IN", timeOptions);
}

updateDateTime();

setInterval(updateDateTime, 1000);


/* ================================
   Today Date
================================ */

function getToday() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* ================================
   Escape HTML
================================ */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================================
   Save Journals
================================ */

function saveJournals() {

    localStorage.setItem(
        "journals",
        JSON.stringify(journals)
    );
}


/* ================================
   Format Date
================================ */

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ================================
   Render Journals
================================ */

function renderJournals() {

    const searchText =
        searchJournal.value
            .trim()
            .toLowerCase();

    let filteredJournals =
        [...journals];

    if (currentFilter === "today") {

        filteredJournals =
            filteredJournals.filter(
                journal =>
                    journal.date === getToday()
            );
    }

    if (searchText !== "") {

        filteredJournals =
            filteredJournals.filter(journal =>
                journal.title.toLowerCase().includes(searchText) ||
                journal.content.toLowerCase().includes(searchText) ||
                journal.mood.toLowerCase().includes(searchText)
            );
    }

    filteredJournals.sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    if (filteredJournals.length === 0) {

        journalList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📝
                </div>

                <h3>No journal entries found</h3>

                <p>
                    Create a new journal entry to start writing.
                </p>

            </div>
        `;

        return;
    }

    journalList.innerHTML =
        filteredJournals.map(journal => `

            <div class="journal-entry">

                <div class="journal-entry-header">

                    <div>

                        <div class="journal-entry-title">
                            ${escapeHTML(journal.title)}
                        </div>

                        <div class="journal-entry-meta">
                            ${formatDate(journal.date)}
                        </div>

                    </div>

                    <div class="journal-mood">
                        ${escapeHTML(journal.mood)}
                    </div>

                </div>

                <div class="journal-entry-content">
                    ${escapeHTML(journal.content)}
                </div>

                <div class="journal-entry-actions">

                    <button
                        onclick="editJournal('${journal.id}')"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteJournal('${journal.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `).join("");
}


/* ================================
   Update Statistics
================================ */

function updateStatistics() {

    totalEntries.textContent =
        journals.length;

    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();

    const monthCount =
        journals.filter(journal => {

            const date =
                new Date(journal.date + "T00:00:00");

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        }).length;

    monthlyEntries.textContent =
        monthCount;

    if (journals.length === 0) {

        latestEntry.textContent =
            "None";

        return;
    }

    const sorted =
        [...journals].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

    latestEntry.textContent =
        formatDate(sorted[0].date);
}


/* ================================
   Open Modal
================================ */

openJournalModal.addEventListener(
    "click",
    function () {

        editingId = null;

        journalModalTitle.textContent =
            "New Journal Entry";

        journalForm.reset();

        journalDate.value =
            getToday();

        journalModal.classList.add("show");
    }
);


/* ================================
   Close Modal
================================ */

function closeModal() {

    journalModal.classList.remove("show");

    journalForm.reset();

    editingId = null;
}

closeJournalModal.addEventListener(
    "click",
    closeModal
);

cancelJournal.addEventListener(
    "click",
    closeModal
);


/* ================================
   Save Journal
================================ */

journalForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const title =
            journalTitle.value.trim();

        const date =
            journalDate.value;

        const mood =
            journalMood.value;

        const content =
            journalContent.value.trim();

        if (
            title === "" ||
            date === "" ||
            content === ""
        ) {
            alert("Please fill all required fields!");
            return;
        }


        if (editingId) {

            const journal =
                journals.find(
                    item =>
                        item.id === editingId
                );

            if (journal) {

                journal.title = title;
                journal.date = date;
                journal.mood = mood;
                journal.content = content;
            }

        } else {

            const newJournal = {

                id:
                    Date.now().toString(),

                title:
                    title,

                date:
                    date,

                mood:
                    mood,

                content:
                    content
            };

            journals.push(newJournal);
        }


        saveJournals();

        renderJournals();

        updateStatistics();

        closeModal();

    }
);


/* ================================
   Edit Journal
================================ */

function editJournal(id) {

    const journal =
        journals.find(
            item =>
                item.id === id
        );

    if (!journal) {
        return;
    }

    editingId = id;

    journalModalTitle.textContent =
        "Edit Journal Entry";

    journalTitle.value =
        journal.title;

    journalDate.value =
        journal.date;

    journalMood.value =
        journal.mood;

    journalContent.value =
        journal.content;

    journalModal.classList.add("show");
}


/* ================================
   Delete Journal
================================ */

function deleteJournal(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this journal entry?"
        );

    if (!confirmDelete) {
        return;
    }

    journals =
        journals.filter(
            journal =>
                journal.id !== id
        );

    saveJournals();

    renderJournals();

    updateStatistics();
}


/* ================================
   Search
================================ */

searchJournal.addEventListener(
    "input",
    renderJournals
);


/* ================================
   Filters
================================ */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove("active")
                );

                this.classList.add("active");

                currentFilter =
                    this.dataset.filter;

                renderJournals();
            }
        );

    }
);


/* ================================
   Initial Load
================================ */

renderJournals();

updateStatistics();