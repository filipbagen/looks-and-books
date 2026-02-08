import type { Staff } from '../types/booking';

export interface StaffConfigItem {
  resourceId: string;
  name: string;
  title: string;
}

export const STAFF_CONFIG: StaffConfigItem[] = [
  { resourceId: 'petra', name: 'Petra', title: 'Frisör' },
  { resourceId: 'hannah', name: 'Hannah', title: 'Frisör' },
  { resourceId: 'emma', name: 'Emma', title: 'Frisör' },
  { resourceId: 'fadi', name: 'Fadi', title: 'Frisör' },
  { resourceId: 'olivia', name: 'Olivia', title: 'Frisör' },
  { resourceId: 'simon', name: 'Simon', title: 'Frisör' },
];

// Helper to get titles map
export const STAFF_TITLES = STAFF_CONFIG.reduce((acc, staff) => {
  acc[staff.name] = staff.title;
  return acc;
}, {} as Record<string, string>);

// Helper to get fallback staff list
export const DEFAULT_STAFF: Staff[] = STAFF_CONFIG.map(({ resourceId, name }) => ({
  resourceId,
  name,
}));

// Helper to get order of names for sorting
export const STAFF_ORDER = STAFF_CONFIG.map((staff) => staff.name);
