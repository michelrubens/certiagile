<div align="center"><img src="./public/assets/brand/certiagile-logo.svg"></div>

---

# CertiAgile - Portal de Certificação

O **CertiAgile** é uma plataforma em desenvolvimento focada na consolidação de conhecimentos sobre o framework **Scrum**. O objetivo principal é oferecer um ambiente prático para que profissionais testem seus conhecimentos e recebam uma certificação ao final da experiência.

⚠️ **Projeto em Desenvolvimento:** Atualmente, a aplicação encontra-se na fase de implementação da API e estruturação do banco de dados.

## 🚀 Funcionalidades

- **Gestão de Usuários:** Cadastro, autenticação (JWT) e atualização de perfil (nome, CPF, e-mail e senha).
- **Progressão por Níveis:** Banco de questões organizado em 5 níveis de dificuldade (do básico ao avançado).
- **Exames Aleatórios:** Sistema que gera provas dinâmicas com questões sorteadas do banco.
- **Banco de Questões:** Organizado por módulos e categorias de metodologias ágeis.
- **Histórico de Respostas:** Armazenamento detalhado de cada tentativa para fins de correção e nota.
- **Inicialização Automatizada:** Scripts SQL prontos para criar o schema e popular o banco de dados (seeds).

## 🛠️ Tecnologias Utilizadas

### Backend

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **Autenticação:** JWT (JSON Web Token)

### Frontend (Em Breve)

- **Linguagem:** Javascript (Vanilla)
- **Estilização:** CSS3 e HTML5

## 🔮 Próximos Passos (Roadmap)

- [ ] **Interface Web:** Desenvolvimento de front-end sem frameworks (JS/HTML/CSS).
- [ ] **Emissão de Certificados:** Geração de certificados digitais em PDF com base no desempenho do aluno.
- [ ] **Dashboards:** Visualização gráfica do progresso do usuário nos níveis de certificação.

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- Gerenciador de pacotes (NPM ou Yarn)

## 🔧 Instalação e Configuração

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/michelrubens/certiagile.git
   cd certiagile
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configuração do Ambiente:**
   Crie um arquivo `.env` na raiz do projeto e configure as credenciais do seu banco de dados:

   ```ini
   DB_USER=seu_usuario
   DB_HOST=localhost
   DB_NAME=certiagile
   DB_PASSWORD=sua_senha
   DB_PORT=5432
   JWT_SECRET=sua_chave_secreta
   ```

4. **Inicialização do Banco de Dados:**
   O projeto possui um script automatizado para criar as tabelas e inserir os dados iniciais (módulos e questões):
   ```bash
   node src/infra/run-sql.js
   ```

## 🚦 Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## 🔌 API Endpoints

### Autenticação

- `POST /api/auth/login` - Realiza login e retorna o token JWT.

### Usuários

- `POST /api/usuarios` - Cadastro de novo usuário.
- `PATCH /api/usuarios/nome` - Atualiza o nome (Requer Token).
- `PATCH /api/usuarios/cpf` - Atualiza o CPF (Requer Token).
- `PATCH /api/usuarios/email` - Atualiza o e-mail (Requer Token).
- `PATCH /api/usuarios/senha` - Atualiza a senha (Requer Token).

### Questões

- `GET /api/questoes/proxima-questao` - Busca a próxima questão pendente do questionário (Requer Token).
- `POST /api/questoes/responder` - Registra a resposta de uma questão (Requer Token).

## 📂 Estrutura de Pastas

```text
src/
 ├── database/      # Configuração da conexão com o banco
 ├── infra/         # Scripts de migração e seeds (SQL)
 ├── middlewares/   # Middlewares de autenticação e erro
 ├── repositories/  # Lógica de persistência de dados
 ├── routes/        # Definição das rotas da API
 └── server.js      # Ponto de entrada da aplicação
```

<!-- ## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---
Desenvolvido com ❤️ para a comunidade Ágil. -->
