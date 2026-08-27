# Odontoclinic Londrina — protótipo

Landing page estática. HTML + CSS + JS puros, sem build, sem framework, sem CDN de biblioteca.
Única dependência externa: Google Fonts.

## Como abrir
Clique duas vezes em `index.html`. É só isso — não precisa de servidor.
Para publicar: arraste a pasta inteira no Netlify Drop, ou suba num repositório e ligue no Vercel/GitHub Pages.

## Antes de publicar — obrigatório
1. **Trocar os 8 `[CONFIRMAR]`** (são 4 dados). Procure `[CONFIRMAR]` no `index.html`:
   - **CRO-PR da Dra. Karine** — 5 lugares (marcados com `<!-- CRO_KARINE -->`). *Exigência do Art. 43 do Código de Ética. Sem isso o site sai irregular.*
   - **CRO-PR da Dra. Karen** — 2 lugares (`<!-- CRO_KAREN -->`).
   - **Endereço** — 1 lugar na seção "Onde e quando". Se confirmar Souza Naves 1847, apague o `<p class="onde__todo">` e a linha "confirme o endereço pelo WhatsApp". Se for outro endereço, altere em **3 lugares** (`<!-- ENDEREÇO -->`): seção 6.9, rodapé e o JSON-LD (`streetAddress`, `postalCode` e `geo` juntos).
2. **Baixar as imagens** de `odontocliniclondrina.com.br`, converter para **AVIF/WebP** e servir localmente a partir de `/img/`. Hoje elas são carregadas por URL absoluta do servidor do cliente — bom para o protótipo, ruim para produção.
3. Trocar o `favicon.png` por um SVG quando o cliente mandar.

## O que muda quando o cliente responder
- **Estacionamento:** se existir, vira uma quarta linha na tabela de horário.
- **Tempos da primeira consulta:** os rótulos hoje são `NA CHEGADA` / `NO MESMO DIA` / `DEPOIS DA AVALIAÇÃO` / `QUANDO VOCÊ DECIDIR` (alternativa autorizada no briefing 6.6). Com os tempos reais, viram `40 A 60 MIN`, `ATÉ 24H`, etc.
- **Protocolo diabetes/hipertensão:** confirmado, a seção 6.5 ganha os detalhes. É a primeira coisa a evoluir na v2.
- **Fotos novas** (lista no Anexo A.4 do briefing): ao trocar os retratos das sócias, remova o teto de 240 px em `.socia img` e mude o `aspect-ratio` para `4/5`.

## Contraste — conferido (WCAG)
| Par | Razão | Uso |
|---|---|---|
| `--tinta` sobre `--papel` | 14,8:1 | corpo |
| `--tinta` sobre `--areia` | 11,8:1 | cards, FAQ, formulário |
| `--tinta` sobre `--argila` | 4,9:1 | faixa de avaliações |
| `--papel` sobre `--bronze` | 7,5:1 | herói, seção 6.5, sócias, rodapé |
| `--papel` sobre `--tinta` | 14,8:1 | botão primário, barra fixa |
| `--ouro` sobre `--bronze` | 3,1:1 | **só ≥ 24 px** — filetes e a citação das sócias |

Textos "apagados" usam **70%** sobre `--papel` (5,8:1) e **75%** sobre `--bronze` (5,1:1) — os 60% do rascunho original reprovavam em 4,5:1 e foram corrigidos.

## Decisões registradas (briefing 0.4)
1. **`.display` usa `line-height: 1.02` e não `.98`.** O briefing 5.2 pede `.98`, mas o critério de aceite 11 proíbe `line-height` menor que `font-size` (é o bug nº 31 do site atual). Usamos `--lh-tight`, token do próprio briefing. Diferença óptica desprezível em corpo grande.
2. **Fraunces aparece 8 vezes** (teto do briefing): H1 + os H2 de 6.4, 6.5, 6.6, "Canal.", "Aparelho e alinhadores.", 6.8 e 6.10. Os outros três H2 ("E tudo o mais…", "No centro de Londrina.", "Prefere que a gente ligue?") usam Instrument Sans 600 no mesmo corpo. Os 10 H2 do briefing 7.2 não cabiam nas 8 ocorrências permitidas.
3. **O filete animado aparece 6 vezes**, exatamente como a especificação 4.3 enumera: herói, os 3 blocos de especialidade, prova social e contato. A assinatura da seção 6.5 existe (o Art. 43 exige), mas com o filete **estático** — visualmente idêntico depois da animação. O briefing pedia as duas coisas ao mesmo tempo; esta é a leitura que mantém a contagem.
4. **Corte das duas fotos de tratamento.** `object-position` sozinho não removia o letreiro queimado dentro do JPG ("Tratamento de Canal" ocupa os 8–32% do topo; "Orto-dontia", 12–34%). A figura clipa e a imagem amplia (`scale` 1.6 e 1.9 com `transform-origin` calculado), cortando o letreiro **e** a faixa branca com logo do rodapé da arte.
5. **Sócias em 1 coluna abaixo de 390 px** e ficha de credenciais com rótulo em cima do valor abaixo de 768 px. Em 2 colunas a 320 px, "Especialização / Dental Press · 2012" estourava a largura da tela.
6. **9 requisições na primeira dobra**, não 8. O briefing 5.2 exige três famílias tipográficas — são 3 arquivos de fonte, não 2. Peso da primeira dobra: ~250 KB (meta: ≤ 400 KB). Contra 1.978 KB e 42 requisições do site atual.

## Um ponto para levar à reunião
As duas fotos das especialidades são artes de post reaproveitadas; depois do corte, a de Endodontia mostra mão enluvada e instrumento junto à paciente. O briefing manda reaproveitar esses dois arquivos (Anexo A.1), mas a seção 10 (V10/V12, Res. CFO-196/2019) veda imagem de procedimento em andamento e de instrumental identificável. **Recomendação: substituir as duas assim que chegarem as fotos do Anexo A.4** — resolve o risco e melhora o site. Enquanto isso, o layout funciona com campo de cor no lugar delas, se o cliente preferir.

## Verificado
Sem rolagem horizontal em 320/360/390/414/768/1024/1440 · zero erro de console · um único `<h1>`, 10 `<h2>`, sem salto de nível · toda `<img>` com `alt`, `width` e `height` · lazy abaixo da dobra, `fetchpriority="high"` no herói · iframe do mapa com `loading="lazy"` e `title` · dois blocos JSON-LD válidos, com o texto do FAQ idêntico ao da página · `554399189768` (o número quebrado do site atual): **zero ocorrências** · varredura das 27 palavras proibidas da seção 10.3: **uma** ocorrência, a autorizada ("não vamos escrever aqui que não dói") · nenhum hexadecimal fora do `:root` · nenhum `style=""` no HTML · `prefers-reduced-motion` cobrindo filete, reveals e a entrada do H1.
