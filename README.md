# Torra Norte

Site de uma torrefação de café especial em Porto Alegre. Vite + React + TypeScript, com GSAP (ScrollTrigger), Lenis e Three.js.

## Como rodar

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (funciona em qualquer pasta ou subdomínio)
npm run preview    # serve o dist/ para conferir o build
npm run lint
```

O build usa caminhos relativos (`base: './'`): a pasta `dist/` pode ser enviada para Netlify, Vercel, GitHub Pages ou qualquer hospedagem estática.

## O que tem de especial

- **Grão 3D feito por código** (`src/lib/bean.ts`): geometria procedural com sulco, relevo e luz de estúdio. Não usa modelo externo.
- **Curva de torra controlada pelo scroll** (`src/components/RoastCurve.tsx`): a rolagem avança o tempo; o grão muda de cor, brilho e tamanho, treme no primeiro crack, e o gráfico e os textos acompanham.
- **Clube de assinatura** (`src/components/Club.tsx`): valor mensal calculado na hora e mensagem pronta para o WhatsApp.
- Grãos de café nas margens que descem, quicam e giram conforme a rolagem (`src/lib/scrollBeans.ts`, canvas 2D que só desenha enquanto há movimento).
- Scroll suave (Lenis), processo em rolagem horizontal, foto que segue o cursor nos lotes, botões magnéticos.

## Estrutura

```
src/
  App.tsx              composição da página e efeitos globais (scroll, âncoras, tema do topo)
  components/          uma seção por arquivo
  lib/
    roast.ts           dados e matemática da curva (temperaturas, estágios, cores)
    bean.ts            geometria e luz do grão
    hero3d.ts          cena do topo        (carregada sob demanda)
    curve3d.ts         grão da curva       (carregado sob demanda)
    scrollBeans.ts     grãos que pulam com a rolagem
    scroll.ts          Lenis + GSAP
    env.ts             preferências do sistema, caminhos de imagem
public/assets/images/  fotos (.webp)
docs/SOURCES.json      autor, página e licença de cada foto
```

O Three.js fica em um pacote separado e só baixa depois que a página aparece.

## Como editar o conteúdo

- Lotes e preços: `LOTS` em `components/Lots.tsx` e `PRICE` em `components/Club.tsx`.
- Etapas do processo: `STEPS` em `components/Process.tsx`.
- Textos de cada estágio da torra: `STAGES` em `lib/roast.ts`.
- Cores e fontes: variáveis no topo de `src/styles.css`.
- Endereço, horários e preços são dados de exemplo: troque pelos do cliente (`Footer.tsx`, `Visit.tsx`, `Lots.tsx`, `Club.tsx`).
- WhatsApp: os links usam `https://wa.me/?text=...` sem número. Para fixar o número da loja, use `https://wa.me/55DDDNUMERO?text=...` em `Club.tsx`.

## Acessibilidade e desempenho

- Respeita `prefers-reduced-motion` (sem scroll suave, sem abertura animada, grão fixo).
- Sem WebGL, a abertura mostra uma foto no lugar do grão e a página continua completa.
- Resolução do 3D limitada (1,5x no desktop, 1,25x no celular); o grão da curva só redesenha quando o tempo muda.
- Fontes (Google Fonts) carregadas com `display=swap`; o texto do topo fica oculto até a fonte chegar, para o layout não pular.

## Créditos

Fotos do Unsplash (Unsplash License). Autor e página de cada foto em `docs/SOURCES.json`.
