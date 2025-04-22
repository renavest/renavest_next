// Utility to get initials from a name
export function getInitials(name: string): string {
  console.log(name, 'NAME');
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() || '';
  return (words[0][0] || '').toUpperCase() + (words[words.length - 1][0] || '').toUpperCase();
}
