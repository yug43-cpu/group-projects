const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (email === "" || password === "") {

        alert("Please fill all fields!");

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        // Save logged-in user
        localStorage.setItem(
            "currentUser",
            JSON.stringify(data.user)
        );

        alert(data.message);

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Cannot connect to the server. Please make sure the backend is running."
        );

    }

});