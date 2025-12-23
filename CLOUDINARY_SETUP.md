# Configuração do Cloudinary

## Passo a Passo

1. **Obtenha seu API Secret** do Cloudinary Dashboard
   - Acesse: https://console.cloudinary.com/
   - Vá em Settings → API Keys
   - Copie o valor de "API Secret"

2. **Adicione ao arquivo `.env`**
   
   Abra o arquivo `.env` na raiz do projeto e adicione:
   ```env
   CLOUDINARY_API_SECRET=seu_api_secret_aqui
   ```

3. **Reinicie o servidor**
   ```bash
   npm run dev
   ```

## Testando o Upload

### Com cURL (PowerShell):
```powershell
# Primeiro, faça login para obter o token
$body = @{email="test@example.com";password="teste123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $loginResponse.session.access_token

# Faça upload de uma imagem
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/profile/upload-avatar" -Method POST -Headers $headers -InFile "caminho/para/sua/imagem.jpg" -ContentType "multipart/form-data"
```

### Resposta esperada:
```json
{
  "profile": {
    "id": "...",
    "email": "test@example.com",
    "full_name": "Test User",
    "user_type": "listener",
    "avatar_url": "https://res.cloudinary.com/daqw4pxog/image/upload/...",
    "created_at": "...",
    "updated_at": "..."
  },
  "message": "Avatar uploaded successfully"
}
```

## Verificando no Cloudinary

1. Acesse: https://console.cloudinary.com/
2. Vá para "Media Library"
3. Procure pela pasta "generek/avatars"
4. Você deve ver suas imagens de avatar lá

## Frontend Integration

```javascript
// Exemplo de upload do frontend
const uploadAvatar = async (imageFile) => {
  const formData = new FormData();
  formData.append('avatar', imageFile);

  const response = await fetch('http://localhost:3000/api/profile/upload-avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // NÃO adicione Content-Type! O browser adiciona automaticamente com boundary
    },
    body: formData
  });

  const data = await response.json();
  console.log('Avatar URL:', data.profile.avatar_url);
};

// Uso
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadAvatar(file);
  }
};
```

## Recursos da Imagem

Cada imagem enviada será automaticamente:
- ✅ Redimensionada para 500x500 pixels
- ✅ Cortada de forma inteligente (gravity: auto)
- ✅ Otimizada (quality: auto)
- ✅ Convertida para formato moderno quando possível (WebP)

## Troubleshooting

### Erro: "Cloudinary configuration error"
- Verifique se o `CLOUDINARY_API_SECRET` está correto no `.env`
- Reinicie o servidor

### Erro: "Only image files are allowed"
- Certifique-se de enviar apenas arquivos de imagem (jpg, png, gif, etc.)

### Erro: "File too large"
- Limite atual: 5MB
- Reduza o tamanho da imagem antes de enviar
