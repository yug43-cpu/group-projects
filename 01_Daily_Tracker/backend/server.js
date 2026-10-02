const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


// ================================
// In-Memory Data
// ================================

let users = [];
let tasks = [];
let studySessions = [];
let goals = [];
let journals = [];


// ================================
// BASIC APIs
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
// AUTHENTICATION - REGISTER API
// ================================

// Register User
app.post("/api/register", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    // Validate name
    if (!name || name.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Name is required."

        });

    }


    // Validate email
    if (!email || email.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Email is required."

        });

    }


    // Validate password
    if (!password || password.length < 6) {

        return res.status(400).json({

            success: false,

            message: "Password must be at least 6 characters."

        });

    }


    const cleanName =
        name.trim();

    const cleanEmail =
        email.trim().toLowerCase();


    // Check existing user
    const existingUser =
        users.find(
            user => user.email === cleanEmail
        );


    if (existingUser) {

        return res.status(409).json({

            success: false,

            message: "Email is already registered."

        });

    }


    // Create user
    const newUser = {

        id: Date.now(),

        name: cleanName,

        email: cleanEmail,

        password: password

    };


    users.push(newUser);


    res.status(201).json({

        success: true,

        message: "Registration successful!",

        user: {

            id: newUser.id,

            name: newUser.name,

            email: newUser.email

        }

    });

});


// ================================
// AUTHENTICATION - LOGIN API
// ================================

// Login User
app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    // Validate email
    if (!email || email.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Email is required."

        });

    }


    // Validate password
    if (!password || password === "") {

        return res.status(400).json({

            success: false,

            message: "Password is required."

        });

    }


    const cleanEmail =
        email.trim().toLowerCase();


    // Find user
    const user =
        users.find(
            item => item.email === cleanEmail
        );


    // User not found
    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid email or password."

        });

    }


    // Check password
    if (user.password !== password) {

        return res.status(401).json({

            success: false,

            message: "Invalid email or password."

        });

    }


    // Login successful
    res.json({

        success: true,

        message: "Login successful!",

        user: {

            id: user.id,

            name: user.name,

            email: user.email

        }

    });

});


// ================================
// USER HELPER
// ================================

function getUserById(userId) {

    const id = Number(userId);

    if (!userId || Number.isNaN(id)) {

        return null;

    }

    return users.find(
        user => user.id === id
    );

}


// ================================
// TASK APIs
// ================================

// Add Task
app.post("/api/tasks", (req, res) => {

    const {
        userId,
        name,
        priority,
        dueTime,
        date
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Validate task name
    if (!name || name.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Task name is required."

        });

    }


    // Create task
    const newTask = {

        id: Date.now(),

        userId: user.id,

        name: name.trim(),

        priority: priority || "Medium",

        dueTime: dueTime || "",

        date: date || "",

        completed: false

    };


    tasks.push(newTask);


    res.status(201).json({

        success: true,

        message: "Task added successfully!",

        task: newTask

    });

});


// Get Tasks
app.get("/api/tasks", (req, res) => {

    const {
        userId
    } = req.query;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Get only current user's tasks
    const userTasks =
        tasks.filter(
            task => task.userId === user.id
        );


    res.json({

        success: true,

        tasks: userTasks

    });

});


// Update Task
app.put("/api/tasks/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        userId,
        name,
        priority,
        dueTime,
        date,
        completed
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Find task belonging to current user
    const task =
        tasks.find(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (!task) {

        return res.status(404).json({

            success: false,

            message: "Task not found."

        });

    }


    // Update name
    if (name !== undefined) {

        if (name.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Task name is required."

            });

        }

        task.name =
            name.trim();

    }


    // Update priority
    if (priority !== undefined) {

        task.priority =
            priority;

    }


    // Update due time
    if (dueTime !== undefined) {

        task.dueTime =
            dueTime;

    }


    // Update date
    if (date !== undefined) {

        task.date =
            date;

    }


    // Update completed status
    if (completed !== undefined) {

        task.completed =
            Boolean(completed);

    }


    res.json({

        success: true,

        message: "Task updated successfully!",

        task: task

    });

});


// Delete Task
app.delete("/api/tasks/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        userId
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Find task belonging to current user
    const taskIndex =
        tasks.findIndex(
            item =>
                item.id === id &&
                item.userId === user.id
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

        message: "Task deleted successfully!",

        task: deletedTask

    });

});


