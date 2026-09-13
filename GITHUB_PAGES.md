# Publicar no GitHub Pages

## 1. Criar o repositório

Crie um repositório vazio no GitHub com o nome `controle-financeiro`. O nome pode ser outro, mas deve permanecer igual ao nome usado na URL do Pages.

## 2. Enviar o código

```bash
git init
git branch -M main
git add .
git commit -m "Versão inicial do controle financeiro"
git remote add origin https://github.com/SEU_USUARIO/controle-financeiro.git
git push -u origin main
```

## 3. Ativar o Pages

No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como fonte de publicação. O workflow `.github/workflows/deploy.yml` instala as dependências, executa os testes, valida o TypeScript, gera o build e publica `dist/public`.

Após o workflow terminar, o endereço será:

```text
https://SEU_USUARIO.github.io/controle-financeiro/
```

O `vite.config.ts` detecta automaticamente o nome do repositório durante o GitHub Actions e ajusta o caminho base do site.

## 4. Atualizar o site

```bash
git add .
git commit -m "Atualiza aplicação"
git push
```

## Observação sobre os dados

A versão atual salva os lançamentos no `localStorage` do navegador. O GitHub Pages hospeda o código, mas não sincroniza dados entre dispositivos. Para isso, será necessário conectar a aplicação a um backend e banco de dados persistente.
