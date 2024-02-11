import { Router } from "express"
import { TicketRoutes } from "./tickets"

export class AppRoutes {
  static get routes(): Router {
    const router = Router()

    // Definir las rutas
    router.use("/api/ticket", TicketRoutes.router)

    return router
  }
}
