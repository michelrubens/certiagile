// painel.js — carrega dados do usuário e renderiza o painel

const NIVEL_LABELS = ['Básico', 'Intermediário', 'Avançado', 'Expert', 'Master']
const NIVEL_DESCS = [
  'Fundamentos das metodologias ágeis',
  'Práticas e frameworks ágeis',
  'Scrum avançado e liderança',
  'Gestão ágil de produtos',
  'Agile Leadership e transformação'
]

async function init() {
  try {
    // Dados do usuário logado
    const resUsuario = await apiFetch('/api/usuarios/me')
    if (!resUsuario) return
    const usuario = await resUsuario.json()

    // Exames do usuário
    const resExames = await apiFetch('/api/exames')
    if (!resExames) return
    const exames = await resExames.json()
    console.log('exames:', exames)

    // Progresso do usuário
    const resProgresso = await apiFetch('/api/questoes/progresso')
    if (!resProgresso) return
    const progresso = await resProgresso.json()

    renderPerfil(usuario, exames)
    renderProgresso(exames, progresso)
    renderNiveis(exames, usuario.nivel_atual ?? 1, progresso.respondidas)
  } catch (err) {
    console.error('Erro ao carregar painel:', err)
  }
}

function renderPerfil(usuario, exames) {
  const cpfFormatado = usuario.cpf
    ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '—'

  // Cada nível tem 2 tentativas máximas
  // As tentativas restantes referem-se apenas ao nível atual, pois níveis anteriores são bloqueados ao avançar.
  const nivelAtivo = Number(usuario.nivel_atual ?? 1)
  const exameAtual = exames.find((e) => Number(e.nivel) === nivelAtivo)

  const tentativasUsadasNoNivel = Number(exameAtual?.tentativas_usadas ?? 0)
  const totalRestantes = Math.max(0, 2 - tentativasUsadasNoNivel)

  const totalConcluidos = exames.filter((e) => e.aprovado).length

  document.getElementById('sidebar-nome').textContent =
    usuario.nome?.split(' ')[0] ?? '—'
  document.getElementById('sidebar-nivel').textContent =
    usuario.nivel_atual ?? '—'
  document.getElementById('profile-nome').textContent = usuario.nome ?? '—'
  document.getElementById('profile-cpf').textContent = `CPF: ${cpfFormatado}`
  document.getElementById('profile-nivel-tag').textContent =
    `Nível ${usuario.nivel_atual ?? '—'}`
  document.getElementById('stat-tentativas').textContent = totalRestantes
  document.getElementById('label-tentativas').textContent =
    totalRestantes === 1 ? 'Tentativa' : 'Tentativas'
  document.getElementById('label-restantes').textContent =
    totalRestantes === 1 ? 'Restante' : 'Restantes'

  // Pinta as bolinhas: de acordo com o requisito, a cor verde (classe 'usada')
  // deve representar a quantidade de tentativas restantes (stat-value).
  const dots = document.querySelectorAll('#tentativas-dots .dot')
  dots.forEach((dot, i) => {
    dot.classList.toggle('usada', i < totalRestantes)
  })

  document.getElementById('stat-aprovacoes').textContent = totalConcluidos
  document.getElementById('label-niveis').textContent =
    totalConcluidos === 1 ? 'Nível' : 'Níveis'
  document.getElementById('label-concluidos').textContent =
    totalConcluidos === 1 ? 'Concluído' : 'Concluídos'
}

function renderProgresso(exames, progresso) {
  const circumference = 2 * Math.PI * 70
  const { respondidas, total } = progresso
  const pct = Math.round((respondidas / total) * 100)

  const offset = circumference - (pct / 100) * circumference
  document.getElementById('ring-fill').style.strokeDashoffset = offset
  document.getElementById('ring-pct').textContent = `${pct}%`

  const aprovados = exames.filter((e) => e.aprovado).length
  document.getElementById('progress-hint').textContent =
    aprovados === 5
      ? 'Parabéns! Você concluiu todos os níveis.'
      : `${respondidas} de ${total} questões respondidas — ${aprovados} de 5 níveis concluídos.`
}

