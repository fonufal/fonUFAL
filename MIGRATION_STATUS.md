# MIGRATION_STATUS — fonUFAL WordPress → GitHub

Atualizado em 17/09/2026.

## Concluído

- pasta canônica de gestão criada no Google Drive;
- prompt mestre, README e registro de questões editoriais criados;
- repositório canônico atualizado para `fonufal/fonUFAL`;
- Astro Scholar definido como base técnica e editorial;
- branch `migration/astro-scholar` criada;
- inventário completo de Notícias e Membros do WordPress (paginação e feed RSS completos);
- scaffold Astro adaptado para português e para a identidade institucional do fonUFAL;
- sistema de design revisado (tipografia, paleta, componentes de status, motivo de onda sonora);
- projetos atuais estruturados com distinção entre **Em andamento**, **Em avaliação** e **Proposta**;
- **66 de 66 perfis da página de Membros migrados** (Liderança, Pesquisadores, Estudantes, Egressos), com foto, bio, papel e links (Lattes/ResearchGate/Email/Vcard) preservados localmente em `public/team/`;
- **52 de 52 posts de Notícias migrados** com conteúdo integral (não resumido), data, categorias e mídia; página individual por post criada em `/noticias/[slug]/`; 67 imagens preservadas localmente em `public/noticias/`;
- logo institucional baixado e preservado localmente em `public/logo-fonufal.png`, eliminando o hotlink do WordPress;
- `URL_MAP.csv` atualizado com todas as 52 URLs de posts e status `migrated` para páginas de Notícias e Membros.

## Em andamento

- consolidação de publicações em BibTeX (`src/data/publications.bib` ainda não populado — o WordPress não tem página própria de publicações; fonte a definir, provavelmente Lattes/ORCID);
- auditoria de vínculos atuais dos membros (situação institucional corrente vs. histórico preservado);
- validação de responsividade, WCAG, SEO e links em profundidade.

## Bloqueios / riscos

- a Área Interna protegida por senha não será publicada no GitHub Pages;
- o formulário de contato do WordPress exige solução própria para site estático;
- 3 imagens de posts de 2017 (`popularizacao-de-c-t`) não foram recuperadas — os arquivos originais já não existem no servidor WordPress (404 confirmado, não é erro de extração);
- `npm run build` local falha no Windows por um bug do próprio Astro 6.4.8 (não relacionado a este conteúdo) em qualquer rota dinâmica (`getStaticPaths`); reproduzido também no scaffold original sem alterações. O deploy via GitHub Actions roda em `ubuntu-latest` e não deve ser afetado, mas não foi validado de ponta a ponta ainda.

## Próximo marco

Validar o build no CI (`ubuntu-latest`), revisar responsividade/acessibilidade, e então validar o PR #1 para decidir o merge em `main`.
