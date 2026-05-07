// avaliacao.js

const LETRAS = ['a', 'b', 'c', 'd']
const LETRA_LABELS = ['A', 'B', 'C', 'D']
const TOTAL_QUESTOES = 10

let exameAtual = null // { id_exame, id_modulo, titulo, grupo, tentativa }
let questaoAtual = null // dados da questão atual
let questaoIndex = 0 // quantas questões já foram respondidas
let respondida = false // se a questão atual já foi respondida

// ── Estados ───────────────────────────────────────────
function mostrarEstado(id) {
  document
    .querySelectorAll('.state')
    .forEach((el) => el.classList.add('hidden'))
  document.getElementById(id).classList.remove('hidden')
}

// ── Top Bar ───────────────────────────────────────────
function renderTopbar(modulo, tentativa) {
  document.getElementById('topbar-meta').innerHTML = `
    <span class="topbar-nivel">Nível ${modulo?.id_modulo ?? '—'} — ${modulo?.titulo ?? ''}</span>
    <span class="topbar-tentativa">Tentativa ${tentativa ?? '—'} de 2</span>
  `
}

// ── Progresso ─────────────────────────────────────────
function atualizarProgresso(respondidas) {
  const pct = Math.round((respondidas / TOTAL_QUESTOES) * 100)
  document.getElementById('progress-bar-fill').style.width = `${pct}%`
  const questaoBadge = document.getElementById('questao-badge')
  if (respondidas < TOTAL_QUESTOES) {
    questaoBadge.textContent = `Questão ${respondidas + 1} de ${TOTAL_QUESTOES}`
  } else {
    questaoBadge.textContent = `Avaliação Concluída`
  }
}

// ── Renderiza questão ─────────────────────────────────
function renderQuestao(questao, index) {
  respondida = false

  // Dificuldade
  const difEl = document.getElementById('questao-dificuldade')
  const difMap = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' }
  difEl.textContent = difMap[questao.dificuldade] ?? questao.dificuldade
  difEl.className = `questao-dificuldade ${questao.dificuldade}`

  // Enunciado
  document.getElementById('questao-enunciado').textContent = questao.enunciado

  // Imagem
  const imgWrap = document.getElementById('questao-imagem-wrap')
  if (questao.imagem) {
    document.getElementById('questao-imagem').src =
      `/assets/images/${questao.imagem}`
    imgWrap.classList.remove('hidden')
  } else {
    imgWrap.classList.add('hidden')
  }

  // Alternativas
  const container = document.getElementById('alternativas')
  container.innerHTML = ''
  LETRAS.forEach((letra, i) => {
    const texto = questao[`alternativa_${letra}`]
    if (!texto) return

    const btn = document.createElement('button')
    btn.className = 'alternativa'
    btn.dataset.letra = letra
    btn.innerHTML = `
      <span class="alternativa-letra">${LETRA_LABELS[i]}</span>
      <span class="alternativa-texto">${texto}</span>
    `
    btn.addEventListener('click', () => responder(questao, letra))
    container.appendChild(btn)
  })

  // Esconde feedback e botão próxima
  document.getElementById('feedback').classList.add('hidden')
  document.getElementById('btn-proximo').classList.add('hidden')

  atualizarProgresso(index)
  mostrarEstado('state-questao')
}

