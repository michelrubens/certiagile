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
  .getElementById('form-login')
  .addEventListener('submit', async function (e) {
    e.preventDefault()

    const cpf = document.getElementById('cpf').value.replace(/\D/g, '')
    const senha = document.getElementById('password').value

    if (!cpf || !senha) {
      alert('Preencha o CPF e a senha.')
      return
    }
    if (cpf.length !== 11) {
      alert('CPF inválido.')
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha })
      })

      const data = await response.json()

      if (response.ok) {
        // Salva o token para uso nas próximas requisições
        localStorage.setItem('token', data.token)
        window.location.href = '/painel'
      } else {
        alert(data.message || 'CPF ou senha incorretos.')
      }
    } catch (err) {
      alert('Não foi possível conectar ao servidor.')
      console.error(err)
    }
  })
