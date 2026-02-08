import type { Staff } from '../types/booking';

export interface StaffConfigItem {
  resourceId: string;
  name: string;
}

export const STAFF_CONFIG: StaffConfigItem[] = [
  { resourceId: 'petra', name: 'Petra' },
  { resourceId: 'hannah', name: 'Hannah' },
  { resourceId: 'emma', name: 'Emma' },
  { resourceId: 'fadi', name: 'Fadi' },
  { resourceId: 'olivia', name: 'Olivia' },
  { resourceId: 'simon', name: 'Simon' },
];

// "Quickest available time" special staff entry
export const QUICKEST_AVAILABLE: Staff = {
  resourceId: 'quickest-available',
  name: 'Snabbast möjliga tid',
};

// Check if a staff entry is the quickest-available option
export function isQuickestAvailable(staff: Staff | null): boolean {
  return staff?.resourceId === QUICKEST_AVAILABLE.resourceId;
}

// Helper to get fallback staff list
export const DEFAULT_STAFF: Staff[] = STAFF_CONFIG.map(({ resourceId, name }) => ({
  resourceId,
  name,
}));

// Helper to get order of names for sorting
export const STAFF_ORDER = STAFF_CONFIG.map((staff) => staff.name);