// ── Responder ─────────────────────────────────────────
async function responder(questao, letraSelecionada) {
  if (respondida) return
  respondida = true

  // Desabilita todas as alternativas
  document
    .querySelectorAll('.alternativa')
    .forEach((btn) => (btn.disabled = true))

  // Marca a selecionada
  const btnSelecionado = document.querySelector(
    `.alternativa[data-letra="${letraSelecionada}"]`
  )
  btnSelecionado?.classList.add('selecionada')

  try {
    const res = await apiFetch('/api/questoes/responder', {
      method: 'POST',
      body: JSON.stringify({
        id_exame: questao.id_exame,
        id_questao: questao.id_questao,
        resposta: letraSelecionada
      })
    })

    if (!res) return // apiFetch já redirecionou para login

    const data = await res.json()
    const acertou = data.nota === 1

    // Mostra acerto/erro na alternativa
    btnSelecionado?.classList.remove('selecionada')
    btnSelecionado?.classList.add(acertou ? 'correta' : 'errada')

    // Feedback
    const feedbackEl = document.getElementById('feedback')
    const feedbackIcon = document.getElementById('feedback-icon')
    const feedbackTexto = document.getElementById('feedback-texto')

    feedbackEl.className = `feedback ${acertou ? 'acerto' : 'erro'}`
    feedbackIcon.innerHTML = `<span class="material-symbols-outlined">${acertou ? 'check_circle' : 'cancel'}</span>`
    feedbackTexto.textContent = acertou
      ? 'Resposta correta!'
      : 'Resposta incorreta.'
    feedbackEl.classList.remove('hidden')

    questaoIndex++

    // Verifica proximo_estado retornado pelo back
    const proximoEstado = data.proximo_estado

    if (proximoEstado?.status === 'todos_modulos_concluidos') {
      atualizarProgresso(TOTAL_QUESTOES) // Garante 100%
      setTimeout(() => mostrarConcluido('todos'), 1500)
      return
    }

    if (proximoEstado?.status === 'proximo_modulo_desbloqueado') {
      atualizarProgresso(TOTAL_QUESTOES) // Garante 100%
      setTimeout(() => mostrarConcluido('modulo'), 1500)
      return
    }

    if (proximoEstado?.status === 'modulo_concluido') {
      atualizarProgresso(TOTAL_QUESTOES) // Garante 100%
      setTimeout(() => mostrarConcluido('tentativa'), 1500)
      return
    }

    // Ainda tem questões — mostra botão próxima
    document.getElementById('btn-proximo').classList.remove('hidden')
  } catch (err) {
    console.error('Erro ao responder:', err)
    mostrarErro('Erro ao registrar resposta. Tente novamente.')
  }
}

// ── Próxima questão ───────────────────────────────────
document
  .getElementById('btn-proximo')
  .addEventListener('click', carregarQuestao)

// ── Carregar questão ──────────────────────────────────
async function carregarQuestao() {
  mostrarEstado('state-loading')

  try {
    const res = await apiFetch('/api/questoes/proxima-questao')
    if (!res) return

    if (res.status === 404) {
      // Não há mais questões — avaliação concluída
      atualizarProgresso(TOTAL_QUESTOES) // Garante 100%
      mostrarConcluido('tentativa')
      return
    }

    const questao = await res.json()
    questaoAtual = questao
    renderQuestao(questao, questaoIndex)
  } catch (err) {
    console.error('Erro ao carregar questão:', err)
    mostrarErro('Não foi possível carregar a próxima questão.')
  }
}

// ── Concluído ─────────────────────────────────────────
function mostrarConcluido(tipo) {
  const title = document.getElementById('concluido-title')
  const sub = document.getElementById('concluido-sub')

  if (tipo === 'todos') {
    title.textContent = 'Parabéns! Todos os níveis concluídos!'
    sub.textContent =
      'Você completou todos os 5 níveis. Acesse o painel para emitir seu certificado.'
  } else if (tipo === 'modulo') {
    title.textContent = 'Nível concluído!'
    sub.textContent =
      'Você concluiu este nível. O próximo já está disponível no painel.'
  } else {
    title.textContent = 'Avaliação finalizada!'
    sub.textContent =
      'Suas respostas foram registradas. Acesse o painel para ver seu resultado.'
  }

  mostrarEstado('state-concluido')
}

// ── Erro ──────────────────────────────────────────────
function mostrarErro(msg) {
  document.getElementById('erro-msg').textContent = msg
  mostrarEstado('state-erro')
}

// ── Init ──────────────────────────────────────────────
async function init() {
  try {
    // Pega módulo atual para o topbar
    const res = await apiFetch('/api/questoes/modulo-atual')
    if (res && res.ok) {
      const modulo = await res.json()
      exameAtual = modulo
      questaoIndex = modulo.respondidas || 0
      renderTopbar(modulo, modulo.tentativa)
    }
  } catch (err) {
    // Se falhar não bloqueia — apenas não mostra o topbar
    console.warn('Módulo atual não carregado:', err)
  }

  carregarQuestao()
}

init()
