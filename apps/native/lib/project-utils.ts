import { type ProjectDoc } from '@packages/backend/convex/schemas/projects';

/**
 * Get initials from a person's name
 * Takes first letter of first and last name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

/**
 * Get display label for team member field
 */
export function getRoleLabel(field: string): string {
  const labels: Record<string, string> = {
    mainTalent: 'Main Artist(s)',
    choreographers: 'Choreographer(s)',
    associateChoreographers: 'Assoc. Choreographer(s)',
    directors: 'Director(s)',
  };
  return labels[field] || field;
}

/**
 * Get category and subcategory display info for a project
 */
export function getCategoryInfo(project: ProjectDoc): {
  category: string;
  subcategory: string;
} {
  switch (project.type) {
    case 'tv-film':
      return {
        category: 'Television/Film',
        subcategory: project.studio || '-',
      };
    case 'music-video':
      return {
        category: 'Music Video',
        subcategory: project.artists?.join(', ') || '-',
      };
    case 'commercial':
      return {
        category: 'Commercial',
        subcategory: project.companyName || '-',
      };
    case 'live-performance':
      return {
        category: 'Live Performance',
        subcategory: project.tourArtist || project.venue || '-',
      };
    default:
      return {
        category: 'Unknown',
        subcategory: '-',
      };
  }
}

/**
 * Format date for display
 */
export function formatProjectDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}
