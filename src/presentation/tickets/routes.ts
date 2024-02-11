import { Router } from "express"
import { TicketController } from "./controller"
import { TicketService } from "../services"

export class TicketRoutes {
  static get router() {
    const router = Router()

    const controller = new TicketController(new TicketService())

    router.get("/", controller.getTickets)
    router.get("/last", controller.getLastTicketNumber)
    router.get("/pending", controller.pendingTickets)

    router.post("/", controller.createTicket)

    router.get("/draw/:desk", controller.drawTicket)
    router.put("/done/:ticketId", controller.ticketFinished)

    router.get("/working-on", controller.workingOn)

    return router
  }
}
