# fonUFAL — scaffold Astro Scholar

Primeira base de conversão do site do fonUFAL para Astro, derivada da arquitetura do template **Astro Scholar** (Shravan Goswami, MIT).

## Estado

Este diretório é um **scaffold de migração**, ainda não uma publicação final. Ele fixa a arquitetura aprovada e já substitui o conteúdo demonstrativo por conteúdo institucional e projetos documentados do fonUFAL.

## Decisões já aplicadas

- Base técnica e editorial: Astro Scholar.
- Continuidade visual com o WordPress: uso do logotipo atual, branco como fundo dominante e os acentos vermelho/azul do fonUFAL.
- Menu: Início · Pesquisa · Pessoas · Publicações · Notícias · Contato.
- Área Interna excluída do GitHub Pages.
- Projetos distinguem explicitamente Em andamento / Em avaliação / Proposta.
- Notícias migradas somente após preservação bruta; o post de minicurso é apenas um registro de migração, não uma reconstrução do texto.

## Projetos já estruturados

1. Entre muitas vozes — CNPq, processo 446854/2025-5, vigência 2026–2028.
2. SÍNTESE — programa de avaliação reprodutível de TTS.
3. EyetrackingMOS e métricas automáticas para avaliação de TTS em português — PVLE4730-2026, em avaliação.
4. Processamento de fronteiras prosódicas no discurso — Fase 4 — PVLE4829-2026, em avaliação.
5. Índice neurofisiológico implícito da naturalidade da fala sintetizada — proposta 2026.

## Pendências antes de publicação

- completar inventário e extração bruta do WordPress;
- baixar localmente logo e demais mídia, eliminando hotlink do WordPress;
- migrar os 66 perfis preservados e auditar situação atual;
- consolidar bibliografia em `src/data/publications.bib`;
- completar arquivo de notícias e mapa URL antiga → URL nova;
- executar `npm install` e `npm run build` em ambiente com acesso à rede;
- validar responsividade, WCAG, SEO e links;
- validar o scaffold na branch `migration/astro-scholar` e revisar o PR antes de mesclar em `main`.

## Desenvolvimento

```bash
npm install
npm run dev
npm run build
```

O `base` está configurado para `/fonUFAL`, compatível com `https://fonufal.github.io/fonUFAL/` enquanto não houver domínio personalizado.
