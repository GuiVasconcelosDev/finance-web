# Finance Web

Frontend de uma aplicacao financeira desenvolvido com React, TypeScript e Vite.

## Tecnologias

- React 19
- TypeScript
- Vite
- ESLint

## Funcionalidades

- Login e cadastro de usuarios
- Dashboard financeiro
- Contas
- Categorias
- Transacoes

## Requisitos

- Node.js 20 ou superior
- npm
- API backend em execucao

## Instalacao

```bash
npm install
```

## Configuracao da API

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

Voce tambem pode usar o arquivo de exemplo:

```bash
cp .env.example .env.local
```

O arquivo `.env.local` ja esta ignorado pelo Git. Nunca adicione nele tokens ou chaves secretas do backend.

Durante o desenvolvimento, o frontend utiliza caminhos relativos como `/api/...`. O Vite encaminha essas requisicoes ao endereco configurado em `VITE_API_URL`.

## Execucao

```bash
npm run dev
```

O endereco exibido pelo Vite sera aberto no navegador, normalmente em `http://localhost:5173`.

## Scripts

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # gera o build de producao
npm run preview  # visualiza o build de producao
npm run lint     # executa o ESLint
```

## Build de producao

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist`.

Em producao, configure o servidor de hospedagem ou um proxy reverso para encaminhar `/api` ao backend.

## Publicar no GitHub e gerar a contribuicao

Antes de publicar, confirme que o `.env.local` nao sera enviado:

```bash
git status --short
```

Se o projeto ainda nao for um repositorio Git:

```bash
git init
git branch -M main
```

Adicione o conteudo e crie o primeiro commit:

```bash
git add .
git commit -m "feat: cria frontend do Finance Web"
```

Crie um repositorio no GitHub e conecte-o ao projeto:

```bash
git remote add origin https://github.com/SEU_USUARIO/finance-web.git
git push -u origin main
```

Substitua `SEU_USUARIO` e `finance-web` pelos dados reais do seu repositorio.

Para futuros commits:

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push
```
