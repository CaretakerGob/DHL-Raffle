import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Employee, RaffleContext, WinnerRecord } from '@/types/employee';
import { db, isFirebaseConfigured } from '@/lib/firebase';

interface RaffleContextDocument {
  employees: Employee[];
  rafflePool: Employee[];
  winnerHistory: WinnerRecord[];
}

const COLLECTION_NAME = 'raffleContexts';

const getContextDocId = (context: RaffleContext): string => {
  return `${context.locationId}__${context.shiftId}`;
};

export const canUseFirestore = (): boolean => {
  return Boolean(db && isFirebaseConfigured);
};

export const loadRaffleContextFromFirestore = async (
  context: RaffleContext
): Promise<RaffleContextDocument | null> => {
  if (!db || !isFirebaseConfigured) return null;

  const snapshot = await getDoc(doc(db, COLLECTION_NAME, getContextDocId(context)));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Partial<RaffleContextDocument>;

  return {
    employees: Array.isArray(data.employees) ? data.employees : [],
    rafflePool: Array.isArray(data.rafflePool) ? data.rafflePool : [],
    winnerHistory: Array.isArray(data.winnerHistory) ? data.winnerHistory : [],
  };
};

export const saveRaffleContextToFirestore = async (
  context: RaffleContext,
  payload: RaffleContextDocument
): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;

  await setDoc(
    doc(db, COLLECTION_NAME, getContextDocId(context)),
    {
      ...payload,
      locationId: context.locationId,
      shiftId: context.shiftId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
