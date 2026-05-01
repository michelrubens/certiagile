const { Router } = require('express')
const {
  createUsuario,
  updateUsuarioCpf,
  findUsuarioById,
  updateUsuarioNome,
  updateUsuarioEmail,
  updateUsuarioSenha
} = require('../respositories/usuarios.repositories')

const router = Router()

/*
-----------------------------------
  POST /api/usuarios 
-----------------------------------
curl -X POST http://localhost:3000/api/usuarios \
-H "Content-Type: application/json" \
-d '{"nome":"Pedro","cpf":"11122233300","email":"pedro@teste.com","senha":"123456"}' 
-----------------------------------
*/
router.post('/', async function (req, res) {
  const { nome, cpf, email, senha } = req.body

  if (!nome || !cpf || !email || !senha) {
    return res
      .status(400)
      .json({ message: 'Nome, CPF, e-mail e senha são obrigatórios.' })
  }

  if (senha.trim().length < 6) {
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

/*
-----------------------------------
  PATCH /api/usuarios/:id/cpf
-----------------------------------
curl -X PATCH http://localhost:3000/api/usuarios/18/cpf \
-H "Content-Type: application/json" \
-d '{"cpf":"11122233344"}'
-----------------------------------
*/
router.patch('/:id/cpf', async function (req, res) {
  const usuarioId = getIdUsuario(req.params)

  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuário inválido.' })
  }

  const { cpf } = req.body

  if (!cpf) {
    return res.status(400).json({ message: 'CPF é obrigatório.' })
  }

  try {
    const result = await updateUsuarioCpf(usuarioId, cpf)
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }
    const usuario = await findUsuarioById(result.id_usuario)
    return res.status(200).json(usuario)
  } catch (error) {
    if (error && error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'Já existe um usuário com o CPF informado.' })
    } else {
      return res.status(500).json({ message: error.message })
    }
  }
})

/*
-----------------------------------
  PATCH /api/usuarios/:id/nome
-----------------------------------
curl -X PATCH http://localhost:3000/api/usuarios/18/nome \
-H "Content-Type: application/json" \
-d '{"nome":"Anna"}'
-----------------------------------
*/
router.patch('/:id/nome', async function (req, res) {
  const usuarioId = getIdUsuario(req.params)

  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuário inválido.' })
  }

  const { nome } = req.body

  if (!nome) {
    return res.status(400).json({ message: 'Nome é obrigatório.' })
  }

  try {
    const result = await updateUsuarioNome(usuarioId, nome)
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }
    const usuario = await findUsuarioById(result.id_usuario)
    return res.status(200).json(usuario)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

/*
-----------------------------------
  PATCH /api/usuarios/:id/email
-----------------------------------
curl -X PATCH http://localhost:3000/api/usuarios/18/email \
-H "Content-Type: application/json" \
-d '{"email":"anna@test.com"}'
-----------------------------------
*/
router.patch('/:id/email', async function (req, res) {
  const usuarioId = getIdUsuario(req.params)

  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuário inválido.' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório.' })
  }

  try {
    const result = await updateUsuarioEmail(usuarioId, email)
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }
    const usuario = await findUsuarioById(result.id_usuario)
    return res.status(200).json(usuario)
  } catch (error) {
    if (error && error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'Já existe um usuário com o e-mail informado.' })
    } else {
      return res.status(500).json({ message: error.message })
    }
  }
})

/*
-----------------------------------
  PATCH /api/usuarios/:id/senha
-----------------------------------
curl -X PATCH http://localhost:3000/api/usuarios/18/senha \
-H "Content-Type: application/json" \
-d '{"senha":"11111"}'
-----------------------------------
*/
router.patch('/:id/senha', async function (req, res) {
  const usuarioId = getIdUsuario(req.params)

  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuário inválido.' })
  }

  const { senha } = req.body

  if (!senha) {
    return res.status(400).json({ message: 'É obrigatório informar a senha.' })
  }

  if (senha.trim().length < 6) {
    return res
      .status(400)
      .json({ message: 'A senha deve ter no mínimo 6 caracteres.' })
  }

  try {
    const result = await updateUsuarioSenha(usuarioId, senha)
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }
    const usuario = await findUsuarioById(result.id_usuario)
    return res.status(200).json(usuario)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

function getIdUsuario(params) {
  const usuarioId = Number(params.id)

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return null
  }

  return usuarioId
}

// PUT /api/usuarios

// DELETE /api

// GET /api

module.exports = router
