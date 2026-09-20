// ================================
// Goal Elements
// ================================

const goalList =
    document.getElementById("goalList");

const totalGoals =
    document.getElementById("totalGoals");

const activeGoals =
    document.getElementById("activeGoals");

const completedGoals =
    document.getElementById("completedGoals");

const averageProgress =
    document.getElementById("averageProgress");


// ================================
// Add Goal Modal
// ================================

const goalModal =
    document.getElementById("goalModal");

const openGoalModal =
    document.getElementById("openGoalModal");

const closeGoalModal =
    document.getElementById("closeGoalModal");

const cancelGoal =
    document.getElementById("cancelGoal");

const goalForm =
    document.getElementById("goalForm");

const goalName =
    document.getElementById("goalName");

const goalProgress =
    document.getElementById("goalProgress");

const goalDeadline =
    document.getElementById("goalDeadline");


// ================================
// Edit Goal Modal
// ================================

const editGoalModal =
    document.getElementById("editGoalModal");

const closeEditGoalModal =
    document.getElementById("closeEditGoalModal");

const cancelEditGoal =
    document.getElementById("cancelEditGoal");

const editGoalForm =
    document.getElementById("editGoalForm");

const editGoalName =
    document.getElementById("editGoalName");

const editGoalProgress =
    document.getElementById("editGoalProgress");

const editGoalDeadline =
    document.getElementById("editGoalDeadline");

let currentEditingGoal = null;


// ================================
// Current Filter
// ================================

let currentFilter = "all";


// ================================
// Load Goals
// ================================

function loadGoals() {

    const goals =
        JSON.parse(
            localStorage.getItem("goals")
        ) || [];

    displayGoals(goals);

    updateGoalStats(goals);
}


// ================================
// Display Goals
// ================================

function displayGoals(goals) {

    goalList.innerHTML = "";

    let filteredGoals = goals;

    if (currentFilter === "active") {

        filteredGoals =
            goals.filter(function (goal) {

                return Number(goal.progress) < 100;

            });

    }

    if (currentFilter === "completed") {

        filteredGoals =
            goals.filter(function (goal) {

                return Number(goal.progress) >= 100;

            });

    }


    if (filteredGoals.length === 0) {

        goalList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🎯
                </div>

                <h3>
                    No goals found
                </h3>

                <p>
                    Add a goal to start tracking your progress.
                </p>

            </div>
        `;

        return;
    }


    filteredGoals.forEach(function (goal) {

        createGoalElement(
            goal,
            goals.indexOf(goal)
        );

    });

}


// ================================
// Create Goal Element
// ================================

function createGoalElement(goal, index) {

    const progress =
        Number(goal.progress);

    const isCompleted =
        progress >= 100;

    const goalDiv =
        document.createElement("div");

    goalDiv.classList.add("goal-item");

    goalDiv.innerHTML = `
        <div class="goal-top">

            <div class="goal-info">

                <div class="goal-name">
                    ${escapeHTML(goal.name)}
                </div>

                <div class="goal-deadline">
                    ${goal.deadline
                        ? "Deadline: " + formatDate(goal.deadline)
                        : "No deadline"
                    }
                </div>

            </div>

            <div class="goal-progress-text">
                ${progress}%
            </div>

        </div>


        <div class="goal-progress-bar">

            <div
                class="goal-progress"
                style="width: ${progress}%"
            ></div>

        </div>


        <div class="goal-footer">

            <span
                class="goal-status ${isCompleted ? "completed" : ""}"
            >
                ${isCompleted ? "Completed" : "Active"}
            </span>


            <div class="goal-actions">

                <button
                    class="edit-goal"
                    data-index="${index}"
                >
                    Edit
                </button>

                <button
                    class="delete-goal"
                    data-index="${index}"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

    goalList.appendChild(goalDiv);

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
// Format Date
// ================================

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

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
// Update Goal Statistics
// ================================

function updateGoalStats(goals) {

    const total =
        goals.length;

    const completed =
        goals.filter(function (goal) {

            return Number(goal.progress) >= 100;

        }).length;

    const active =
        total - completed;


    let progressTotal = 0;

    goals.forEach(function (goal) {

        progressTotal +=
            Number(goal.progress);

    });


    let average = 0;

    if (total > 0) {

        average =
            Math.round(
                progressTotal / total
            );

    }


    totalGoals.textContent =
        total;

    activeGoals.textContent =
        active;

    completedGoals.textContent =
        completed;

    averageProgress.textContent =
        `${average}%`;

}


// ================================
// Save Goals
// ================================

function saveGoals(goals) {

    localStorage.setItem(
        "goals",
        JSON.stringify(goals)
    );

}


// ================================
// Open Add Goal Modal
// ================================

openGoalModal.addEventListener(
    "click",
    function () {

        currentEditingGoal = null;

        goalForm.reset();

        goalProgress.value = 0;

        goalModal.classList.add("active");

        goalName.focus();

    }
);


// ================================
// Close Add Goal Modal
// ================================

function closeGoalModalFunction() {

    goalModal.classList.remove("active");

    goalForm.reset();

    currentEditingGoal = null;

}


closeGoalModal.addEventListener(
    "click",
    closeGoalModalFunction
);


cancelGoal.addEventListener(
    "click",
    closeGoalModalFunction
);


// ================================
// Close Add Modal Outside
// ================================

goalModal.addEventListener(
    "click",
    function (event) {

        if (event.target === goalModal) {

            closeGoalModalFunction();

        }

    }
);


// ================================
// Add Goal
// ================================

goalForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const name =
            goalName.value.trim();

        const progress =
            Number(goalProgress.value);

        const deadline =
            goalDeadline.value;


        if (name === "") {
            return;
        }


        if (
            progress < 0 ||
            progress > 100
        ) {

            alert(
                "Progress must be between 0 and 100."
            );

            return;

        }


        const goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];


        goals.push({

            name: name,

            progress: progress,

            deadline: deadline

        });


        saveGoals(goals);

        displayGoals(goals);

        updateGoalStats(goals);

        closeGoalModalFunction();

    }
);


