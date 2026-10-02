(function () {

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }

})();