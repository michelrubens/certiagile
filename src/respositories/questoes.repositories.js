const pool = require('../database/db')

async function findProximaQuestaoByUsuario(usuarioId) {
  const result = await pool.query(
    `
      WITH exame_atual AS ( 
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
      LIMIT 1
    `,
    [usuarioId]
  )
  return result.rows[0] || null
}

async function findQuestaoDoExameByUsuario(idUsuario, idExame, idQuestao) {
  const result = await pool.query(
    `
      SELECT 
        e.id_exame, 
        q.id_questao, 
        q.alternativa_correta 
      FROM exames e 
      INNER JOIN questoes q 
        ON q.id_modulo = e.id_modulo 
        AND q.grupo IS NOT DISTINCT FROM e.grupo 
      WHERE e.id_usuario = $1 
        AND e.id_exame = $2 
        AND q.id_questao = $3 
      LIMIT 1 
      `,
    [idUsuario, idExame, idQuestao]
  )
  return result.rows[0] || null
}

async function findRespostaByExameEQuestao(idExame, idQuestao) {
  const result = await pool.query(
    `
      SELECT 
        id_resposta, 
        id_exame, 
        id_questao, 
        resposta, 
        nota, 
        respondido_em 
      FROM respostas 
      WHERE id_exame = $1 
        AND id_questao = $2 
      LIMIT 1
    `,
    [idExame, idQuestao]
  )
  return result.rows[0] || null
}

async function inserirRespostaQuestao(id_exame, id_questao, resposta, nota) {
  const result = await pool.query(
    `
      INSERT INTO respostas (id_exame,id_questao,resposta,nota) 
      VALUES ($1,$2,$3,$4) 
      RETURNING id_resposta, id_exame, id_questao, nota
    `,
    [id_exame, id_questao, resposta, nota]
  )

  return result.rows[0] || null
}

async function usuarioConcluiuModuloAtual(usuarioId) {
  const result = await pool.query(
    `
      WITH exame_atual AS ( 
        SELECT id_exame, id_modulo, grupo 
        FROM exames 
        WHERE id_usuario = $1 
        ORDER BY id_exame DESC 
        LIMIT 1 
      ) 
      SELECT NOT EXISTS ( 
        SELECT 1 
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
      ) AS concluido
    `,
    [usuarioId]
  )
  return result.rows[0]?.concluido || false
}

async function findModuloAtualByUsuario(usuarioId) {
  const result = await pool.query(
    `
      SELECT 
        e.id_exame, 
        e.id_modulo, 
        m.titulo,
        e.grupo, 
        e.tentativa
      FROM exames e 
      INNER JOIN modulos m 
        ON m.id_modulo = e.id_modulo 
      WHERE e.id_usuario = $1 
      ORDER BY e.id_exame DESC 
      LIMIT 1
    `,
    [usuarioId]
  )
  return result.rows[0] || null
}

async function findOutroGrupoAleatorio(usuarioId, moduloId) {
  const result = await pool.query(
    `
      SELECT q.grupo 
      FROM questoes q
      WHERE q.id_modulo = $1 
        AND q.grupo IS NOT NULL
        AND q.grupo NOT IN (
          SELECT e.grupo 
          FROM exames e 
          WHERE e.id_usuario = $2 
            AND e.id_modulo = $1
        )
      GROUP BY q.grupo 
      ORDER BY RANDOM() 
      LIMIT 1
    `,
    [moduloId, usuarioId]
  )
  return result.rows[0]?.grupo || null
}

async function insertProximaTentativa(idExame, grupo, tentativa) {
  // Busca o exame atual para pegar id_modulo e id_usuario
  const exameAtual = await pool.query(
    `SELECT id_modulo, id_usuario FROM exames WHERE id_exame = $1`,
    [idExame]
  )
  const { id_modulo, id_usuario } = exameAtual.rows[0]

  const result = await pool.query(
    `INSERT INTO exames (id_modulo, id_usuario, grupo, tentativa)
     VALUES ($1, $2, $3, $4)
     RETURNING id_exame, id_modulo, grupo, tentativa`,
    [id_modulo, id_usuario, grupo, tentativa]
  )
  return result.rows[0] || null
}

async function findProximoModuloByUsuario(idUsuario) {
  const result = await pool.query(
    `
      WITH modulo_atual AS ( 
        SELECT id_modulo 
        FROM exames 
        WHERE id_usuario = $1 
        ORDER BY id_exame DESC 
        LIMIT 1 
      ) 
      SELECT 
        m.id_modulo, 
        m.titulo 
      FROM modulos m 
      INNER JOIN modulo_atual ma 
        ON m.id_modulo > ma.id_modulo 
      ORDER BY m.id_modulo ASC 
      LIMIT 1 
    `,
    [idUsuario]
  )

  return result.rows[0]?.id_modulo || null
}

