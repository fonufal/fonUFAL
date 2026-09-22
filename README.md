# fonUFAL

Site institucional do **Grupo de Estudos em Fonética e Fonologia da Universidade Federal de Alagoas (fonUFAL)**.

Site público: https://fonufal.github.io/fonUFAL/

## Fonte canônica

A branch **`main` é a única fonte canônica do site publicado**.

Toda manutenção de conteúdo, código, dados e configuração deve ser feita a partir de `main`. Branches históricas de migração não devem ser usadas como fonte de conteúdo atual nem como origem de deploy.

O GitHub Pages é publicado exclusivamente pelo workflow:

`.github/workflows/website-deploy.yml`

Esse workflow:
- executa em alterações de `main`;
- realiza um rebuild diário para atualizar conteúdos dependentes do Google Calendar;
- cancela deploys anteriores ainda em andamento quando existe uma versão mais recente.

## Estrutura técnica

O site é desenvolvido em Astro e usa `base: /fonUFAL` para publicação no GitHub Pages.

Principais fontes:
- `src/pages/` — páginas;
- `src/content/blog/` — notícias em português;
- `src/content/blog-en/` — notícias em inglês;
- `src/data/` — projetos, equipe e publicações;
- `public/` — imagens e assets;
- `src/utils/calendar.ts` — integração com o Google Calendar.

## Desenvolvimento e validação

```bash
npm install
npm run dev
npm run build
```

Antes de publicar alterações, o build deve concluir sem erros.

## Materiais de migração

Arquivos ou diretórios que ainda contenham referências à migração WordPress → Astro são mantidos apenas como **registro histórico/proveniência**. Eles não representam o estado corrente do site e não devem orientar manutenção, deploy ou escolha de branch.
