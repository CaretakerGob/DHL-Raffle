import type { Employee, RaffleContext, WinnerRecord } from '@/types/employee';

const LEGACY_EMPLOYEES_KEY = 'dhlRaffleEmployeesV2';
const PREFIX_EMPLOYEES = 'dhlRaffleEmployeesV3';
const PREFIX_POOL = 'dhlRafflePoolV1';
const PREFIX_WINNERS = 'dhlRaffleWinnersV1';

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getScopedKey = (prefix: string, context: RaffleContext): string => {
  return `${prefix}:${context.locationId}:${context.shiftId}`;
};

const normalizeEmployee = (
  value: Partial<Employee>,
  context: RaffleContext,
  index: number
): Employee => {
  const fallbackId = `${context.locationId}-${context.shiftId}-${Date.now()}-${index}`;
  const normalizedName = (value.name || '').trim() || 'Unknown Employee';
  const normalizedEmployeeId = (value.employeeId || value.id || `EMP-${index + 1}`).trim();

  return {
    id: value.id || fallbackId,
    employeeId: normalizedEmployeeId,
    name: normalizedName,
    category: value.category === 'leadership' ? 'leadership' : 'employee',
    locationId: value.locationId || context.locationId,
    shiftId: value.shiftId || context.shiftId,
  };
};

const sortByName = (employees: Employee[]): Employee[] => {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
};

export const loadEmployeesForContext = (context: RaffleContext): Employee[] => {
  if (typeof window === 'undefined') return [];

  const key = getScopedKey(PREFIX_EMPLOYEES, context);
  const scopedEmployees = safeParse<Partial<Employee>[]>(localStorage.getItem(key), []);

  if (scopedEmployees.length > 0) {
    return sortByName(
      scopedEmployees.map((employee, index) => normalizeEmployee(employee, context, index))
    );
  }

  const legacyEmployees = safeParse<Partial<Employee>[]>(
    localStorage.getItem(LEGACY_EMPLOYEES_KEY),
    []
  );

  if (legacyEmployees.length > 0) {
    const migrated = sortByName(
      legacyEmployees.map((employee, index) => normalizeEmployee(employee, context, index))
    );
    localStorage.setItem(key, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_EMPLOYEES_KEY);
    return migrated;
  }

  return [];
};

export const saveEmployeesForContext = (context: RaffleContext, employees: Employee[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getScopedKey(PREFIX_EMPLOYEES, context), JSON.stringify(employees));
};

export const loadPoolForContext = (context: RaffleContext): Employee[] => {
  if (typeof window === 'undefined') return [];
  const pool = safeParse<Partial<Employee>[]>(
    localStorage.getItem(getScopedKey(PREFIX_POOL, context)),
    []
  );
  return pool.map((employee, index) => normalizeEmployee(employee, context, index));
};

export const savePoolForContext = (context: RaffleContext, pool: Employee[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getScopedKey(PREFIX_POOL, context), JSON.stringify(pool));
};

export const loadWinnerHistoryForContext = (context: RaffleContext): WinnerRecord[] => {
  if (typeof window === 'undefined') return [];
  return safeParse<WinnerRecord[]>(
    localStorage.getItem(getScopedKey(PREFIX_WINNERS, context)),
    []
  );
};

export const saveWinnerHistoryForContext = (
  context: RaffleContext,
  winnerHistory: WinnerRecord[]
): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getScopedKey(PREFIX_WINNERS, context), JSON.stringify(winnerHistory));
};

export const appendWinnerHistoryForContext = (
  context: RaffleContext,
  record: WinnerRecord,
  maxEntries = 20
): WinnerRecord[] => {
  const currentHistory = loadWinnerHistoryForContext(context);
  const nextHistory = [record, ...currentHistory].slice(0, maxEntries);
  saveWinnerHistoryForContext(context, nextHistory);
  return nextHistory;
};
