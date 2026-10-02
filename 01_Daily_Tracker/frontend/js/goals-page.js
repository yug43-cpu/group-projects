(function () {

    if (window.dailyTrackerGoalsLoaded) {
        return;
    }

    window.dailyTrackerGoalsLoaded = true;

    const API_URL = "http://localhost:5000/api";

    let goals = [];
    let currentEditingGoal = null;
    let currentFilter = "all";


    // ==================================================
    // CURRENT USER
    // ==================================================

    const currentUserRaw =
        localStorage.getItem("currentUser");

    if (!currentUserRaw) {
        window.location.href = "login.html";
        return;
    }

    let currentUser;

    try {

        currentUser = JSON.parse(currentUserRaw);

    } catch (error) {

        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
        return;

    }

    if (!currentUser || !currentUser.id) {

        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
        return;

    }

    const currentUserId = Number(currentUser.id);


    // ==================================================
    // ELEMENTS
    // ==================================================

    const goalList =
        document.getElementById("goalList");

    const openGoalModal =
        document.getElementById("openGoalModal");

    const goalModal =
        document.getElementById("goalModal");

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


    const filterButtons =
        document.querySelectorAll(".filter-btn");


    // ==================================================
    // ESCAPE HTML
    // ==================================================

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;

    }


    // ==================================================
    // FORMAT DATE
    // ==================================================

    function formatDate(dateString) {

        if (!dateString) {
            return "-";
        }

        const date =
            new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // ==================================================
    // GET GOALS
    // ==================================================

    async function getGoals() {

        try {

            const response =
                await fetch(
                    `${API_URL}/goals?userId=${encodeURIComponent(currentUserId)}`
                );

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load goals."
                );

            }


            if (Array.isArray(data)) {

                goals = data;

            } else if (
                data &&
                Array.isArray(data.goals)
            ) {

                goals = data.goals;

            } else {

                goals = [];

            }


            displayGoals();

        } catch (error) {

            console.error(
                "Error loading goals:",
                error
            );

        }

    }


    // ==================================================
    // DISPLAY GOALS
    // ==================================================

    function displayGoals() {

        if (!goalList) {
            return;
        }


        let filteredGoals =
            [...goals];


        // Filter
        if (currentFilter === "active") {

            filteredGoals =
                filteredGoals.filter(
                    goal =>
                        Number(goal.progress) < 100
                );

        } else if (currentFilter === "completed") {

            filteredGoals =
                filteredGoals.filter(
                    goal =>
                        Number(goal.progress) >= 100
                );

        }


        // Empty state
        if (filteredGoals.length === 0) {

            goalList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🎯
                    </div>

                    <h3>
                        No goals yet
                    </h3>

                    <p>
                        Create your first goal to get started.
                    </p>

                </div>
            `;

            updateGoalStats();

            return;

        }


        // Goal list
        goalList.innerHTML =
            filteredGoals.map(
                function (goal) {

                    const progress =
                        Math.min(
                            100,
                            Math.max(
                                0,
                                Number(goal.progress) || 0
                            )
                        );


                    const status =
                        progress >= 100
                            ? "Completed"
                            : "Active";


                    return `
                        <div
                            class="goal-item"
                            data-id="${goal.id}"
                        >

                            <div class="goal-top">

                                <div class="goal-info">

                                    <div class="goal-name">
                                        ${escapeHTML(goal.name)}
                                    </div>

                                    <div class="goal-deadline">
                                        Deadline:
                                        ${formatDate(goal.deadline)}
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
                                    class="goal-status ${progress >= 100 ? "completed" : ""}"
                                >
                                    ${status}
                                </span>


                                <div class="goal-actions">

                                    <button
                                        type="button"
                                        class="edit-goal"
                                        data-id="${goal.id}"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-goal"
                                        data-id="${goal.id}"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;

                }
            ).join("");


        updateGoalStats();

    }


    // ==================================================
    // UPDATE STATISTICS
    // ==================================================

    function updateGoalStats() {

        const total =
            goals.length;


        const active =
            goals.filter(
                goal =>
                    Number(goal.progress) < 100
            ).length;


        const completed =
            goals.filter(
                goal =>
                    Number(goal.progress) >= 100
            ).length;


        let average = 0;


        if (goals.length > 0) {

            const totalProgress =
                goals.reduce(
                    function (sum, goal) {

                        return sum +
                            Math.min(
                                100,
                                Math.max(
                                    0,
                                    Number(goal.progress) || 0
                                )
                            );

                    },
                    0
                );


            average =
                Math.round(
                    totalProgress / goals.length
                );

        }


        const totalGoals =
            document.getElementById("totalGoals");

        const activeGoals =
            document.getElementById("activeGoals");

        const completedGoals =
            document.getElementById("completedGoals");

        const averageProgress =
            document.getElementById("averageProgress");


        if (totalGoals) {
            totalGoals.textContent = total;
        }

        if (activeGoals) {
            activeGoals.textContent = active;
        }

        if (completedGoals) {
            completedGoals.textContent = completed;
        }

        if (averageProgress) {
            averageProgress.textContent =
                `${average}%`;
        }

    }


    // ==================================================
    // OPEN ADD GOAL MODAL
    // ==================================================

    if (openGoalModal) {

        openGoalModal.addEventListener(
            "click",
            function () {

                if (goalForm) {
                    goalForm.reset();
                }

                if (goalProgress) {
                    goalProgress.value = 0;
                }

                if (goalModal) {

                    goalModal.classList.add(
                        "active"
                    );

                }

            }
        );

    }


    // ==================================================
    // CLOSE ADD GOAL MODAL
    // ==================================================

    function closeAddGoalModal() {

        if (goalModal) {

            goalModal.classList.remove(
                "active"
            );

        }

    }


    if (closeGoalModal) {

        closeGoalModal.addEventListener(
            "click",
            closeAddGoalModal
        );

    }


    if (cancelGoal) {

        cancelGoal.addEventListener(
            "click",
            closeAddGoalModal
        );

    }


    // ==================================================
    // ADD GOAL
    // ==================================================

    if (goalForm) {

        goalForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    goalName
                        ? goalName.value.trim()
                        : "";


                const progress =
                    goalProgress
                        ? Number(goalProgress.value)
                        : 0;


                const deadline =
                    goalDeadline
                        ? goalDeadline.value
                        : "";


                if (!name) {

                    alert(
                        "Please enter a goal name."
                    );

                    return;

                }


                const safeProgress =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            Number.isFinite(progress)
                                ? progress
                                : 0
                        )
                    );


                try {

                    const response =
                        await fetch(
                            `${API_URL}/goals`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    userId:
                                        currentUserId,

                                    name:
                                        name,

                                    progress:
                                        safeProgress,

                                    deadline:
                                        deadline

                                })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to create goal."
                        );

                    }


                    closeAddGoalModal();

                    await getGoals();


                } catch (error) {

                    console.error(
                        "Error creating goal:",
                        error
                    );

                    alert(
                        error.message ||
                        "Failed to create goal."
                    );

                }

            }
        );

    }


    // ==================================================
    // OPEN EDIT GOAL
    // ==================================================

    function openEditGoal(id) {

        const goal =
            goals.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!goal) {
            return;
        }


        currentEditingGoal =
            Number(id);


        if (editGoalName) {

            editGoalName.value =
                goal.name || "";

        }


        if (editGoalProgress) {

            editGoalProgress.value =
                Number(goal.progress) || 0;

        }


        if (editGoalDeadline) {

            editGoalDeadline.value =
                goal.deadline || "";

        }


        if (editGoalModal) {

            editGoalModal.classList.add(
                "active"
            );

        }

    }


    // ==================================================
    // CLOSE EDIT MODAL
    // ==================================================

    function closeEditModal() {

        currentEditingGoal =
            null;


        if (editGoalModal) {

            editGoalModal.classList.remove(
                "active"
            );

        }

    }


    if (closeEditGoalModal) {

        closeEditGoalModal.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (cancelEditGoal) {

        cancelEditGoal.addEventListener(
            "click",
            closeEditModal
        );

    }


    // ==================================================
    // UPDATE GOAL
    // ==================================================

    if (editGoalForm) {

        editGoalForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!currentEditingGoal) {
                    return;
                }


                const name =
                    editGoalName
                        ? editGoalName.value.trim()
                        : "";


                const progress =
                    editGoalProgress
                        ? Number(editGoalProgress.value)
                        : 0;


                const deadline =
                    editGoalDeadline
                        ? editGoalDeadline.value
                        : "";


                if (!name) {

                    alert(
                        "Please enter a goal name."
                    );

                    return;

                }


                const safeProgress =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            Number.isFinite(progress)
                                ? progress
                                : 0
                        )
                    );


                try {

                    const response =
                        await fetch(
                            `${API_URL}/goals/${currentEditingGoal}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    userId:
                                        currentUserId,

                                    name:
                                        name,

                                    progress:
                                        safeProgress,

                                    deadline:
                                        deadline

                                })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to update goal."
                        );

                    }


                    closeEditModal();

                    await getGoals();


                } catch (error) {

                    console.error(
                        "Error updating goal:",
                        error
                    );

                    alert(
                        error.message ||
                        "Failed to update goal."
                    );

                }

            }
        );

    }


    // ==================================================
    // DELETE GOAL
    // ==================================================

    async function deleteGoal(id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this goal?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/goals/${id}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            userId:
                                currentUserId

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete goal."
                );

            }


            await getGoals();


        } catch (error) {

            console.error(
                "Error deleting goal:",
                error
            );

            alert(
                error.message ||
                "Failed to delete goal."
            );

        }

    }


    // ==================================================
    // GOAL ACTIONS
    // ==================================================

    if (goalList) {

        goalList.addEventListener(
            "click",
            function (event) {

                const editButton =
                    event.target.closest(
                        ".edit-goal"
                    );


                const deleteButton =
                    event.target.closest(
                        ".delete-goal"
                    );


                if (editButton) {

                    openEditGoal(
                        editButton.dataset.id
                    );

                    return;

                }


                if (deleteButton) {

                    deleteGoal(
                        deleteButton.dataset.id
                    );

                }

            }
        );

    }


    // ==================================================
    // FILTERS
    // ==================================================

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
                        button.dataset.filter ||
                        "all";


                    displayGoals();

                }
            );

        }
    );


    // ==================================================
    // CLOSE MODAL BY OUTSIDE CLICK
    // ==================================================

    if (goalModal) {

        goalModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    goalModal
                ) {

                    closeAddGoalModal();

                }

            }
        );

    }


    if (editGoalModal) {

        editGoalModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    editGoalModal
                ) {

                    closeEditModal();

                }

            }
        );

    }


    // ==================================================
    // ESCAPE KEY
    // ==================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }

            closeAddGoalModal();
            closeEditModal();

        }
    );


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    getGoals();

})();