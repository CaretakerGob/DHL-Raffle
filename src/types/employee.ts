export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  category: 'employee' | 'leadership';
  locationId: string;
  shiftId: string;
}

export interface RaffleContext {
  locationId: string;
  shiftId: string;
}

export interface WinnerRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  prizeName?: string;
  drawnAt: string;
  locationId: string;
  shiftId: string;
}
