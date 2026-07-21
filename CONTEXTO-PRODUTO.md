# Contexto do Produto — Pegadinhas da CNH

> Este arquivo existe para que qualquer agente (Claude ou outro) entenda rapidamente o produto, o público e a proposta da página antes de sugerir ou aplicar mudanças.

## O que é

Um **e-book digital** vendido por **R$27** para pessoas que estão prestes a fazer a **prova teórica do Detran** (exame para tirar a CNH).

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

Garantia incondicional de 7 dias. Entrega imediata por e-mail após confirmação de pagamento (produto digital via Hotmart).

## Público-alvo

Pessoas que:
- Já marcaram ou estão perto de marcar a prova teórica do Detran.
- Têm ansiedade de reprovar (custo de reexame + espera de semanas para remarcar).
- Muitas vezes estão estudando em cima da hora ("mesmo que você só tenha hoje pra estudar").

## Tom e estilo da página

- Cores/identidade remetem a sinalização de trânsito (verde, amarelo, placas de "pare" e "advertência") — reforço visual do tema pegadinhas de placas.
- Copy urgente mas com disclaimers honestos no rodapé: não é órgão oficial, não garante aprovação, não reproduz questões literais da prova.
- Estrutura padrão de landing page de infoproduto: topbar fixa com CTA → hero → prova social/números → seção de problema (pegadinhas comuns) → mecanismo/método → o que está incluso (stack de valor) → oferta/preço com âncora de preço → FAQ → CTA final → footer com aviso legal.

## Infraestrutura técnica da página

- Página única em HTML/CSS/JS vanilla: [pagina-vendas-cnh.html](pagina-vendas-cnh.html).
- **Checkout**: todos os botões de compra/CTA apontam para o link de checkout da Hotmart:
  `https://pay.hotmart.com/B106812764F?checkoutMode=10`
- **Rastreamento (Meta Pixel)**: ID `2068011111260569`, instalado na página.
  - Envia **PageView** automaticamente ao carregar a página.
  - Envia um **evento customizado de clique** (`trackCustom`, não é evento padrão) quando o usuário clica em qualquer botão de compra/CTA.
  - **Não envia `InitiateCheckout` nem `Purchase` pelo pixel do navegador** — esses dois eventos são enviados via **API de Conversões pela própria Hotmart** (integração server-side no back-end da Hotmart), para evitar duplicidade e manter a atribuição mais confiável. Qualquer alteração futura de tracking nesta página deve respeitar essa divisão de responsabilidade.

## O que evitar ao editar esta página

- Não adicionar eventos `InitiateCheckout` ou `Purchase` via pixel do navegador — isso duplicaria o que a Hotmart já envia pela API.
- Não prometer aprovação garantida na prova (a copy é deliberadamente cuidadosa nisso: "a aprovação depende do seu estudo").
- Não remover os disclaimers do rodapé (não afiliação com Detran/Senatran, não reprodução literal de questões).
