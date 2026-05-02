const { Router } = require('express')
const {
  findProximaQuestaoByUsuario
} = require('../respositories/questoes.repositories')
const authMiddleware = require('../middlewares/auth.middleware')

const router = Router()

/*
-----------------------------------
  GET /api/questoes/proxima-questao
-----------------------------------
curl -X GET http://localhost:3000/api/questoes/proxima-questao \
-H "Authorization: Bearer SEU_TOKEN"
-----------------------------------
*/
router.get('/proxima-questao', authMiddleware, async function (req, res) {
  try {
    const questao = await findProximaQuestaoByUsuario(req.usuario.id_usuario)

    if (!questao) {
      return res
        .status(404)
        .json({ message: 'Nenhuma questão pendente encontrada.' })
    }
    return res.status(200).json(questao)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

module.exports = router