// ================================
// STUDY APIs
// ================================

// Add Study Session
app.post("/api/study", (req, res) => {

    const {
        userId,
        subject,
        duration,
        date
    } = req.body;


    // Check user ID
    if (!userId) {

        return res.status(400).json({

            success: false,

            message: "User ID is required."

        });

    }


    // Check user exists
    const user = getUserById(userId);

    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid user."

        });

    }


    // Check subject
    if (!subject || subject.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Subject is required."

        });

    }


    // Check duration
    const studyDuration =
        Number(duration);


    if (
        Number.isNaN(studyDuration) ||
        studyDuration <= 0
    ) {

        return res.status(400).json({

            success: false,

            message: "Duration must be greater than 0."

        });

    }


    // Check date
    if (!date) {

        return res.status(400).json({

            success: false,

            message: "Date is required."

        });

    }


    const newSession = {

        id: Date.now(),

        userId: user.id,

        subject: subject.trim(),

        duration: studyDuration,

        date: date

    };


    studySessions.push(newSession);


    res.status(201).json({

        success: true,

        message: "Study session added successfully!",

        session: newSession

    });

});


// Get Study Sessions
app.get("/api/study", (req, res) => {

    const {
        userId
    } = req.query;


    // Check user ID
    if (!userId) {

        return res.status(400).json({

            success: false,

            message: "User ID is required."

        });

    }


    // Check user exists
    const user = getUserById(userId);

    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid user."

        });

    }


    // Get only this user's study sessions
    const userSessions =
        studySessions.filter(
            session =>
                session.userId === user.id
        );


    res.json({

        success: true,

        sessions: userSessions

    });

});


// Update Study Session
app.put("/api/study/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        userId,
        subject,
        duration,
        date
    } = req.body;


    // Check user ID
    if (!userId) {

        return res.status(400).json({

            success: false,

            message: "User ID is required."

        });

    }


    // Check user exists
    const user = getUserById(userId);

    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid user."

        });

    }


    // Find session belonging to this user
    const session =
        studySessions.find(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (!session) {

        return res.status(404).json({

            success: false,

            message: "Study session not found."

        });

    }


    // Update subject
    if (subject !== undefined) {

        if (subject.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Subject is required."

            });

        }

        session.subject =
            subject.trim();

    }


    // Update duration
    if (duration !== undefined) {

        const newDuration =
            Number(duration);


        if (
            Number.isNaN(newDuration) ||
            newDuration <= 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Duration must be greater than 0."

            });

        }


        session.duration =
            newDuration;

    }


    // Update date
    if (date !== undefined) {

        if (!date) {

            return res.status(400).json({

                success: false,

                message: "Date is required."

            });

        }


        session.date =
            date;

    }


    res.json({

        success: true,

        message: "Study session updated successfully!",

        session: session

    });

});


// Delete Study Session
app.delete("/api/study/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        userId
    } = req.body;


    // Check user ID
    if (!userId) {

        return res.status(400).json({

            success: false,

            message: "User ID is required."

        });

    }


    // Check user exists
    const user = getUserById(userId);

    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid user."

        });

    }


    // Find user's session
    const sessionIndex =
        studySessions.findIndex(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (sessionIndex === -1) {

        return res.status(404).json({

            success: false,

            message: "Study session not found."

        });

    }


    const deletedSession =
        studySessions.splice(
            sessionIndex,
            1
        )[0];


    res.json({

        success: true,

        message: "Study session deleted successfully!",

        session: deletedSession

    });

});


// ================================
// GOAL APIs
// ================================

// Add Goal
app.post("/api/goals", (req, res) => {

    const {
        userId,
        name,
        progress,
        deadline
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Validate goal name
    if (!name || name.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Goal name is required."

        });

    }


    // Validate progress
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


    // Create goal
    const newGoal = {

        id: Date.now(),

        userId: user.id,

        name: name.trim(),

        progress: goalProgress,

        deadline: deadline || ""

    };


    goals.push(newGoal);


    res.status(201).json({

        success: true,

        message: "Goal added successfully!",

        goal: newGoal

    });

});


// ================================
// Get Goals
// ================================

