/* ================================
   Settings Page
================================ */


/* ================================
   Elements
================================ */

const profileForm =
    document.getElementById("profileForm");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");


const themeSelect =
    document.getElementById("themeSelect");


const passwordForm =
    document.getElementById("passwordForm");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");


const logoutButton =
    document.getElementById("logoutButton");


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
        now.toLocaleDateString(
            "en-IN",
            dateOptions
        );

    document.getElementById("currentTime").textContent =
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


/* ================================
   Load Profile
================================ */

function loadProfile() {

    const profile =
        JSON.parse(
            localStorage.getItem("profile")
        ) || {};


    profileName.value =
        profile.name || "";


    profileEmail.value =
        profile.email || "";

}


/* ================================
   Save Profile
================================ */

profileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            profileName.value.trim();


        const email =
            profileEmail.value.trim();


        if (
            name === "" ||
            email === ""
        ) {

            alert(
                "Please fill all profile fields!"
            );

            return;

        }


        const profile = {

            name: name,

            email: email

        };


        localStorage.setItem(
            "profile",
            JSON.stringify(profile)
        );


        alert(
            "Profile saved successfully!"
        );

    }
);


/* ================================
   Theme
================================ */

function applyTheme(theme) {

    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );

    }

}


function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme") ||
        "dark";


    themeSelect.value =
        savedTheme;


    applyTheme(
        savedTheme
    );

}


themeSelect.addEventListener(
    "change",
    function () {

        const theme =
            themeSelect.value;


        localStorage.setItem(
            "theme",
            theme
        );


        applyTheme(
            theme
        );

    }
);


/* ================================
   Change Password
================================ */

passwordForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const current =
            currentPassword.value;


        const newPass =
            newPassword.value;


        const confirmPass =
            confirmPassword.value;


        if (
            current === "" ||
            newPass === "" ||
            confirmPass === ""
        ) {

            alert(
                "Please fill all password fields!"
            );

            return;

        }


        if (
            newPass.length < 6
        ) {

            alert(
                "New password must be at least 6 characters!"
            );

            return;

        }


        if (
            newPass !== confirmPass
        ) {

            alert(
                "New passwords do not match!"
            );

            return;

        }


        /*
           Demo frontend only.
           Real password verification
           will be handled by backend later.
        */

        localStorage.setItem(
            "demoPassword",
            newPass
        );


        alert(
            "Password changed successfully!"
        );


        passwordForm.reset();

    }
);


/* ================================
   Logout
================================ */

logoutButton.addEventListener(
    "click",
    function () {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmLogout) {

            return;

        }


        window.location.href =
            "login.html";

    }
);


/* ================================
   Initial Load
================================ */

loadProfile();

loadTheme();