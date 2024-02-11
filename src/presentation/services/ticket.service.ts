import { type Ticket } from "../../domain"
import { UuidAdapter } from "../../config"
import { WssService } from "./wss.service"

export class TicketService {
  constructor(private readonly wssService = WssService.instance) {}

  public tickets: Ticket[] = []

  private readonly workingOnTickets: Ticket[] = []

  public get pendingTickets(): Ticket[] {
    return this.tickets.filter((ticket) => !ticket.handleAtDesk)
  }

  public get lastWorkingOnTickets(): Ticket[] {
    return this.workingOnTickets.slice(0, 4)
  }

  public get lastTicketNumber(): number {
    return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0
  }

  public createTicket() {
    const ticket: Ticket = {
      id: UuidAdapter.v4(),
      number: this.lastTicketNumber + 1,
      createdAt: new Date(),
      done: false,
    }

    this.tickets.push(ticket)
    this.onTicketNumberChange()

    return ticket
  }

  public drawTicket(desk: string) {
    const ticket = this.tickets.find((t) => !t.handleAtDesk)
    if (!ticket)
      return { status: "error", message: "No hay tickets pendientes" }

    ticket.handleAtDesk = desk
    ticket.handleAt = new Date()

    this.workingOnTickets.unshift({ ...ticket })

    this.onTicketNumberChange()
    this.onWorkingOnChanged()

    return { status: "ok", ticket }
  }

  public onFinishedTicket(id: string) {
    const ticket = this.tickets.find((t) => t.id === id)
    if (!ticket) return { status: "error", message: "Ticket no encontrado" }

    this.tickets = this.tickets.map((t) => {
      if (t.id === id) t.done = true
      return t
    })

    return { status: "ok" }
  }

  private onTicketNumberChange() {
    this.wssService.sendMessage(
      "on-ticket-count-changed",
      this.pendingTickets.length
    )
  }

  private onWorkingOnChanged() {
    this.wssService.sendMessage(
      "on-working-on-changed",
      this.lastWorkingOnTickets
    )
  }
}
