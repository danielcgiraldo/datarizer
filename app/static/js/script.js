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

function showModal(ev) {

    if (ev.target.classList[1] === "add") {
        addEvent("Prueba");
    } else if (ev.target.classList[1] === "edit") {
        removeEvent();
        CARDS_CONTAINER.classList = "edit"
        createCancelBtn();

    } else if (ev.target.classList[1] === "remove") {
        removeEvent();
        CARDS_CONTAINER.classList = "remove"
        createCancelBtn();

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
    }

    // =============== SESSION ===============
    document.getElementById("session-handler").addEventListener("click", () => {
        MODAL_CONTAINER.classList.toggle("active");
        setTimeout(() => {
            MODAL_CONTAINER.querySelector(".session").classList.toggle("active");
        }, 100);
    });

    // =============== ACTIONS ===============
    const actionsContainer = document.getElementById('actions');
    actionsContainer.querySelector("#handler-btn").addEventListener("click", () => {
        actionsContainer.classList.toggle("active");
    });

    actionsContainer.querySelector("button.action.add").addEventListener("click", showModal);
    actionsContainer.querySelector("button.action.edit").addEventListener("click", showModal);
    actionsContainer.querySelector("button.action.remove").addEventListener("click", showModal);


};