async function insertProximoModulo(idExame, modulo, grupo, tentativa) {
  const exameAtual = await pool.query(
    `SELECT id_usuario FROM exames WHERE id_exame = $1`,
    [idExame]
  )
  const { id_usuario } = exameAtual.rows[0]

  const result = await pool.query(
    `INSERT INTO exames (id_modulo, id_usuario, grupo, tentativa)
     VALUES ($1, $2, $3, $4)
     RETURNING id_exame, id_modulo, id_usuario, grupo, tentativa`,
    [modulo, id_usuario, grupo, tentativa]
  )
  return result.rows[0] || null
}

async function findExamesByUsuario(usuarioId) {
  const result = await pool.query(
    `
      SELECT 
        e.id_modulo AS nivel,
        COUNT(DISTINCT e.id_exame) AS tentativas_iniciadas,
        COUNT(DISTINCT CASE 
          WHEN (
            SELECT COUNT(*) FROM respostas r2 WHERE r2.id_exame = e.id_exame
          ) = (
            SELECT COUNT(*) FROM questoes q2 
            WHERE q2.id_modulo = e.id_modulo 
            AND q2.grupo IS NOT DISTINCT FROM e.grupo
          ) THEN e.id_exame 
        END) AS tentativas_usadas,
        COALESCE(MAX(score.pct), 0) AS melhor_nota,
        BOOL_OR(
          (
            SELECT COUNT(*) FROM respostas r2 WHERE r2.id_exame = e.id_exame
          ) = (
            SELECT COUNT(*) FROM questoes q2 
            WHERE q2.id_modulo = e.id_modulo 
            AND q2.grupo IS NOT DISTINCT FROM e.grupo
          )
        ) AS aprovado
      FROM exames e
      LEFT JOIN (
        SELECT 
          r.id_exame,
          ROUND((SUM(r.nota)::numeric / NULLIF(COUNT(r.id_questao), 0)) * 100) AS pct
        FROM respostas r
        INNER JOIN exames ex ON ex.id_exame = r.id_exame
        INNER JOIN questoes q 
          ON q.id_modulo = ex.id_modulo 
          AND q.grupo IS NOT DISTINCT FROM ex.grupo
        GROUP BY r.id_exame
        HAVING COUNT(DISTINCT r.id_questao) = COUNT(DISTINCT q.id_questao)
      ) score ON score.id_exame = e.id_exame
      WHERE e.id_usuario = $1
      GROUP BY e.id_modulo
      ORDER BY e.id_modulo
    `,
    [usuarioId]
  )
  return result.rows
}

async function countQuestoesRespondidasByUsuario(usuarioId) {
  const result = await pool.query(
    `
      WITH primeiro_exame_por_modulo AS (
        SELECT DISTINCT ON (id_modulo) id_exame
        FROM exames
        WHERE id_usuario = $1
        ORDER BY id_modulo, id_exame ASC  -- 👈 ASC pega o primeiro
      )
      SELECT COUNT(r.id_resposta) as total
      FROM respostas r
      INNER JOIN primeiro_exame_por_modulo p ON p.id_exame = r.id_exame
    `,
    [usuarioId]
  )
  return Number(result.rows[0]?.total ?? 0)
}

async function findModulosRespondidosByUsuario(idUsuario) {
  const result = await pool.query(
    ` 
      WITH tentativas AS ( 
        SELECT 
          q.id_modulo, 
          q.grupo, 
          MIN(r.respondido_em) AS inicio, 
          MAX(r.respondido_em) AS fim, 
          COUNT(DISTINCT r.id_questao)::INTEGER AS questoes_respondidas, 
          COALESCE(SUM(r.nota), 0)::INTEGER AS nota 
        FROM respostas r 
        INNER JOIN exames e 
          ON e.id_exame = r.id_exame 
        INNER JOIN questoes q 
          ON q.id_questao = r.id_questao 
        WHERE e.id_usuario = $1 
        GROUP BY 
          q.id_modulo, 
          q.grupo 
      ) 
      SELECT 
        t.id_modulo, 
        t.inicio, 
        t.fim, 
        t.questoes_respondidas, 
        COUNT(q.id_questao)::INTEGER AS questoes, 
        t.nota, 
        ROW_NUMBER() OVER ( 
          PARTITION BY t.id_modulo 
          ORDER BY t.inicio ASC 
        )::INTEGER AS tentativa 
      FROM tentativas t 
      INNER JOIN questoes q 
        ON q.id_modulo = t.id_modulo 
      AND q.grupo IS NOT DISTINCT FROM t.grupo 
      GROUP BY 
        t.id_modulo, 
        t.grupo, 
        t.inicio, 
        t.fim, 
        t.questoes_respondidas, 
        t.nota 
      ORDER BY 
        t.id_modulo ASC, 
        tentativa ASC 
    `,

    [idUsuario]
  )

  return result.rows
}

module.exports = {
  findProximaQuestaoByUsuario,
  findQuestaoDoExameByUsuario,
  findRespostaByExameEQuestao,
  inserirRespostaQuestao,
  usuarioConcluiuModuloAtual,
  findModuloAtualByUsuario,
  findOutroGrupoAleatorio,
  insertProximaTentativa,
  findProximoModuloByUsuario,
  insertProximoModulo,
  findExamesByUsuario,
  countQuestoesRespondidasByUsuario,
  findModulosRespondidosByUsuario
}