function renderNiveis(exames, nivelAtual, respondidas) {
  const grid = document.getElementById('levels-grid')
  grid.innerHTML = ''

  // Encontra o maior nível que já possui registro de exame para determinar o progresso atual
  const ultimoNivelComExame =
    exames.length > 0 ? Math.max(...exames.map((e) => Number(e.nivel))) : 1

  for (let i = 1; i <= 5; i++) {
    const exame = exames.find((e) => Number(e.nivel) === i)
    const isUltimo = i === ultimoNivelComExame

    let estado = 'bloqueado'
    let badgeLabel = 'Bloqueado'
    let icon = 'lock'

    // Se o exame existe, mostra o status real (Concluído ou Em Progresso)
    if (exame) {
      if (exame.aprovado) {
        estado = 'concluido'
        badgeLabel = 'Concluído'
        icon = 'verified'
      } else {
        estado = 'em-progresso'
        badgeLabel = 'Em progresso'
        icon = 'pending'
      }
    }

    const iconFill =
      estado === 'concluido' ? `style="font-variation-settings:'FILL' 1"` : ''

    const melhorNota =
      exame?.melhor_nota != null ? `${exame.melhor_nota}%` : '—'

    const tentativasUsadas = Number(exame?.tentativas_usadas ?? 0)
    const tentativasIniciadas = Number(exame?.tentativas_iniciadas ?? 0)
    const tentativasMax = 2
    const temAndamento = tentativasIniciadas > tentativasUsadas

    let footerHTML = ''

    if (isUltimo) {
      if (estado === 'em-progresso') {
        // Lógica Iniciar vs Continuar:
        // Se é o nível 1 e respondidas é 0, ou se é um nível superior e o usuário acabou de chegar (usadas=0)
        const totalRespondidasAnteriores = (i - 1) * 10
        const label =
          tentativasUsadas === 0 && respondidas <= totalRespondidasAnteriores
            ? 'Iniciar Avaliação'
            : 'Continuar Avaliação'

        footerHTML = `
          <button class="btn-level primary" onclick="window.location.href='/avaliacao'">
            ${label}
          </button>`
      } else if (estado === 'concluido') {
        let actionsHTML = ''

        if (temAndamento) {
          // Se o nível já foi aprovado mas há uma nova tentativa em curso
          actionsHTML += `
            <button class="btn-level primary" onclick="window.location.href='/avaliacao'">
              Continuar Avaliação
            </button>`
        } else {
          // Botão Nova Tentativa (se disponível)
          if (tentativasUsadas < tentativasMax) {
            actionsHTML += `
              <button class="btn-level outline-green" onclick="iniciarNovaTentativa()">
                Fazer nova tentativa
              </button>`
          }

          // Botão Avançar ou Finalizar
          if (i < 5) {
            actionsHTML += `
              <button class="btn-level outline-advance" onclick="avancarNivel()">
                Próximo Nível
              </button>`
          } else {
            actionsHTML += `
              <button class="btn-level primary" onclick="finalizarAvaliacao()">
                Finalizar Avaliação
              </button>`
          }
        }

        footerHTML = `
        <span class="nivel-concluido-label">
          <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1">check_circle</span>
          Nível concluído
        </span>
        <div class="level-actions">${actionsHTML}</div>`
      }
    } else if (estado === 'concluido') {
      // Para níveis anteriores já finalizados, mostramos apenas o label sem botões
      footerHTML = `
        <span class="nivel-concluido-label">
          <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1">check_circle</span>
          Nível concluído
        </span>`
    }

    let statsHTML = ''
    if (estado !== 'bloqueado') {
      statsHTML = `
        <div class="level-stats">
          <div class="level-stat-row">
            <span>Melhor Nota</span>
            <span class="${estado === 'concluido' ? 'val-green' : ''}">${melhorNota}</span>
          </div>
          <div class="level-stat-row">
            <span>${estado === 'concluido' ? 'Tentativas' : 'Tentativas Restantes'}</span>
            <span class="${estado === 'em-progresso' && tentativasUsadas >= 1 ? 'val-yellow' : ''}">
              ${estado === 'concluido' ? `${tentativasUsadas} / ${tentativasMax}` : tentativasMax - tentativasUsadas}
            </span>
          </div>
        </div>`
    } else {
      statsHTML = `
        <p style="font-size:.75rem;color:var(--color-secondary);line-height:1.5">
          Conclua o nível anterior para desbloquear este.
        </p>
        <div class="level-progress-bar">
          <div class="bar-track"><div class="bar-fill" style="width:0%"></div></div>
          <span style="font-size:.6rem;font-weight:700;color:var(--color-secondary);text-transform:uppercase;letter-spacing:.05em;margin-top:4px;display:block">
            BLOQUEADO
          </span>
        </div>`
    }

    grid.innerHTML += `
      <div class="level-card ${estado}">
        <div class="level-card-header">
          <div class="level-icon ${estado}">
            <span class="material-symbols-outlined" ${iconFill}>${icon}</span>
          </div>
          <span class="level-badge ${estado}">${badgeLabel}</span>
        </div>
        <p class="level-name">Nível ${i} — ${NIVEL_LABELS[i - 1]}</p>
        <p class="level-desc">${NIVEL_DESCS[i - 1]}</p>
        ${statsHTML}
        ${footerHTML}
      </div>`
  }
}

// Logout
document.getElementById('btn-logout').addEventListener('click', function () {
  localStorage.removeItem('token')
  window.location.href = '/login'
})

async function avancarNivel() {
  try {
    const res = await apiFetch('/api/questoes/pular-tentativa', {
      method: 'PATCH'
    })
    const data = await res.json()
    console.log('pular-tentativa:', res.status, data)

    if (res.ok) {
      window.location.reload()
    } else {
      alert(data.message || 'Não foi possível avançar.')
    }
  } catch (err) {
    console.error('Erro ao avançar nível:', err)
    alert('Não foi possível avançar. Tente novamente.')
  }
}

async function iniciarNovaTentativa() {
  try {
    const res = await apiFetch('/api/questoes/proxima-tentativa', {
      method: 'PATCH'
    })

    if (res.ok) {
      window.location.href = '/avaliacao'
    } else {
      const data = await res.json()
      alert(data.message || 'Erro ao iniciar nova tentativa.')
    }
  } catch (err) {
    console.error('Erro ao iniciar nova tentativa:', err)
  }
}

function finalizarAvaliacao() {
  alert(
    'Parabéns! Você concluiu a certificação CertiAgile. Verifique seu painel para emitir seu certificado.'
  )
}

init()
