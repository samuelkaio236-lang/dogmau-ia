# 🐺 DOG MAU IA — Guia de Desenvolvimento

## Estrutura do Projeto

```
dogmau-ia/
│
├── index.html              ← Página principal (HTML semântico limpo)
│
├── src/
│   ├── css/
│   │   ├── variables.css   ← Cores e tokens de design (edite aqui para mudar o tema)
│   │   ├── base.css        ← Reset e layout geral
│   │   ├── header.css      ← Header e logo
│   │   ├── hero.css        ← Seção hero
│   │   ├── card.css        ← Cards, textarea, botão gerar
│   │   ├── upload.css      ← Área de upload e preview
│   │   ├── tone.css        ← Seletor de tom
│   │   ├── results.css     ← Cards de resultado e botão copiar
│   │   └── animations.css  ← Todos os keyframes e loading
│   │
│   └── js/
│       ├── logo.js         ← SVG do cachorro (injetado no DOM)
│       ├── prompt.js       ← System prompt da IA (edite para treinar)
│       ├── upload.js       ← Drag & drop, preview, base64
│       ├── tone.js         ← Seleção de tom
│       ├── generate.js     ← Chamada para API da Anthropic
│       ├── render.js       ← Renderização dos cards de resultado
│       └── main.js         ← Inicialização e eventos globais
│
└── README.md               ← Este arquivo
```

---

## 🚀 Como rodar localmente no VS Code

### 1. Instale a extensão Live Server
- Abra o VS Code
- Vá em **Extensões** (Ctrl+Shift+X)
- Pesquise **"Live Server"** (de Ritwick Dey)
- Clique em **Instalar**

### 2. Abra o projeto
```bash
# Clone ou extraia a pasta dogmau-ia
# No VS Code: File > Open Folder > selecione dogmau-ia/
```

### 3. Inicie o servidor
- Clique com botão direito em `index.html`
- Clique em **"Open with Live Server"**
- O site abre em `http://127.0.0.1:5500`

> ⚠️ **Importante:** O site precisa rodar via servidor (não abrir o arquivo diretamente no browser) por causa das restrições de CORS da API.

---

## 🤖 Como usar o Claude no VS Code (Claude Code)

### Instalação
```bash
# Requer Node.js 18+ instalado
npm install -g @anthropic-ai/claude-code
```

### Iniciar
```bash
# Na pasta do projeto
claude
```

### Exemplos de prompts poderosos para pedir ao Claude Code

#### 🎨 Design e UI
```
Deixe o botão de gerar mais chamativo com um efeito de pulso animado em vermelho
```
```
Adicione um modo escuro ainda mais profundo com background #000000 puro
```
```
Crie um contador de respostas geradas no header
```

#### ⚡ Funcionalidades
```
Adicione um histórico das últimas 5 respostas geradas, salvo no localStorage
```
```
Crie um botão "Regenerar" que chama a API novamente sem precisar reenviar o print
```
```
Adicione um campo para o usuário informar o nome da garota e personalizar as respostas
```
```
Implemente um sistema de favoritos onde o usuário pode salvar as melhores respostas
```

#### 🏗️ Arquitetura
```
Converta o projeto para usar Vite como bundler e organize em componentes
```
```
Adicione TypeScript ao projeto mantendo a estrutura atual
```
```
Crie uma página de login simples com Firebase Auth
```

#### 📱 Mobile
```
Deixe o layout 100% responsivo para mobile com bottom sheet para os resultados
```
```
Adicione suporte a tirar foto direto da câmera do celular
```

---

## 🛠️ Próximas evoluções sugeridas

| Feature | Dificuldade | Impacto |
|---------|------------|---------|
| Histórico de conversas (localStorage) | Fácil | Alto |
| Página de login (Firebase) | Médio | Alto |
| Sistema de créditos/assinatura (Stripe) | Médio | Alto |
| Backend com Node.js (esconde a API key) | Médio | Crítico |
| App mobile (React Native / PWA) | Difícil | Alto |
| Banco de dados de respostas favoritas | Médio | Médio |

---

## ⚠️ Segurança

O projeto atual chama a API da Anthropic direto do frontend.
**Para produção**, crie um backend (Node.js/Express) que:
1. Recebe a requisição do frontend
2. Chama a API com a chave guardada no servidor
3. Retorna o resultado

Peça ao Claude Code:
```
Crie um backend simples em Node.js com Express que proxy as chamadas para a API da Anthropic, guardando a API key no .env
```
