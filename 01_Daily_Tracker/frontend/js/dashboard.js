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
        now.toLocaleDateString(
            "en-IN",
            dateOptions
        );


    const currentTime =
        now.toLocaleTimeString(
            "en-IN",
            timeOptions
        );


    document.getElementById("currentDate").textContent =
        currentDate;


    document.getElementById("currentTime").textContent =
        currentTime;
}


updateDateTime();


setInterval(
    updateDateTime,
    1000
);