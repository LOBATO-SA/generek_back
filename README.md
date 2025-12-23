# Generek Music API

Backend REST API para a aplicação de música Generek, construída com Express.js e MongoDB.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB rodando localmente na porta padrão (27017)

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
   - O arquivo `.env` já está configurado com valores padrão
   - **IMPORTANTE:** Mude o `JWT_SECRET` em produção!

3. Inicie o servidor:

**Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará rodando em: **http://localhost:3000**

## 📚 Documentação da API

### Autenticação

#### Cadastro
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "fullName": "Nome Completo",
  "userType": "listener"  // ou "artist"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### Verificar Sessão
```http
GET /api/auth/me
Authorization: Bearer <seu-token-jwt>
```

### Perfil

#### Obter Perfil
```http
GET /api/profile
Authorization: Bearer <seu-token-jwt>
```

#### Atualizar Perfil
```http
PUT /api/profile
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json

{
  "full_name": "Novo Nome",
  "avatar_url": "https://exemplo.com/avatar.jpg"
}
```

#### Upload de Avatar
```http
POST /api/profile/upload-avatar
Authorization: Bearer <seu-token-jwt>
Content-Type: multipart/form-data

avatar: <arquivo-de-imagem>
```

### Músicas

#### Upload (Artistas)
```http
POST /api/songs/upload
Authorization: Bearer <token-artista>
Content-Type: multipart/form-data

song: <arquivo-audio>
title: "Nome da Música"
genre: "Pop"
```

#### Apagar Música (Artistas)
```http
DELETE /api/songs/:id
Authorization: Bearer <token-artista>
```

#### Listar Todas
```http
GET /api/songs
```

#### Listar Minhas Músicas
```http
GET /api/songs/my-songs
Authorization: Bearer <token-artista>
```

#### Listar por Artista
```http
GET /api/songs/artist/:artistId
```

### Bio do Artista

#### Atualizar Bio (Artistas)
```http
PUT /api/artists/bio
Authorization: Bearer <token-artista>
Content-Type: application/json

{
  "genres": ["Pop", "Rock"],
  "location": "São Paulo, SP",
  "minPrice": 500,
  "about": "Sobre mim...",
  "eventTypes": ["Casamento"]
}
```

#### Ver Bio (Autenticado)
```http
GET /api/artists/bio
Authorization: Bearer <token>
```

## 🗄️ Banco de Dados

O MongoDB criará automaticamente o banco de dados `generek` com as coleções:
- `users` - Dados de autenticação
- `profiles` - Perfis dos usuários

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT
- ✅ Validação de entrada com express-validator
- ✅ CORS habilitado

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (DB)
├── controllers/     # Lógica de negócio
├── models/          # Schemas do MongoDB
├── routes/          # Definições de rotas
├── middleware/      # Middlewares (auth, validação, erros)
├── utils/           # Utilitários (JWT)
└── index.js         # Entrada da aplicação
```

## ⚙️ Variáveis de Ambiente

Configure no arquivo `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/generek
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 🧪 Testar a API

### Health Check
```bash
curl http://localhost:3000/health
```

### Exemplo com PowerShell
```powershell
$body = @{
  email="teste@exemplo.com"
  password="senha123"
  fullName="Teste User"
  userType="listener"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

## 📝 Tipos de Usuário

- `artist` - Artista/Músico
- `listener` - Ouvinte

## 🛠️ Tecnologias

- **Express.js** - Framework web
- **MongoDB** - Banco de dados
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Express Validator** - Validação de dados

## 📄 Licença

ISC

---

**Desenvolvido para Generek Music App** 🎵
