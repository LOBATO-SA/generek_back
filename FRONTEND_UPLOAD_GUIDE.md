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

## 3. Por que fazer assim?
- **Sem Limites de Tamanho:** A Vercel limita requisições a 4.5MB. Fazendo direto, você pode subir arquivos de 50MB ou mais.
- **Velocidade:** O upload é feito direto para os servidores da CDN, sem intermediários.
- **Segurança:** O backend ainda valida se quem está registrando é um Artista e associa a música ao ID correto via Token JWT.
