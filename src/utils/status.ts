export const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('andamento')) return 'badge--active';
  if (s.includes('avaliação')) return 'badge--review';
  return 'badge--proposal';
};
