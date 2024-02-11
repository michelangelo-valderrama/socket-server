import { createServer } from "http"
import { envs } from "./config"
import { AppRoutes, Server, WssService } from "./presentation/"

//*
;(async () => {
  main()
})()

function main() {
  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  })

  const httpServer = createServer(server.app)
  WssService.initWss({ server: httpServer })

  httpServer.listen(envs.PORT, () => {
    console.log(`Server running on http://localhost:${envs.PORT}`)
  })
}
