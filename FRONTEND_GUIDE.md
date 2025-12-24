# Guia de Implementação Frontend - Generek Music

Este guia detalha como integrar o frontend (React/Next.js/Vue) com a API do Generek.

## 🔗 Configuração Básica

**Base URL API:** `http://localhost:3000/api`

### Cabeçalhos Padrão
Para rotas autenticadas, você **deve** enviar o token JWT no header:
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Token recebido no login/signup
};
```

---

## 🔐 1. Autenticação & Sessão

### Fluxo de Login
1. Envie `POST /api/auth/login`.
2. Receba o objeto `session`.
3. **Armazene** o `session.access_token` (localStorage/Context).
4. Armazene o `user` e `profile` para exibir nome/avatar no header.

### Verificar Sessão (Ao carregar a página)
Sempre verifique se o token ainda é válido ao iniciar o app:
- Chame `GET /api/auth/me`.
- Se der erro (401), deslogue o usuário (limpe o storage).

---

---

## 🎵 2. Player de Música e Busca (Atualizado)

### Listar e Buscar Músicas
**GET** `/api/songs`

O endpoint recupera músicas e injeta automaticamente a capa (`cover_url`). Se a música não tiver capa, ele usa o avatar do artista.

- **Filtros (Query Params):**
  - `search`: Título da música (ex: "My Song").
  - `genre`: Gênero (ex: "Pop").
  - `artist`: Nome do Artista (ex: "Michael").
  
**Exemplo de Resposta:**
```json
{
  "songs": [
    {
      "id": "uuid",
      "title": "Minha Canção",
      "file_url": "https://...",
      "cover_url": "https://...", // Prioridade: Capa da Música > Avatar do Artista > Placeholder
      "artist_id": {
        "full_name": "Nome do Artista"
      }
    }
  ]
}
```

### Reprodução
As músicas retornadas pela API possuem um campo `file_url`. Este é um link direto de streaming (CDN).

```jsx
// Exemplo React
<audio controls>
  <source src={song.file_url} type="audio/mpeg" />
</audio>
```

### Upload de Música (Artistas)
Use `FormData` para enviar o arquivo.

```javascript
const formData = new FormData();
formData.append('song', fileInput.files[0]);
formData.append('title', 'Minha Música');
formData.append('genre', 'Pop');

await axios.post('/api/songs/upload', formData, {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data' 
  }
});
```

---

## 🎤 3. Catálogo e Perfil de Artistas (Novo)

### Listagem de Artistas (Marketplace)
**GET** `/api/artists`
- **Filtros (Query Params):**
  - `search`: Busca por nome, local ou gênero.
  - `genre`: Filtra por gênero específico (ex: "Jazz").
  - `limit` & `offset`: Paginação.
- **Resposta:** Um objeto contendo `{ artists: [], total: number }`.

### Perfil Completo
**GET** `/api/artists/:id`
- Retorna detalhes completos: `honly_rate`, `bio`, `about`, `top_songs` (últimas 5 músicas), e `available_events`.
- Use esse endpoint ao clicar em um card de artista.

---

## 📅 4. Sistema de Contratação (Booking - Atualizado)

> **Atenção:** Os parâmetros de criação agora aceitam **snake_case** para facilitar a integração.

### Criar Solicitação (Ouvinte)
**POST** `/api/bookings`
```json
{
  "artist_id": "uuid",
  "event_type": "Casamento",
  "event_date": "2025-12-31",
  "event_time": "20:00",
  "duration_hours": 5,
  "location": "Luanda",
  "notes": "Traje formal"
}
```

### Máquina de Estados & Ações

| Status | Ação do Artista | Ação do Ouvinte |
|--------|-----------------|-----------------|
| `waiting_confirmation` | **ACEITAR** (`POST /:id/accept`) ou **REJEITAR** (`POST /:id/reject`) | *Aguardando...* |
| `waiting_payment` | *Aguardando pagamento...* | **PAGAR** (`PATCH /:id/pay`) |
| `waiting_final_confirmation` | **FINALIZAR** (`PATCH /:id/final-confirm`) | **FINALIZAR** (`PATCH /:id/final-confirm`) |
| `completed` | *Concluído* | *Concluído* |
| `cancelled` | - | - |

**Nota:** O botão "Confirmar" antigo (`PATCH /confirm`) foi substituído por `accept` (Artista) no fluxo inicial. O Ouvinte confirma implicitamente ao criar o pedido.

### Resumo das Rotas de Ação
- **Artista Aceita:** `POST /api/bookings/:id/accept`
- **Artista Rejeita:** `POST /api/bookings/:id/reject`
- **Ouvinte Paga:** `PATCH /api/bookings/:id/pay`
- **Finalizar (Ambos):** `PATCH /api/bookings/:id/final-confirm`

---

## 🎨 5. Bio do Artista

### Edição (Dashboard do Artista)
- **GET** `/api/artists/bio` para preencher os inputs.
- **PUT** `/api/artists/bio` para salvar.

**Campos aceitos:**
- `genres` (Array de strings)
- `eventTypes` (Array de strings)
- `minPrice` (Número)
- `location` (Texto)
- `about` (Texto longo)

---

## 💡 Dicas Gerais

- **Tratamento de Erros:** Sempre exiba `error.response.data.message` para o usuário. O backend envia mensagens amigáveis.
- **Role-based Rendering:** Use `user.user_metadata.user_type` ('artist' ou 'listener') para esconder/mostrar menus.
- **Avatar:** Se `avatar_url` for null, exiba um placeholder.

---

**Dúvidas?** Consulte o arquivo `README.md` para a especificação técnica completa dos endpoints.
