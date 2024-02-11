const lblPending = document.querySelector("#lbl-pending")
const deskHeader = document.querySelector("h1")
const noMoreAlert = document.querySelector(".alert")
const lblCurrentTicket = document.querySelector("small")

const btnDraw = document.querySelector("#btn-draw")
const btnDone = document.querySelector("#btn-done")

const searchParams = new URLSearchParams(window.location.search)

if (!searchParams.has("d")) {
  window.location = "index.html"
  throw new Error("d es requerido")
}

const deskNumber = searchParams.get("d")
let workingTicket = null
deskHeader.innerHTML = deskNumber

function checkTicketCount(currentCount = 0) {
  if (currentCount === 0) noMoreAlert.classList.remove("d-none")
  else noMoreAlert.classList.add("d-none")
  lblPending.innerHTML = currentCount
}

async function loadInitialCount() {
  const pending = await fetch("/api/ticket/pending").then(resp => resp.json())
  checkTicketCount(pending.length)
}

async function getTicket() {
  await finishTicket()

  const { status, ticket, message } = await fetch(`/api/ticket/draw/${deskNumber}`).then(resp => resp.json())

  if (status === "error") {
    return lblCurrentTicket.innerHTML = message
  }

  workingTicket = ticket
  lblCurrentTicket.innerHTML = ticket.number
}

async function finishTicket() {
  if (!workingTicket) return
  const { status, message } = await fetch(`/api/ticket/done/${workingTicket.id}`, {
    method: "PUT"
  }).then(resp => resp.json())
  if (status === "ok") {
    workingTicket = null
    lblCurrentTicket.innerHTML = "Nadie"
  }
}

function connectToWebSockets() {
  const socket = new WebSocket('ws://localhost:3000/ws');

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data)
    if (type !== "on-ticket-count-changed") return
    checkTicketCount(payload)
  };

  socket.onclose = (event) => {
    console.log('Connection closed');
    setTimeout(() => {
      console.log('retrying to connect');
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log('Connected');
  };
}

btnDraw.addEventListener("click", getTicket)
btnDone.addEventListener("click", finishTicket)

connectToWebSockets();
loadInitialCount()