// ================================
// Edit / Delete Goal
// ================================

goalList.addEventListener(
    "click",
    function (event) {

        // Edit Goal

        if (
            event.target.classList.contains(
                "edit-goal"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            const goals =
                JSON.parse(
                    localStorage.getItem("goals")
                ) || [];


            const goal =
                goals[index];


            if (!goal) {
                return;
            }


            currentEditingGoal =
                index;


            editGoalName.value =
                goal.name;

            editGoalProgress.value =
                goal.progress;

            editGoalDeadline.value =
                goal.deadline || "";


            editGoalModal.classList.add(
                "active"
            );


            editGoalName.focus();

        }


        // Delete Goal

        if (
            event.target.classList.contains(
                "delete-goal"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            const confirmDelete =
                confirm(
                    "Delete this goal?"
                );


            if (!confirmDelete) {
                return;
            }


            const goals =
                JSON.parse(
                    localStorage.getItem("goals")
                ) || [];


            goals.splice(index, 1);


            saveGoals(goals);

            displayGoals(goals);

            updateGoalStats(goals);

        }

    }
);


// ================================
// Save Edited Goal
// ================================

editGoalForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (
            currentEditingGoal === null
        ) {

            return;

        }


        const name =
            editGoalName.value.trim();

        const progress =
            Number(
                editGoalProgress.value
            );

        const deadline =
            editGoalDeadline.value;


        if (name === "") {
            return;
        }


        if (
            progress < 0 ||
            progress > 100
        ) {

            alert(
                "Progress must be between 0 and 100."
            );

            return;

        }


        const goals =
            JSON.parse(
                localStorage.getItem("goals")
            ) || [];


        goals[currentEditingGoal] = {

            name: name,

            progress: progress,

            deadline: deadline

        };


        saveGoals(goals);

        displayGoals(goals);

        updateGoalStats(goals);

        closeEditGoalModalFunction();

    }
);


// ================================
// Close Edit Modal
// ================================

function closeEditGoalModalFunction() {

    editGoalModal.classList.remove(
        "active"
    );

    editGoalForm.reset();

    currentEditingGoal = null;

}


closeEditGoalModal.addEventListener(
    "click",
    closeEditGoalModalFunction
);


cancelEditGoal.addEventListener(
    "click",
    closeEditGoalModalFunction
);


// ================================
// Close Edit Modal Outside
// ================================

editGoalModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === editGoalModal
        ) {

            closeEditGoalModalFunction();

        }

    }
);


// ================================
// Goal Filters
// ================================

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


filterButtons.forEach(function (button) {

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


            const goals =
                JSON.parse(
                    localStorage.getItem("goals")
                ) || [];


            displayGoals(goals);

        }
    );

});


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
// Load Saved Goals
// ================================

loadGoals();