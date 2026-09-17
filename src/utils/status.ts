export const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('andamento') || s.includes('ongoing')) return 'badge--active';
  if (s.includes('avaliação') || s.includes('review')) return 'badge--review';
  return 'badge--proposal';
};
