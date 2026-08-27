const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6vpV8RCsyS-GG1rVLvR0gBDtWQj3nB30FNuh1VlrhlpkoIFXmv0l6q5PkRZ3O__Fh9g/exec";


let AUTH_TOKEN =
    sessionStorage.getItem("osis_auth_token");


let voteChartInstance = null;

let isLoadingResults = false;




async function loginVoting() {

    const passwordInput =
        document.getElementById("loginPassword");

    const button =
        document.getElementById("loginButton");

    const error =
        document.getElementById("loginError");


    if (!passwordInput || !button || !error) {
        return;
    }


    const password =
        passwordInput.value.trim();


    if (!password) {

        error.textContent =
            "Masukkan password.";

        error.classList.add("show");

        return;
    }


    error.classList.remove("show");

    button.disabled = true;

    button.textContent =
        "Memeriksa...";


    try {

        const response =
            await fetch(
                `${SCRIPT_URL}?action=login&password=${encodeURIComponent(password)}&t=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            error.textContent =
                "Password salah.";

            error.classList.add("show");

            passwordInput.value = "";

            passwordInput.focus();

            return;
        }


        AUTH_TOKEN =
            data.token;


        sessionStorage.setItem(
            "osis_auth_token",
            AUTH_TOKEN
        );


        const loginScreen =
            document.getElementById(
                "loginScreen"
            );


        if (loginScreen) {

            loginScreen.classList.add(
                "login-hide"
            );

        }


    } catch (err) {

        console.error(
            "Login error:",
            err
        );


        error.textContent =
            "Tidak dapat terhubung ke server.";

        error.classList.add("show");


    } finally {

        button.disabled = false;

        button.textContent =
            "Masuk";

    }

}




function checkExistingLogin() {

    if (!AUTH_TOKEN) {
        return;
    }


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }

}


function setupLoginEnter() {

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    if (!passwordInput) {
        return;
    }


    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                loginVoting();

            }

        }
    );

}




function vote(paslon) {
    if (!AUTH_TOKEN) {

        showLoginScreen();

        return;
    }


    sendVoteBackground(paslon);

}


function sendVoteBackground(paslon) {

    if (!AUTH_TOKEN) {

        console.error(
            "Vote dibatalkan. Token login tidak tersedia."
        );

        return;
    }




    showSuccessModal();




    localStorage.setItem(
        "osis_vote",
        "true"
    );



    fetch(
        `${SCRIPT_URL}?action=vote&paslon=${paslon}&token=${encodeURIComponent(AUTH_TOKEN)}&t=${Date.now()}`,
        {
            method: "GET",
            cache: "no-store"
        }
    )

    .then(response => {

        return response.json();

    })

    .then(data => {

        if (!data.success) {

            console.error(
                "Vote gagal:",
                data
            );

            if (
                data.message ===
                "Unauthorized"
            ) {

                logoutVoting();

            }

            return;
        }


        console.log(
            `Vote Paslon ${paslon} berhasil dikirim.`
        );

    })

    .catch(error => {

        console.error(
            "Gagal mengirim vote:",
            error
        );

    });

}




function showSuccessModal() {

    const modal =
        document.getElementById(
            "successModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );

}



function closeModal() {

    const modal =
        document.getElementById(
            "successModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );

}



function showLoginScreen() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (!loginScreen) {
        return;
    }


    loginScreen.style.display =
        "flex";


    loginScreen.classList.remove(
        "login-hide"
    );

}



function logoutVoting() {

    AUTH_TOKEN = null;


    sessionStorage.removeItem(
        "osis_auth_token"
    );


    showLoginScreen();

}



async function loadResults() {
    const chartElement =
        document.getElementById(
            "voteChart"
        );


    if (!chartElement) {
        return;
    }


    if (isLoadingResults) {
        return;
    }


    isLoadingResults = true;


    try {

        const response =
            await fetch(
                `${SCRIPT_URL}?action=results&t=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        const votes = [

            Number(
                data.paslon1
            ) || 0,

            Number(
                data.paslon2
            ) || 0,

            Number(
                data.paslon3
            ) || 0,

            Number(
                data.paslon4
            ) || 0

        ];



        updateVoteNumber(
            "vote1",
            votes[0]
        );


        updateVoteNumber(
            "vote2",
            votes[1]
        );


        updateVoteNumber(
            "vote3",
            votes[2]
        );


        updateVoteNumber(
            "vote4",
            votes[3]
        );


        if (!voteChartInstance) {

            voteChartInstance =
                new Chart(
                    chartElement,
                    {

                        type: "bar",


                        data: {

                            labels: [

                                "Paslon 1",
                                "Paslon 2",
                                "Paslon 3",
                                "Paslon 4"

                            ],


                            datasets: [

                                {

                                    label:
                                        "Jumlah Suara",

                                    data:
                                        votes,

                                    borderWidth:
                                        0,

                                    borderRadius:
                                        12,

                                    borderSkipped:
                                        false

                                }

                            ]

                        },


                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,


                            animation: {

                                duration:
                                    450,

                                easing:
                                    "easeOutQuart"

                            },


                            plugins: {

                                legend: {

                                    display:
                                        false

                                }

                            },


                            scales: {

                                y: {

                                    beginAtZero:
                                        true,


                                    ticks: {

                                        precision:
                                            0

                                    }

                                }

                            }

                        }

                    }
                );

        }


        else {

            voteChartInstance
                .data
                .datasets[0]
                .data = votes;


            voteChartInstance.update();

        }




        updateResultStatus();


    } catch (error) {

        console.error(
            "Gagal mengambil hasil:",
            error
        );


        const updateText =
            document.getElementById(
                "updateText"
            );


        if (updateText) {

            updateText.textContent =
                "Gagal mengambil data";

        }


    } finally {

        isLoadingResults =
            false;

    }

}



function updateVoteNumber(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }



    if (
        element.textContent !==
        String(value)
    ) {

        element.textContent =
            value;

    }

}


function updateResultStatus() {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            "id-ID",
            {

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"

            }
        );


    const lastUpdate =
        document.getElementById(
            "lastUpdate"
        );


    if (lastUpdate) {

        lastUpdate.textContent =
            time;

    }


    const updateText =
        document.getElementById(
            "updateText"
        );


    if (updateText) {

        updateText.textContent =
            "Data terhubung";

    }


    const updateDot =
        document.querySelector(
            ".update-dot"
        );


    if (updateDot) {

        updateDot.classList.add(
            "connected"
        );

    }

}



document.addEventListener(
    "DOMContentLoaded",
    function () {


        checkExistingLogin();


        

        setupLoginEnter();


        

        if (
            document.getElementById(
                "voteChart"
            )
        ) {

            loadResults();


            setInterval(
                loadResults,
                1000
            );

        }

    }
);