const { Router } = require('express')
const usuariosRoutes = require('./usuarios.routes')
const authRoutes = require('./auth.routes')
const questoesRoutes = require('./questoes.routes')

const router = Router()

// http://localhost:3000/api/usuarios
router.use('/usuarios', usuariosRoutes)

// http://localhost:3000/api/auth
router.use('/auth', authRoutes)

// http://localhost:3000/api/questoes
router.use('/questoes', questoesRoutes)

router.use(function (_req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' })
})

module.exports = router
