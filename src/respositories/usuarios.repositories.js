const pool = require('../database/db')
const { randomBytes } = require('crypto')
const { hashPassword } = require('../utils/password')

async function insertUsuario(client, nome, cpf, email, senha) {
  const certificadoHash = randomBytes(24).toString('hex')
  const senhaHash = hashPassword(senha)

  const result = await client.query(
    `INSERT INTO usuarios (nome, cpf, email, senha, certificado_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id_usuario, nome, cpf, email, certificado_hash`,
    [nome, cpf, email, senhaHash, certificadoHash]
  )
  return result.rows[0] || null
}

async function findFirstModuleId(client) {
  const result = await client.query(
    `SELECT id_modulo FROM modulos ORDER BY id_modulo LIMIT 1`
  )
  return result.rows[0] || null
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
  return result.rows[0] || null
}

async function insertExame(client, moduloId, usuarioId, grupo, tentativa) {
  await client.query(
    `INSERT INTO exames (id_modulo, id_usuario, grupo, tentativa) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id_exame`,
    [moduloId, usuarioId, grupo, tentativa]
  )
}

async function createUsuario(nome, cpf, email, senha) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const usuario = await insertUsuario(client, nome, cpf, email, senha)

    const modulo = await findFirstModuleId(client)
    console.log('modulo: ', modulo)
    if (!modulo) {
      throw new Error('Erro ao obter primeiro módulo')
    }

    const grupo = await findRandomGroup(client, modulo.id_modulo)
    if (!grupo) {
      throw new Error('Erro ao obter grupo')
    }

    await insertExame(
      client,
      modulo.id_modulo,
      usuario.id_usuario,
      grupo.grupo,
      1
    )

    await client.query('COMMIT')

    return {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function updateUsuarioCpf(UsuarioId, cpf) {
  const result = await pool.query(
    `UPDATE usuarios 
      SET cpf = $1 
      WHERE id_usuario = $2
      RETURNING id_usuario`,
    [cpf, UsuarioId]
  )
  return result.rows[0] || null
}

async function findUsuarioById(usuarioId) {
  const result = await pool.query(
    `SELECT id_usuario, nome, email, cpf 
      FROM usuarios 
      WHERE id_usuario = $1`,
    [usuarioId]
  )
  return result.rows[0] || null
}

async function updateUsuarioNome(usuarioId, nome) {
  const result = await pool.query(
    `UPDATE usuarios 
      SET nome = $1 
      WHERE id_usuario = $2
      RETURNING id_usuario`,
    [nome, usuarioId]
  )
  return result.rows[0] || null
}

async function updateUsuarioEmail(usuarioId, email) {
  const result = await pool.query(
    `UPDATE usuarios 
      SET email = $1 
      WHERE id_usuario = $2
      RETURNING id_usuario`,
    [email, usuarioId]
  )
  return result.rows[0] || null
}

async function updateUsuarioSenha(usuarioId, senha) {
  const senhaHash = hashPassword(senha)

  const result = await pool.query(
    `UPDATE usuarios 
      SET senha = $1
      WHERE id_usuario = $2
      RETURNING id_usuario`,
    [senhaHash, usuarioId]
  )
  return result.rows[0] || null
}

module.exports = {
  createUsuario,
  updateUsuarioCpf,
  findUsuarioById,
  updateUsuarioNome,
  updateUsuarioEmail,
  updateUsuarioSenha
}
