# Configuração do Bytescale (Upload de Música)

Para permitir o upload de músicas, é necessário configurar o Bytescale.

## Passo a Passo

1. **Obtenha sua API Key**
   - Crie uma conta em: https://www.bytescale.com/get-started
   - Vá para o Dashboard e copie a "API Key" (Secret key para backend, mas o SDK Node aceita ambas dependendo do uso. Recomenda-se a Secret Key se disponível para server-side, ou "free" para testes iniciais).

2. **Adicione ao arquivo `.env`**
   
   Abra o arquivo `.env` na raiz do projeto e adicione:
   ```env
   BYTESCALE_API_KEY=sua_api_key_aqui
   ```

3. **Reinicie o servidor**
   ```bash
   npm run dev
   ```

## Testando o Upload de Música

### Rota
`POST /api/songs/upload`

**Requisitos:**
- Autenticação Bearer Token (Usuário deve ser do tipo `artist`)
- Content-Type: `multipart/form-data`
- Campo do arquivo: `song`

### Exemplo com PowerShell (para Artistas)
```powershell
# 1. Login como Artista
$body = @{email="artista@exemplo.com";password="senha123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $loginResponse.session.access_token

# 2. Upload de Música
$headers = @{Authorization="Bearer $token"}
$filePath = "C:\Caminho\Para\Musica.mp3"
$url = "http://localhost:3000/api/songs/upload"

# Nota: Upload multipart em PowerShell pode ser complexo. 
# Recomendamos usar Postman ou Insomnia para testes de arquivos.
# Campos od formulário:
# - title: "Minha Musica"
# - genre: "Rock"
# - song: (arquivo)
```

## Dados da Música
A música será salva no banco de dados com:
- Título
- URL do arquivo (Bytescale)
- Artista (referência ao usuário)
- Gênero

## Solução de Problemas
- **Erro 403:** O usuário não é um artista.
- **Erro no Upload:** Verifique a `BYTESCALE_API_KEY`.
