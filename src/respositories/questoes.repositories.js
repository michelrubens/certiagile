const pool = require('../database/db')

async function findProximaQuestaoByUsuario(usuarioId) {
  const result = await pool.query(
    `WITH exame_atual AS ( 
      SELECT id_exame, id_modulo, grupo 
      FROM exames 
      WHERE id_usuario = $1 
      ORDER BY id_exame DESC 
      LIMIT 1 
    ) 
    SELECT 
      e.id_exame, 
      q.id_questao, 
      q.id_modulo, 
      q.grupo, 
      q.numero, 
      q.dificuldade, 
      q.enunciado, 
      q.alternativa_a, 
      q.alternativa_b, 
      q.alternativa_c, 
      q.alternativa_d, 
      q.imagem 
    FROM exame_atual e 
    INNER JOIN questoes q 
      ON q.id_modulo = e.id_modulo 
     AND q.grupo IS NOT DISTINCT FROM e.grupo 
    WHERE NOT EXISTS ( 
      SELECT 1 
      FROM respostas r 
      WHERE r.id_exame = e.id_exame 
        AND r.id_questao = q.id_questao 
    ) 
    ORDER BY q.numero ASC NULLS LAST, q.id_questao ASC 
    LIMIT 1`,
    [usuarioId]
  )
  return result.rows[0] || null
}

module.exports = {
  findProximaQuestaoByUsuario
}
