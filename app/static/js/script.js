class Clock {
    constructor(container) {
        this.container = container;
        this.time = new Date();
        this.interval = null;
    }

    start() {
        this.interval = setInterval(() => {
            this.time = new Date();
            this.render();
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
    }

    render() {

        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };

        this.container.querySelector("p").innerHTML = this.time.toLocaleDateString(undefined, dateOptions);
        this.container.querySelector("h1").innerHTML = this.time.toLocaleTimeString(undefined, timeOptions).slice(0, -3);
        this.container.querySelector("span").innerHTML = this.time.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true }).slice(-2);
    }
}

let card_i = 0;
const COLORS = [
    "#FF7597",
    "#BB86FC",
    "#F50057",
    "#6200EE",
    "#1DE9B6",
    "#FFAB00",
    "#00B0FF",
    "#D500F9",
    "#00E676",
    "#FF3D00",
    "#2979FF",
    "#00C853"
];

const CARDS_CONTAINER = document.querySelector("header")
const MODAL_CONTAINER = document.getElementById("modal-container");
const MESSAGE_CONTAINER = document.getElementById("message-container");
const MODAL_EVENTS = []

function addEvent(name) {
    try {
        if (card_i > COLORS.length - 1) {
            //show error label
            return;
        }


        const card = document.createElement("button");
        card.classList.add("card");
        card.style.setProperty("--bg-color", COLORS[card_i]);
        card.innerHTML = `
            <div class="top">
                <img src="/static/img/clock.svg" alt="Nuevo registro" class="clock">
                <img src="/static/img/edit.svg" alt="Editar evento" class="edit">
                <img src="/static/img/remove.svg" alt="Eliminar evento" class="remove">
            </div>
            <div class="bottom">
                <h2>${name}</h2>
            </div>
        `;
        CARDS_CONTAINER.appendChild(card);
        card_i++;
    } catch (error) {

    }
}


function removeEvent() {
    const event = CARDS_CONTAINER.classList[0]
    if (event === "edit" || event === "remove") CARDS_CONTAINER.querySelector(".cancel").remove();
    CARDS_CONTAINER.classList = "";
}

function createCancelBtn() {
    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('cancel');
    cancelBtn.textContent = 'Cancelar';
    CARDS_CONTAINER.querySelector("#clock_component").insertAdjacentElement('afterend', cancelBtn);
    cancelBtn.addEventListener('click', removeEvent)
}

function removeModal() {
    MODAL_CONTAINER.classList.remove("active");
    MODAL_CONTAINER.querySelector(".active").classList.remove("active");
    MODAL_EVENTS.forEach(event => {
        try {
            event[0].removeEventListener("click", event[1]);
        } catch (error) {
        }
    });
}

function handleRemoveModal(modal) {
    const CLOSE_BTN = modal.querySelector("button.close");

    const close_handler = () => {
        removeModal();
    };

    const outside_handler = (ev) => {
        if (ev.target.id === "modal-container") {
            removeModal();
        }
    };

    MODAL_CONTAINER.addEventListener("click", outside_handler);
    CLOSE_BTN.addEventListener("click", close_handler);
    MODAL_EVENTS.push([MODAL_CONTAINER, outside_handler]);
    MODAL_EVENTS.push([CLOSE_BTN, close_handler]);
}

function setSessionModal(modal) {
    const share_handler = () => {
        const session = modal.querySelector("h3").innerHTML;
        const session_id = session.slice(1, session.length);

        const url = `https://datarizer.vercel.app/session/${session_id}`;
        const text = `¡Hola! Te invito a ver mi sesión de trabajo en Datarizer: ${url}`;

        if (navigator.share) {
            // share using navigator
            navigator.share({
                title: "Datarizer",
                text,
                url
            }).then(() => {
                console.log("Compartido");
            }).catch((error) => {
                console.log(error);
            });
        } else {
            // copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                MESSAGE_CONTAINER.querySelector("p").innerHTML = "¡Enlace copiado al portapapeles!";
                MESSAGE_CONTAINER.style.height = MESSAGE_CONTAINER.scrollHeight + "px";
                setTimeout(() => {
                    MESSAGE_CONTAINER.style.height = 0;
                }, 4000);
            }).catch((error) => {
                console.log(error);
            }
            );
        }
        removeModal();
    };
    modal.querySelector("button.share").addEventListener("click", share_handler);
    MODAL_EVENTS.push([modal.querySelector("button.share"), share_handler]);
}

function setAddModal(modal) {
    const submit_handler = async (ev) => {
        ev.preventDefault();
        const name = ev.target.querySelector("input").value;
        const label_error = modal.querySelector("label.error");
        if (name.length > 10) {
            label_error.innerHTML = "El nombre es demasiado largo";
            return;
        } else if (name.length < 3) {
            label_error.innerHTML = "El nombre es demasiado corto";
            return;
        }
        try {
            const response = await fetch(`/api/add/${name}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if (response.status === 200) {
                addEvent(name);
                removeModal();
            } else {
                label_error.innerHTML = "El evento ya existe";
                return;
            }
        } catch (error) {
            console.log(error);
        }
    };
    modal.querySelector("form").addEventListener("submit", submit_handler);
    MODAL_EVENTS.push([modal.querySelector("form"), submit_handler]);
}

function showModal(ev) {
    if (ev.target.id == "session-handler") {
        MODAL_CONTAINER.classList.add("active");
        const SESSION_MODAL = MODAL_CONTAINER.querySelector(".session")
        setTimeout(() => {
            SESSION_MODAL.classList.add("active");
        }, 100);
        handleRemoveModal(SESSION_MODAL);
        setSessionModal(SESSION_MODAL);
    } else if (ev.target.classList[1] === "add") {
        MODAL_CONTAINER.classList.add("active");
        const ADD_MODAL = MODAL_CONTAINER.querySelector(".add")
        ADD_MODAL.classList.add("active");
        handleRemoveModal(ADD_MODAL);
        setAddModal(ADD_MODAL);
    } else if (ev.target.classList[1] === "edit") {
        removeEvent();
        CARDS_CONTAINER.classList = "edit"
        createCancelBtn();
    } else if (ev.target.classList[1] === "remove") {
        removeEvent();
        CARDS_CONTAINER.classList = "remove"
        createCancelBtn();
    } else if (ev.target.classList[1] === "ob_add") {
        MODAL_CONTAINER.classList.add("active");
        const ADD_MODAL = MODAL_CONTAINER.querySelector(".ob_add")
        ADD_MODAL.classList.add("active")
        handleRemoveModal(ADD_MODAL);
        setAddModal(ADD_MODAL);
    } else {
        return;
    }
}

window.onload = () => {
    // =============== CLOCK ===============

    const clockContainer = document.getElementById('clock_component');
    const clock = new Clock(clockContainer);
    clock.start();

    // =============== EVENTS ===============

    if (EVENTS.length > 0) {
        EVENTS.forEach(event => {
            addEvent(event)
        });
    } else {
        showModal({ target: { classList: [, "ob_add"] } });
    }

    // =============== SESSION ===============
    document.getElementById("session-handler").addEventListener("click", showModal);

    // =============== ACTIONS ===============
    const actionsContainer = document.getElementById('actions');
    actionsContainer.querySelector("#handler-btn").addEventListener("click", () => {
        actionsContainer.classList.toggle("active");
    });

    actionsContainer.querySelector("button.action.add").addEventListener("click", showModal);
    actionsContainer.querySelector("button.action.edit").addEventListener("click", showModal);
    actionsContainer.querySelector("button.action.remove").addEventListener("click", showModal);


};
