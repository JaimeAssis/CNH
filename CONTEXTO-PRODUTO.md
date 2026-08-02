# Contexto do Produto — Pegadinhas da CNH

> Este arquivo existe para que qualquer agente (Claude ou outro) entenda rapidamente o produto, o público e a proposta da página antes de sugerir ou aplicar mudanças.

## O que é

Um **e-book digital** (chamado de "simulado" na página e pelo dono do produto) vendido por **R$27,90** para pessoas que estão prestes a fazer a **prova teórica do Detran** (exame para tirar a CNH).

O produto **não ensina o conteúdo geral da legislação de trânsito**. Ele resolve um problema mais específico: muita gente estuda, sabe a matéria, e mesmo assim erra na prova porque cai em **"pegadinhas"** — armadilhas de redação e de formulação das questões, criadas propositalmente para confundir o candidato, inclusive em perguntas que parecem óbvias.

## Proposta de valor (o "porquê" da compra)

- O candidato já estuda a teoria normalmente em outro lugar (autoescola, apostilas, apps).
- O que falta é reconhecer os **padrões de armadilha** que a banca repete prova após prova: palavras absolutas ("sempre", "nunca"), negações escondidas ("não", "exceto", "incorreta"), troca de placas parecidas (proibição x advertência), alternativas "quase certas" com um detalhe trocado, etc.
- O e-book cataloga essas pegadinhas, mostra o gabarito **e explica o motivo pelo qual a alternativa engana**, para que o padrão fique fixado e o candidato consiga reconhecer armadilhas novas, não só decorar as 15 que estão no material.
- Posicionamento de atualização: conteúdo alinhado ao **modelo de prova 2026** (banco nacional de questões / Senatran), para não estudar por regra antiga.

## O que está incluso na oferta

1. **15 Pegadinhas Comentadas** (produto principal) — questões-armadilha comentadas, formato 2026.
2. **Bônus: Mapa das Placas** que mais confundem (forma + cor numa página só).
3. **Bônus: Checklist do Dia da Prova** (como usar o tempo, como ler o enunciado sem cair na pressa).
4. Menção a um "Decodificador de Pegadinhas" como parte do conteúdo incluído.

Garantia incondicional de 7 dias. Entrega imediata por e-mail após confirmação de pagamento (produto digital via Cakto).

> O PDF do produto anuncia na capa **"+ 10 pegadinhas bônus pra você se testar"** — ou seja, são 25 questões, não 15. A página de vendas ainda não menciona esse bônus; é ganho de valor percebido a custo zero, ainda pendente de decisão do dono.

## Público-alvo

Pessoas que:
- Já marcaram ou estão perto de marcar a prova teórica do Detran.
- Têm ansiedade de reprovar (custo de reexame + espera de semanas para remarcar).
- Muitas vezes estão estudando em cima da hora ("mesmo que você só tenha hoje pra estudar").

## Tom e estilo da página

- Cores/identidade remetem a sinalização de trânsito (verde, amarelo, placas de "pare" e "advertência") — reforço visual do tema pegadinhas de placas.
- Copy urgente mas com disclaimers honestos no rodapé: não é órgão oficial, não garante aprovação, não reproduz questões literais da prova.
- Estrutura atual: topbar fixa com CTA → hero → depoimentos (grid 2x2) → faixa de números → problema (pegadinhas comuns) → **mini-oferta** → mecanismo/método → **faixa de fontes/autoridade** → o que está incluso (stack de valor) → **veja por dentro (vídeo)** → oferta/preço → FAQ → CTA final → footer com aviso legal → **barra fixa de compra (mobile)**.

## Infraestrutura técnica da página

- HTML/CSS/JS vanilla: [index.html](index.html) (markup + estilos) e [assets/interacoes.js](assets/interacoes.js) (todo o JS de comportamento, carregado via `<script defer>` no final do `<body>`). O arquivo se chama `index.html` (não `pagina-vendas-cnh.html`) porque hosts estáticos como a Vercel servem a rota raiz `/` procurando por esse nome — renomear evita 404 no domínio.
- **`assets/interacoes.js`** concentra: reveal-on-scroll com stagger (`initReveal`), contador animado da faixa de números (`initContadores`), pulso no CTA principal da oferta (`initPulseCTA`), toast de prova social simulada (`initProvaSocial`), rastreamento de clique do Meta Pixel (`initPixelClique`) e a barra fixa de compra do mobile (`initBarraMobile`). Qualquer alteração de comportamento/tracking da página deve ser feita nesse arquivo, não em `<script>` inline no HTML.
  - `initBarraMobile()` usa **leitura geométrica síncrona** (`getBoundingClientRect` no evento de `scroll`), de propósito. `IntersectionObserver` e `requestAnimationFrame` foram testados aqui e entregam o callback tarde, deixando a barra visível sobre o card de oferta. Não "otimize" isso de volta para IO/rAF.
