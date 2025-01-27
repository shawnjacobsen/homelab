import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
const app = express()
const PORT = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use((req, res, next) => {
  console.log(`User accessed site at ${new Date().toUTCString()}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, function () {
  console.log(`Server running at http://localhost:${PORT}...`)
})