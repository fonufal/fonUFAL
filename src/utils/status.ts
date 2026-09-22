export const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('andamento') || s.includes('ongoing')) return 'badge--active';
  if (s.includes('avaliação') || s.includes('review')) return 'badge--review';
  if (s.includes('concluíd') || s.includes('completed')) return 'badge--done';
  return 'badge--proposal';
};

export const statusPriority = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('andamento') || s.includes('ongoing')) return 0;
  if (s.includes('avaliação') || s.includes('review')) return 1;
  if (s.includes('concluíd') || s.includes('completed')) return 3;
  return 2;
};
