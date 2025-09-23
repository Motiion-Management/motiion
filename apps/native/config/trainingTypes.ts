import { TRAINING_TYPES } from '@packages/backend/convex/schemas/training';
import type { TrainingFormDoc } from '@packages/backend/convex/schemas/training';

/**
 * Get the display title for a training item
 */
export function getTrainingDisplayTitle(training: TrainingFormDoc | undefined): string {
  if (!training) return '';
  return training.institution || 'Untitled Training';
}

/**
 * Get the display subtitle for a training item
 */
export function getTrainingDisplaySubtitle(training: TrainingFormDoc | undefined): string {
  if (!training) return '';

  const parts: string[] = [];

  // Add training type label if present
  if (training.type) {
    parts.push(formatTrainingTypeLabel(training.type));
  }

  // Add year range if present
  if (training.startYear || training.endYear) {
    if (training.startYear && training.endYear) {
      parts.push(`${training.startYear} - ${training.endYear}`);
    } else if (training.startYear) {
      parts.push(`${training.startYear} - Present`);
    } else if (training.endYear) {
      parts.push(`Graduated ${training.endYear}`);
    }
  }

  return parts.join(' • ');
}

/**
 * Format training type label for display
 */
export function formatTrainingTypeLabel(type: (typeof TRAINING_TYPES)[number]): string {
  const labels: Record<(typeof TRAINING_TYPES)[number], string> = {
    education: 'Education',
    'dance-school': 'Dance School',
    'programs-intensives': 'Programs & Intensives',
    scholarships: 'Scholarships',
    other: 'Other',
  };
  return labels[type] || type;
}

/**
 * Get institution label based on training type
 */
export function getInstitutionLabel(type: (typeof TRAINING_TYPES)[number] | undefined): string {
  if (!type) return 'Institution';

  const labels: Record<(typeof TRAINING_TYPES)[number], string> = {
    education: 'School Name',
    'dance-school': 'Studio Name',
    'programs-intensives': 'Program Name',
    scholarships: 'Organization',
    other: 'Institution',
  };

  return labels[type] || 'Institution';
}
