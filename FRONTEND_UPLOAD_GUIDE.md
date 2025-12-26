# Guia de Integração: Upload de Músicas (Direct-to-Cloud)

Para evitar erros 503 na Vercel, o frontend deve fazer o upload direto para o Bytescale e depois registrar a música no nosso backend.

## 1. Instalação (Frontend)
```bash
npm install @bytescale/sdk
```

## 2. Implementação do Upload e Registro

Aqui está o exemplo de como deve ser a função de upload no seu componente:

```javascript
import { UploadManager } from "@bytescale/sdk";

// Configure seu Gerenciador de Upload (Use sua API KEY pública do Bytescale)
const uploadManager = new UploadManager({
  apiKey: "public_your_bytescale_api_key" 
});

const handleMusicUpload = async (file, songDetails) => {
  try {
    // 1. Upload Direto para o Bytescale (O arquivo não passa pelo nosso servidor)
    const { fileUrl, filePath } = await uploadManager.upload({
      data: file,
      fileName: file.name,
      mimeType: file.type
    });

    console.log("Arquivo subido com sucesso:", fileUrl);

    // 2. Registro no nosso Backend
    const response = await fetch(`${API_URL}/songs/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`, // Token JWT do usuário logado
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: songDetails.title,
        genre: songDetails.genre,
        file_url: fileUrl,  // URL retornada pelo Bytescale
        file_path: filePath, // Caminho retornado pelo Bytescale (importante para deletar depois)
        duration: 180       // Duração em segundos (opcional)
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      alert("Música publicada com sucesso!");
    } else {
      console.error("Erro ao registrar no backend:", result.message);
    }

  } catch (error) {
    console.error("Erro no processo de upload:", error);
  }
};
```

## 4. Bônus: Upload de Avatar (Cloudinary Direct)

O Cloudinary também tem limite de timeout na Vercel. Use este padrão para as fotos de perfil:

### Passo A: Pegar Assinatura
```javascript
const res = await fetch(`${API_URL}/profile/cloudinary-signature`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { signature, timestamp, api_key, cloud_name, folder } = await res.json();
```

### Passo B: Upload Direto para Cloudinary
```javascript
const formData = new FormData();
formData.append("file", imageFile);
formData.append("api_key", api_key);
formData.append("timestamp", timestamp);
formData.append("signature", signature);
formData.append("folder", folder);

const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
  method: "POST",
  body: formData
});
const { secure_url } = await cloudRes.json();
```

### Passo C: Salvar URL no Perfil
```javascript
await fetch(`${API_URL}/profile`, {
  method: "PUT",
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({ avatar_url: secure_url })
});
```