- **Checkout**: todos os botões de compra/CTA apontam para o link de checkout da Hotmart:
  `https://pay.hotmart.com/B106812764F?checkoutMode=10`
  (histórico: chegou a usar Cakto por um período; voltou para Hotmart em 31/07/2026 — trocado nos 6 CTAs da página a pedido do dono.)
- **Rastreamento (Meta Pixel)**: ID `1078666911488968`, instalado na página.
  - Envia **PageView** automaticamente ao carregar a página.
  - Envia um **evento customizado de clique** (`trackCustom`, não é evento padrão), via `initPixelClique()` em `assets/interacoes.js`, quando o usuário clica em qualquer botão de compra/CTA.
  - **Não envia `InitiateCheckout` nem `Purchase` pelo pixel do navegador** — a intenção é que esses dois eventos sejam enviados via **API de Conversões pela própria plataforma de checkout** (server-side), para evitar duplicidade e manter a atribuição mais confiável. Isso tinha sido confirmado funcionando com a Cakto em 29/07/2026 — **com a volta para a Hotmart, reconfirme no Gerenciador de Eventos do Meta se o `Purchase` continua chegando neste pixel ID**, pois a integração server-side é específica de cada plataforma e pode não estar replicada na conta Hotmart. Qualquer alteração futura de tracking nesta página deve respeitar essa divisão de responsabilidade.
- **Prova social simulada**: `initProvaSocial()` mostra um toast ("N pessoa(s) acabou/acabaram de comprar") em ciclo, com números e textos genéricos (sem nomes/cidades) — não é dado real de vendas, é um efeito de prova social similar a ferramentas como Fomo/TrustPulse.

## Restrição da dobra no mobile (importante)

A hero é otimizada para o **botão de compra ficar acima da dobra em celular**. Medido em 375x667 e 360x640: o CTA termina em **y=526**, e um celular real tem só ~530-590px úteis por causa das barras do navegador. A margem é apertada de propósito:

- A capa do e-book (`.hero-capa`) fica **entre a copy e o CTA**. O limite é por **altura** (`max-height`), nunca por largura — assim funciona com qualquer proporção de capa.
- O teto escala com a altura da tela: **190px** por padrão, **250px** acima de 760px de viewport, **290px** acima de 880px. Celular pequeno mantém o CTA visível; celular grande ganha capa maior.
- `.hero-capa` **precisa de `height: auto`** no CSS, senão o atributo `height` do HTML vence o `max-height` e a imagem estica.
- Aumentar a subheadline em uma linha custa ~24px do orçamento.
- Sempre remeça o `bottom` do CTA da hero depois de mexer na hero.

Medições atuais do `bottom` do CTA da hero: **526px** em 375x667 e 360x640; **633px** em 390x844; **498px** no desktop.

## Assets de mídia

- `assets/Por-dentro.mp4` — original, 91MB / 1080x1920 / 9Mbps. **Não referenciar na página.**
- `assets/Por-dentro-web.mp4` — versão web, 4MB / 540x960, usada na seção "veja por dentro". Gerada com:
  `ffmpeg -i assets/Por-dentro.mp4 -vf scale=540:-2 -c:v libx264 -crf 30 -preset slow -c:a aac -b:a 64k -ac 1 -movflags +faststart assets/Por-dentro-web.mp4`
- `assets/capa pegadinhas.png` — capa original enviada pelo dono, 1080x1080 com fundo transparente e ~190px de margem vazia de cada lado. **Preservada, mas não usada na página.**
- `assets/capa-ebook.webp` (61KB) + `assets/capa-ebook.png` (463KB, fallback) — capa recortada no contorno do livro e redimensionada para 450x682, usada na hero via `<picture>`. É a imagem LCP da página: sem `loading="lazy"`, com `fetchpriority="high"`. Geradas com:
  `ffmpeg -i "assets/capa pegadinhas.png" -vf "crop=706:1070:190:3,scale=450:682:flags=lanczos" -c:v libwebp -q:v 82 assets/capa-ebook.webp`

## O que evitar ao editar esta página

- Não adicionar eventos `InitiateCheckout` ou `Purchase` via pixel do navegador — isso duplicaria o que a Cakto já envia pela API de Conversões.
- Não inventar nome/cidade para os depoimentos: as fotos são de compradores reais, mas os dados de identificação foram perdidos. Atribuição inventada em foto de pessoa real é depoimento falso (CDC/CONAR). Os cards têm um comentário no HTML marcando onde inserir os dados quando forem recuperados.
- Não recolocar preço "de/por" riscado sem um preço de lista real: R$27,90 é o preço cheio atual, não promoção.
- Não prometer aprovação garantida na prova (a copy é deliberadamente cuidadosa nisso: "a aprovação depende do seu estudo").
- Não remover os disclaimers do rodapé (não afiliação com Detran/Senatran, não reprodução literal de questões).
