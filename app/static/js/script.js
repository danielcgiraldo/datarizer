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
let MODAL_EVENTS = []
let CARD_EVENTS = []

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
    resetCardEvents();
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

function removeModalandEvent() {
    removeModal();
    removeEvent();
    defaultCardsEvents();
}

function removeModal() {
    try {
        MODAL_CONTAINER.classList.remove("active");
        MODAL_CONTAINER.querySelector(".active").classList.remove("active");
        MODAL_EVENTS.forEach(event => {
            try {
                event[0].removeEventListener("click", event[1]);
            } catch (error) {
            }
        });
        MODAL_EVENTS = [];
    } catch (error) {
        console.log("no modal displayed")
    }
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


function handleRemoveModalandEvents(modal) {
    const CLOSE_BTN = modal.querySelector("button.close");

    const close_handler = () => {
        removeModalandEvent();
    };

    const outside_handler = (ev) => {
        if (ev.target.id === "modal-container") {
            removeModalandEvent();
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

    // =============== SAVE SESSION ===============
    const save_handler = async (ev) => {

    };
    modal.querySelector("button.save").addEventListener("click", save_handler);
    MODAL_EVENTS.push([modal.querySelector("button.save"), save_handler]);

    // =============== NEW REPO ===============
    const new_repo = () => {
        window.location.href = "new/";
    };
    modal.querySelector("button.new").addEventListener("click", new_repo);
    MODAL_EVENTS.push([modal.querySelector("button.new"), new_repo]);
}

function setAddModal(modal) {
    // =============== ADD EVENT ===============
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

function resetCardEvents() {
    CARD_EVENTS.forEach(event => {
        try {
            event[0].removeEventListener("click", event[1]);
        } catch (error) {
        }
    });
    CARD_EVENTS = [];
}

function defaultCardsEvents() {
    // The default event for the cards
    const cards = CARDS_CONTAINER.querySelectorAll("button.card");
    const defaultEvent = (ev) => {
        const card = ev.target.closest("button.card");
        const name = card.querySelector("h2").innerHTML;
    };
    //TODO
}

function removeSetup() {
    CARDS_CONTAINER.classList = "remove"
    const cards = CARDS_CONTAINER.querySelectorAll("button.card");
    // remove event on confirm
    const removeEventHandler = async (card) => {
        const name = card.querySelector("h2").innerHTML;
        try {
            const response = await fetch(`/api/remove/${name}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if (response.status === 200) {
                // remove card from DOM
                card.remove();
                // remove delete event from cards
                removeEvent();
                // reset cards events
                defaultCardsEvents();
                // reduce card index
                card_i--;
            } else {
                return;
            }
        } catch (error) {
            console.log(error);
        } finally {
            removeModal();
            if (card_i === 0) {
                showModal({ target: { classList: [, "ob_add"] } });
            }
        }
    };
    const removeEventConfirm = (ev) => {
        const card = ev.target.closest("button.card");
        const name = card.querySelector("h2").innerHTML;
        // show confirm modal
        const modal = MODAL_CONTAINER.querySelector("div.modal.confirm")
        modal.querySelector("p").innerHTML = `¿Estás seguro de que quieres eliminar <strong>${name}</strong>?`;
        modal.classList.add("active");
        MODAL_CONTAINER.classList.add("active");
        MODAL_EVENTS.push([modal, removeEventConfirm]);
        // set confirm event
        modal.querySelector("button.delete").addEventListener("click", () => { removeEventHandler(card) });
        MODAL_EVENTS.push([modal.querySelector("button.delete"), () => { removeEventHandler(card) }]);
        // set cancel event
        modal.querySelector("button.cancel").addEventListener("click", removeModalandEvent);
        MODAL_EVENTS.push([modal.querySelector("button.cancel"), removeModalandEvent]);
        // set close modal event
        handleRemoveModalandEvents(modal);
    };

    cards.forEach(card => {
        card.addEventListener("click", removeEventConfirm);
        CARD_EVENTS.push([card, removeEventConfirm]);
    });
}

function editSetup() {
    CARDS_CONTAINER.classList = "edit"
    const cards = CARDS_CONTAINER.querySelectorAll("button.card");
    // edit event on confirm
    const editEventHandler = async (ev, card) => {
        ev.preventDefault();

        try {
            const last = ev.target.querySelector("input[type=hidden]").value;
            const name = ev.target.querySelector("input[type=text]").value;
            const response = await fetch(`/api/modify/${last}/${name}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if (response.status === 200) {
                // remove card from DOM
                card.querySelector("h2").innerHTML = name;
                // remove edit event from cards
                removeEvent();
                // reset cards events
                defaultCardsEvents();

                // remove modal
                removeModal();
            } else {
                ev.target.querySelector("label.error").innerHTML = "El evento ya existe";
            }
        } catch (error) {
            console.error(error);
        }
    };
    const editEventConfirm = (ev) => {
        const card = ev.target.closest("button.card");
        const name = card.querySelector("h2").innerHTML;
        // show confirm modal
        const modal = MODAL_CONTAINER.querySelector("div.modal.edit")
        modal.classList.add("active");
        MODAL_CONTAINER.classList.add("active");
        // set confirm event
        modal.querySelector("form input[type=hidden]").value = name;
        modal.querySelector("form").addEventListener("submit", (ev) => { editEventHandler(ev, card) });
        MODAL_EVENTS.push([modal.querySelector("form"), (ev) => { editEventHandler(ev, card) }]);
        // set close modal event
        handleRemoveModalandEvents(modal);
    };

    cards.forEach(card => {
        card.addEventListener("click", editEventConfirm);
        CARD_EVENTS.push([card, editEventConfirm]);
    });
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
        // reset cards events, including modifing events
        removeEvent();
        // set cards events to edit
        editSetup();
        // create cancel button, and set event
        createCancelBtn();
    } else if (ev.target.classList[1] === "remove") {
        // reset cards events, including modifing events
        removeEvent();
        // set cards events to remove
        removeSetup();
        // create cancel button, and set event
        createCancelBtn();
    } else if (ev.target.classList[1] === "ob_add") {
        MODAL_CONTAINER.classList.add("active");
        const ADD_MODAL = MODAL_CONTAINER.querySelector(".ob_add")
        ADD_MODAL.classList.add("active")
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
