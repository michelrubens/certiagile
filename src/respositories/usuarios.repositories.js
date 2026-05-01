const pool = require('../database/db')
const { randomBytes } = require('crypto')

async function insertUsuario(client, nome, cpf, email, senha) {
  const certificadoHash = randomBytes(24).toString('hex')

  const result = await client.query(
    `INSERT INTO usuarios (nome, cpf, email, senha, certificado_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id_usuario, nome, cpf, email, certificado_hash`,
    [nome, cpf, email, senha, certificadoHash]
  )
  if (result && result.rowCount == 1) {
    return result.rows[0]
  }
  return null
}

async function findFirstModuleId(client) {
  const result = await client.query(
    `SELECT id_modulo FROM modulos ORDER BY id_modulo LIMIT 1`
  )
  if (result && result.rowCount == 1) {
    return result.rows[0]
  }
  return null
}

async function findRandomGroup(client, moduloId) {
  const result = await client.query(
    `SELECT grupo 
      FROM questoes 
      WHERE id_modulo = $1 AND grupo IS NOT null 
      GROUP BY grupo 
      ORDER BY RANDOM() 
      LIMIT 1`,
    [moduloId]
  )
  if (result && result.rowCount == 1) {
    return result.rows[0]
  }
  return null
}

async function createUsuario(nome, cpf, email, senha) {
  const client = await pool.connect()
  await client.query('BEGIN')

  const usuario = await insertUsuario(client, nome, cpf, email, senha)
  if (!usuario) {
    client.query('ROLLBACK')
    return { message: 'Erro ao criar usuário' }
  }
  const modulo = await findFirstModuleId(client)
  console.log('modulo: ', modulo)
  if (!modulo) {
    client.query('ROLLBACK')
    return { message: 'Erro ao obter primeiro módulo' }
  }
  const grupo = await findRandomGroup(client, modulo.id_modulo)
  if (!grupo) {
    client.query('ROLLBACK')
    console.log('modulo: ', modulo)
    return { message: 'Erro ao obter grupo aleatório' }
  }
  console.log('R: ', usuario.id_usuario, modulo.id_modulo, grupo.grupo)

  await client.query('COMMIT')
  client.release()

  return usuario
}

module.exports = {
  createUsuario
}
