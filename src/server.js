const dotenv = require('dotenv')
const express = require('express')
const path = require('path')
const router = require('./routes')

dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, '..', '.env')
})

const PORT = process.env.PORT

const app = express()
app.use(express.json())

const publicPath = path.join(__dirname, '..', 'public')
const pagesPath = path.join(publicPath, 'pages')
const assetsPath = path.join(publicPath, 'assets')
const cssPath = path.join(publicPath, 'css')
const jsPath = path.join(publicPath, 'js')

app.use('/', express.static(pagesPath))
app.use('/assets', express.static(assetsPath))
app.use('/css', express.static(cssPath))
app.use('/js', express.static(jsPath))

app.use('/api', router)

app.get('/cadastro', function (_req, res) {
  res.sendFile(path.join(pagesPath, 'cadastro.html'))
})

app.get('/login', function (_req, res) {
  res.sendFile(path.join(pagesPath, 'login.html'))
})

app.get('/painel', function (_req, res) {
  res.sendFile(path.join(pagesPath, 'painel.html'))
})

app.use(function (_req, res) {
  res.status(404).redirect('not-found.html')
})

app.listen(PORT, function () {
  console.log(`Rodando em http://localhost:${PORT}`)
})
