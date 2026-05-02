// Máscara de CPF
document.getElementById('cpf').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11)

  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1.$2')

  this.value = v
})

// Submit
document
  .getElementById('form-cadastro')
  .addEventListener('submit', async function (e) {
    e.preventDefault()

    const nome = document.getElementById('name').value.trim()
    const email = document.getElementById('email').value.trim()
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '')
    const senha = document.getElementById('password').value
    const confirmSenha = document.getElementById('confirm-password').value
    const terms = document.getElementById('terms').checked

    // Validações no front
    if (!nome || !email || !cpf || !senha || !confirmSenha) {
      alert('Preencha todos os campos.')
      return
    }
    if (cpf.length !== 11) {
      alert('CPF inválido.')
      return
    }
    if (senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (senha !== confirmSenha) {
      alert('As senhas não coincidem.')
      return
    }
    if (!terms) {
      alert('Você precisa aceitar os termos para continuar.')
      return
    }

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, email, senha })
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = '/login.html'
      } else {
        alert(data.message || 'Erro ao cadastrar. Tente novamente.')
      }
    } catch (err) {
      alert('Não foi possível conectar ao servidor.')
      console.error(err)
    }
  })
