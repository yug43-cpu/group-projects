(function () {

    // ==================================================
    // LOGOUT
    // ==================================================

    const logoutLinks =
        document.querySelectorAll(
            'a[href="login.html"]'
        );


    logoutLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "login.html";

            }
        );

    });


    // ==================================================
    // PROTECT PAGES
    // ==================================================

    const currentUser =
        localStorage.getItem("currentUser");


    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const publicPages = [
        "",
        "index.html",
        "login.html",
        "register.html"
    ];


    if (
        !publicPages.includes(currentPage) &&
        !currentUser
    ) {

        window.location.href =
            "login.html";

    }

})();