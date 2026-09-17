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
- sistema de design revisado (tipografia, paleta, componentes de status, motivo de onda sonora), tema escuro automático removido a pedido;
- projetos atuais estruturados com distinção entre **Em andamento**, **Em avaliação** e **Proposta**;
- **66 de 66 perfis da página de Membros migrados** (Liderança, Pesquisadores, Estudantes, Egressos), com foto e papel preservados localmente em `public/team/`; cartões simplificados para formato icônico (sem descrição longa), a pedido;
- **52 de 52 posts de Notícias migrados** com conteúdo integral (não resumido), data, categorias e mídia; página individual por post criada em `/noticias/[slug]/`; 67 imagens preservadas localmente em `public/noticias/`;
- logo institucional baixado e preservado localmente em `public/logo-fonufal.png`, eliminando o hotlink do WordPress;
- `URL_MAP.csv` atualizado com todas as 52 URLs de posts e status `migrated` para páginas de Notícias e Membros;
- **auditoria completa de conteúdo e design**: corrigidos bug de data (posts apareciam um dia antes por causa de fuso horário), links do Lattes quebrados, alinhamento de imagens do WordPress sem efeito, vídeo incorporado não responsivo, hotlink residual de emojis, ausência de favicon/Open Graph, e indicador de página atual no menu;
- **links de membros padronizados**: Lattes, ORCID e Email apenas (Vcard e ResearchGate removidos, a pedido). ORCID identificado via API pública da ORCID para os 28 membros atuais (não-egressos), restrito a registros afiliados à UFAL e **reverificado individualmente por nome exato** contra falsos positivos — o filtro de afiliação sozinho já produziu 2 falsos positivos (pessoas diferentes com nomes parecidos), descartados. Resultado: 7 de 28 membros atuais com ORCID verificado; o restante não teve correspondência segura e ficou sem ORCID, sem adivinhação;
- **scraping direto do Lattes não é viável**: o visualizador de currículo do CNPq exige verificação por reCAPTCHA em toda solicitação, confirmado tanto via HTTP simples quanto via sessão de navegador real. Não será contornado;
- **4 publicações reais do fonUFAL** identificadas no próprio arquivo de notícias já migrado (excluindo defesas de tese e citações de terceiros), cada uma verificada contra o Crossref (DOI, autoria completa, volume/número/páginas) antes de publicar. Populam `src/data/publications.bib` e `/publications`;
- link "Site WordPress de origem" removido do rodapé, a pedido;
- **versão em inglês** das páginas essenciais (Início, Pesquisa, Pessoas, Contato) publicada em `/en/`, com alternador de idioma no cabeçalho. Notícias e Publicações permanecem só em português — escopo confirmado com o time antes de iniciar, dado o volume dos 52 posts históricos.

## Em andamento

- auditoria de vínculos atuais dos membros (situação institucional corrente vs. histórico preservado);
- validação de responsividade, WCAG, SEO e links em profundidade (checagem automatizada de links/imagens já cobre 100% das páginas e mídias, sem quebras).

## Bloqueios / riscos

- a Área Interna protegida por senha não será publicada no GitHub Pages;
- o formulário de contato do WordPress exige solução própria para site estático;
- 3 imagens de posts de 2017 (`popularizacao-de-c-t`) não foram recuperadas — os arquivos originais já não existem no servidor WordPress (404 confirmado, não é erro de extração);
- `npm run build` local falha no Windows por um bug do próprio Astro 6.4.8 (não relacionado a este conteúdo) em qualquer rota dinâmica (`getStaticPaths`); reproduzido também no scaffold original sem alterações. O deploy via GitHub Actions roda em `ubuntu-latest` e passa normalmente;
- currículo Lattes não pode ser extraído automaticamente (ver acima) — qualquer dado adicional de publicações precisará vir de outra fonte (ORCID de cada pesquisador, quando disponível, ou envio manual).

## Próximo marco

Revisar responsividade/acessibilidade em profundidade, e então validar o PR #1 para decidir o merge em `main`.
