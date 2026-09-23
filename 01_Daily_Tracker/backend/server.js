const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


// ================================
// In-Memory Data
// ================================

let tasks = [];
let studySessions = [];
let goals = [];


// ================================
// Basic APIs
// ================================

app.get("/", (req, res) => {

    res.send(
        "Daily Tracker Backend is running!"
    );

});


app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "API is working!"
    });

});


// ================================
// TASK APIs
// ================================

// Add Task
app.post("/api/tasks", (req, res) => {

    const {
        name,
        priority,
        dueTime,
        date
    } = req.body;


    if (!name) {

        return res.status(400).json({
            success: false,
            message: "Task name is required."
        });

    }


    const newTask = {

        id: Date.now(),

        name,

        priority:
            priority || "Medium",

        dueTime:
            dueTime || "",

        date:
            date || "",

        completed: false

    };


    tasks.push(newTask);


    res.status(201).json({

        success: true,

        message:
            "Task added successfully!",

        task: newTask

    });

});


// Get Tasks
app.get("/api/tasks", (req, res) => {

    res.json({

        success: true,

        tasks: tasks

    });

});


// Update Task
app.put("/api/tasks/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {

        return res.status(404).json({

            success: false,

            message: "Task not found."

        });

    }


    const {
        name,
        priority,
        dueTime,
        date,
        completed
    } = req.body;


    if (name !== undefined) {

        task.name = name;

    }


    if (priority !== undefined) {

        task.priority = priority;

    }


    if (dueTime !== undefined) {

        task.dueTime = dueTime;

    }


    if (date !== undefined) {

        task.date = date;

    }


    if (completed !== undefined) {

        task.completed = completed;

    }


    res.json({

        success: true,

        message:
            "Task updated successfully!",

        task: task

    });

});


// Delete Task
app.delete("/api/tasks/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const taskIndex =
        tasks.findIndex(
            task => task.id === id
        );


    if (taskIndex === -1) {

        return res.status(404).json({

            success: false,

            message: "Task not found."

        });

    }


    const deletedTask =
        tasks.splice(
            taskIndex,
            1
        )[0];


    res.json({

        success: true,

        message:
            "Task deleted successfully!",

        task: deletedTask

    });

});


// ================================
// STUDY APIs
// ================================

// Add Study Session
app.post("/api/study", (req, res) => {

    const {
        subject,
        duration,
        date
    } = req.body;


    if (!subject) {

        return res.status(400).json({

            success: false,

            message:
                "Subject is required."

        });

    }


    if (
        duration === undefined ||
        Number(duration) <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Duration must be greater than 0."

        });

    }


    if (!date) {

        return res.status(400).json({

            success: false,

            message:
                "Date is required."

        });

    }


    const newSession = {

        id: Date.now(),

        subject:
            subject.trim(),

        duration:
            Number(duration),

        date: date

    };


    studySessions.push(
        newSession
    );


    res.status(201).json({

        success: true,

        message:
            "Study session added successfully!",

        session: newSession

    });

});


// Get Study Sessions
app.get("/api/study", (req, res) => {

    res.json({

        success: true,

        sessions:
            studySessions

    });

});


// Update Study Session
app.put("/api/study/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const session =
        studySessions.find(
            session =>
                session.id === id
        );


    if (!session) {

        return res.status(404).json({

            success: false,

            message:
                "Study session not found."

        });

    }


    const {
        subject,
        duration,
        date
    } = req.body;


    if (subject !== undefined) {

        if (
            subject.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Subject is required."

            });

        }


        session.subject =
            subject.trim();

    }


    if (duration !== undefined) {

        if (
            Number(duration) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Duration must be greater than 0."

            });

        }


        session.duration =
            Number(duration);

    }


    if (date !== undefined) {

        if (!date) {

            return res.status(400).json({

                success: false,

                message:
                    "Date is required."

            });

        }


        session.date =
            date;

    }


    res.json({

        success: true,

        message:
            "Study session updated successfully!",

        session: session

    });

});


// Delete Study Session
app.delete("/api/study/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const sessionIndex =
        studySessions.findIndex(
            session =>
                session.id === id
        );


    if (sessionIndex === -1) {

        return res.status(404).json({

            success: false,

            message:
                "Study session not found."

        });

    }


    const deletedSession =
        studySessions.splice(
            sessionIndex,
            1
        )[0];


    res.json({

        success: true,

        message:
            "Study session deleted successfully!",

        session:
            deletedSession

    });

});


// ================================
// GOAL APIs
// ================================

// Add Goal
app.post("/api/goals", (req, res) => {

    const {
        name,
        progress,
        deadline
    } = req.body;


    if (!name || name.trim() === "") {

        return res.status(400).json({

            success: false,

            message:
                "Goal name is required."

        });

    }


    const goalProgress =
        progress === undefined
            ? 0
            : Number(progress);


    if (
        Number.isNaN(goalProgress) ||
        goalProgress < 0 ||
        goalProgress > 100
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Progress must be between 0 and 100."

        });

    }


    const newGoal = {

        id: Date.now(),

        name:
            name.trim(),

        progress:
            goalProgress,

        deadline:
            deadline || ""

    };


    goals.push(newGoal);


    res.status(201).json({

        success: true,

        message:
            "Goal added successfully!",

        goal:
            newGoal

    });

});


// Get Goals
app.get("/api/goals", (req, res) => {

    res.json({

        success: true,

        goals:
            goals

    });

});


// Update Goal
app.put("/api/goals/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const goal =
        goals.find(
            goal =>
                goal.id === id
        );


    if (!goal) {

        return res.status(404).json({

            success: false,

            message:
                "Goal not found."

        });

    }


    const {
        name,
        progress,
        deadline
    } = req.body;


    if (name !== undefined) {

        if (
            name.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Goal name is required."

            });

        }


        goal.name =
            name.trim();

    }


    if (progress !== undefined) {

        const newProgress =
            Number(progress);


        if (
            Number.isNaN(newProgress) ||
            newProgress < 0 ||
            newProgress > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Progress must be between 0 and 100."

            });

        }


        goal.progress =
            newProgress;

    }


    if (deadline !== undefined) {

        goal.deadline =
            deadline;

    }


    res.json({

        success: true,

        message:
            "Goal updated successfully!",

        goal:
            goal

    });

});


// Delete Goal
app.delete("/api/goals/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const goalIndex =
        goals.findIndex(
            goal =>
                goal.id === id
        );


    if (goalIndex === -1) {

        return res.status(404).json({

            success: false,

            message:
                "Goal not found."

        });

    }


    const deletedGoal =
        goals.splice(
            goalIndex,
            1
        )[0];


    res.json({

        success: true,

        message:
            "Goal deleted successfully!",

        goal:
            deletedGoal

    });

});


// ================================
// Start Server
// ================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);