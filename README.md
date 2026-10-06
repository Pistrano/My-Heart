# 💛 Coração do Rapha

Um jogo-surpresa em formato **PWA**, feito como presente de 1 ano de namoro (09/12/2026). Funciona offline e pode ser instalado na tela inicial do tablet.

## Funcionalidades
- **Menu estilo jogo** com troca de paleta (Crepúsculo / Verão), trilha sonora e controle de volume.
- **Linha do tempo** interativa com os marcos do relacionamento.
- **Fluxo narrativo**: cadastro de "inquilino", tela de alerta contra invasores, quiz de verificação com 16 perguntas e certificado final.
- **Contrato de Overwatch** com assinatura digital e carimbo animado, exportável em PDF.
- **PWA**: manifest, ícones, service worker com cache offline (inclui áudios).
- **Progresso salvo**: tema, volume e pergunta atual do quiz ficam guardados no aparelho.

## Tecnologias
HTML5, CSS3 (variáveis, animações, `dvh`, `prefers-reduced-motion`), JavaScript puro (sem frameworks), Service Worker, Web App Manifest, `localStorage`, canvas-confetti.

## Rodando localmente
Service workers exigem `http://localhost` (ou HTTPS):
```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicando no GitHub Pages
1. *Settings → Pages → Deploy from a branch → `main` / root*.
2. Abra a URL no tablet e use **Instalar app** / **Adicionar à tela inicial**.
3. A cada deploy, altere `VERSAO` em `sw.js` para forçar a atualização do cache.

## Estrutura
```
index.html      telas do jogo
style.css       temas e componentes
script.js       fluxo, quiz, áudio e persistência
sw.js           cache offline
manifest.json   configuração de instalação
img/            fotos otimizadas (WebP) e ícones
```
