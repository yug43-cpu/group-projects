const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

const themeSelect = document.getElementById("themeSelect");

const passwordForm = document.getElementById("passwordForm");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const logoutButton = document.getElementById("logoutButton");

const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");


/* =================================
   DATE & TIME
================================= */

function updateDateTime() {
    const now = new Date();

    if (currentDate) {
        currentDate.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    if (currentTime) {
        currentTime.textContent = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }
}

updateDateTime();
setInterval(updateDateTime, 1000);


/* =================================
   PROFILE
================================= */

function loadProfile() {
    const savedProfile = JSON.parse(
        localStorage.getItem("profile") || "{}"
    );

    if (profileName) {
        profileName.value = savedProfile.name || "";
    }

    if (profileEmail) {
        profileEmail.value = savedProfile.email || "";
    }
}

if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const profile = {
            name: profileName.value.trim(),
            email: profileEmail.value.trim()
        };

        localStorage.setItem(
            "profile",
            JSON.stringify(profile)
        );

        alert("Profile saved successfully.");
    });
}


/* =================================
   GLOBAL THEME
================================= */

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }
}

function loadTheme() {
    const savedTheme =
        localStorage.getItem("theme") || "dark";

    if (themeSelect) {
        themeSelect.value = savedTheme;
    }

    applyTheme(savedTheme);
}

if (themeSelect) {
    themeSelect.addEventListener("change", function () {
        const selectedTheme = themeSelect.value;

        localStorage.setItem(
            "theme",
            selectedTheme
        );

        applyTheme(selectedTheme);
    });
}


/* =================================
   PASSWORD
================================= */

if (passwordForm) {
    passwordForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const current = currentPassword.value;
        const newPass = newPassword.value;
        const confirm = confirmPassword.value;

        if (!current || !newPass || !confirm) {
            alert("Please fill all password fields.");
            return;
        }

        if (newPass !== confirm) {
            alert("New passwords do not match.");
            return;
        }

        localStorage.setItem("demoPassword", newPass);

        alert(
            "Password changed successfully. Backend authentication will handle real password security later."
        );

        passwordForm.reset();
    });
}


/* =================================
   LOGOUT
================================= */

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}


/* =================================
   INITIAL LOAD
================================= */

loadProfile();
loadTheme();