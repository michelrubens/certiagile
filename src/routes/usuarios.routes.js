const { Router } = require('express')
const { createUsuario } = require('../respositories/usuarios.repositories')

const router = Router()

// POST /api/usuarios
router.post('/', async function (req, res) {
  const { nome, cpf, email, senha } = req.body

  if (!nome || !cpf || !email || !senha) {
    return res
      .status(400)
      .json({ message: 'Nome, CPF, e-mail e senha são obrigatórios.' })
  }

  if (senha.trim().lenght < 6) {
    return res
      .status(400)
      .json({ message: 'A senha deve ter no mínimo 6 caracteres.' })
  }

  try {
    const result = await createUsuario(nome, cpf, email, senha)
    res.send(result)
  } catch (error) {
    if (error && error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'Já existe um usuário com os dados informados.' })
    } else {
      return res.status(500).json({ message: error.message })
    }
  }
})

// PUT /api

// DELETE /api

// GET /api

module.exports = router

/*
------------------------------
POST /api/usuarios 
------------------------------
curl -X POST http://localhost:3000/api \
-H "Content-Type: application/json" \
-d '{"nome":"Pedro","cpf":"11122233300","email":"pedro@teste.com","senha":"123456"}' 
------------------------------

*/
