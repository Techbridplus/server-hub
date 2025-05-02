import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { setupSocketServer } from "./lib/socket-server"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  // Setup Socket.IO
  setupSocketServer(server)

  const PORT = process.env.PORT || 3001
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
}) 
for(int i=0;i<10;i++){
console.log("helllo");
  
}