app.get("/api/goals", (req, res) => {

    const {
        userId
    } = req.query;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Get only current user's goals
    const userGoals =
        goals.filter(
            goal =>
                goal.userId === user.id
        );


    res.json({

        success: true,

        goals: userGoals

    });

});


// ================================
// Update Goal
// ================================

app.put("/api/goals/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const {
        userId,
        name,
        progress,
        deadline
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Find goal belonging to current user
    const goal =
        goals.find(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (!goal) {

        return res.status(404).json({

            success: false,

            message: "Goal not found."

        });

    }


    // Update name
    if (name !== undefined) {

        if (name.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Goal name is required."

            });

        }


        goal.name =
            name.trim();

    }


    // Update progress
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


    // Update deadline
    if (deadline !== undefined) {

        goal.deadline =
            deadline;

    }


    res.json({

        success: true,

        message: "Goal updated successfully!",

        goal: goal

    });

});


// ================================
// Delete Goal
// ================================

app.delete("/api/goals/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const {
        userId
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Find goal belonging to current user
    const goalIndex =
        goals.findIndex(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (goalIndex === -1) {

        return res.status(404).json({

            success: false,

            message: "Goal not found."

        });

    }


    const deletedGoal =
        goals.splice(
            goalIndex,
            1
        )[0];


    res.json({

        success: true,

        message: "Goal deleted successfully!",

        goal: deletedGoal

    });

});


// ================================
// JOURNAL APIs
// ================================

// Add Journal
app.post("/api/journals", (req, res) => {

    const {
        userId,
        title,
        date,
        mood,
        content
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Validate title
    if (!title || title.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Journal title is required."

        });

    }


    // Validate date
    if (!date) {

        return res.status(400).json({

            success: false,

            message: "Journal date is required."

        });

    }


    // Validate content
    if (!content || content.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Journal content is required."

        });

    }


    // Create journal
    const newJournal = {

        id: Date.now(),

        userId: user.id,

        title: title.trim(),

        date: date,

        mood: mood || "🙂",

        content: content.trim()

    };


    journals.push(newJournal);


    res.status(201).json({

        success: true,

        message: "Journal entry added successfully!",

        journal: newJournal

    });

});


// ================================
// Get Journals
// ================================

app.get("/api/journals", (req, res) => {

    const {
        userId
    } = req.query;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Get only current user's journals
    const userJournals =
        journals.filter(
            journal =>
                journal.userId === user.id
        );


    res.json({

        success: true,

        journals: userJournals

    });

});


// ================================
// Update Journal
// ================================

app.put("/api/journals/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        userId,
        title,
        date,
        mood,
        content
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Find journal belonging to current user
    const journal =
        journals.find(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (!journal) {

        return res.status(404).json({

            success: false,

            message: "Journal entry not found."

        });

    }


    // Update title
    if (title !== undefined) {

        if (title.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Journal title is required."

            });

        }

        journal.title =
            title.trim();

    }


    // Update date
    if (date !== undefined) {

        if (!date) {

            return res.status(400).json({

                success: false,

                message: "Journal date is required."

            });

        }

        journal.date =
            date;

    }


    // Update mood
    if (mood !== undefined) {

        journal.mood =
            mood || "🙂";

    }


    // Update content
    if (content !== undefined) {

        if (content.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Journal content is required."

            });

        }

        journal.content =
            content.trim();

    }


    res.json({

        success: true,

        message: "Journal entry updated successfully!",

        journal: journal

    });

});


// ================================
// Delete Journal
// ================================

app.delete("/api/journals/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        userId
    } = req.body;


    // Check user
    const user =
        getUserById(userId);


    if (!user) {

        return res.status(401).json({

            success: false,

            message: "User is not logged in."

        });

    }


    // Find journal belonging to current user
    const journalIndex =
        journals.findIndex(
            item =>
                item.id === id &&
                item.userId === user.id
        );


    if (journalIndex === -1) {

        return res.status(404).json({

            success: false,

            message: "Journal entry not found."

        });

    }


    const deletedJournal =
        journals.splice(
            journalIndex,
            1
        )[0];


    res.json({

        success: true,

        message: "Journal entry deleted successfully!",

        journal: deletedJournal

    });

});


// ================================
// 404 API
// ================================

app.use("/api", (req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found."

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