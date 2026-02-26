export interface WarehouseLocation {
  id: string;
  name: string;
}

export interface ShiftOption {
  id: string;
  name: string;
}

export const WAREHOUSE_LOCATIONS: WarehouseLocation[] = [
  { id: 'wh-a', name: 'Warehouse A' },
  { id: 'wh-b', name: 'Warehouse B' },
  { id: 'wh-c', name: 'Warehouse C' },
];

export const SHIFT_OPTIONS: ShiftOption[] = [
  { id: 'shift-1', name: 'Shift 1' },
  { id: 'shift-2', name: 'Shift 2' },
  { id: 'shift-3', name: 'Shift 3' },
];

export const DEFAULT_LOCATION_ID = WAREHOUSE_LOCATIONS[0].id;
export const DEFAULT_SHIFT_ID = SHIFT_OPTIONS[0].id;
