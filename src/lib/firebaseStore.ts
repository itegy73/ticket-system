/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch,
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Task, SupportTicket, Notification } from '../types';
import { 
  INITIAL_TASKS, 
  INITIAL_SUPPORT_TICKETS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';

// Re-use or initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

import { auth } from './googleAuth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check if collections are empty, and if so, seed them with initial data
export async function seedDatabaseIfEmpty() {
  try {
    let tasksSnapshot;
    try {
      tasksSnapshot = await getDocs(collection(db, 'tasks'));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    }

    if (tasksSnapshot.empty) {
      console.log('Seeding tasks in Firestore...');
      const batch = writeBatch(db);
      INITIAL_TASKS.forEach(task => {
        const docRef = doc(db, 'tasks', task.id);
        batch.set(docRef, task);
      });
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'tasks');
      }
    }

    let ticketsSnapshot;
    try {
      ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'tickets');
    }

    if (ticketsSnapshot.empty) {
      console.log('Seeding support tickets in Firestore...');
      const batch = writeBatch(db);
      INITIAL_SUPPORT_TICKETS.forEach(ticket => {
        const docRef = doc(db, 'tickets', ticket.id);
        batch.set(docRef, ticket);
      });
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'tickets');
      }
    }

    let notificationsSnapshot;
    try {
      notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    }

    if (notificationsSnapshot.empty) {
      console.log('Seeding notifications in Firestore...');
      const batch = writeBatch(db);
      INITIAL_NOTIFICATIONS.forEach(notif => {
        const docRef = doc(db, 'notifications', notif.id);
        batch.set(docRef, notif);
      });
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'notifications');
      }
    }
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
  }
}

// Subscribe to Tasks in real-time
export function subscribeTasksDB(callback: (tasks: Task[]) => void) {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasksList: Task[] = [];
    snapshot.forEach((doc) => {
      tasksList.push(doc.data() as Task);
    });
    callback(tasksList);
  }, (error) => {
    console.error('Real-time tasks subscription failed:', error);
    handleFirestoreError(error, OperationType.GET, 'tasks');
  });
}

// Subscribe to Tickets in real-time
export function subscribeTicketsDB(callback: (tickets: SupportTicket[]) => void) {
  const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const ticketsList: SupportTicket[] = [];
    snapshot.forEach((doc) => {
      ticketsList.push(doc.data() as SupportTicket);
    });
    callback(ticketsList);
  }, (error) => {
    console.error('Real-time tickets subscription failed:', error);
    handleFirestoreError(error, OperationType.GET, 'tickets');
  });
}

// Subscribe to Notifications in real-time
export function subscribeNotificationsDB(callback: (notifications: Notification[]) => void) {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifList: Notification[] = [];
    snapshot.forEach((doc) => {
      notifList.push(doc.data() as Notification);
    });
    callback(notifList);
  }, (error) => {
    console.error('Real-time notifications subscription failed:', error);
    handleFirestoreError(error, OperationType.GET, 'notifications');
  });
}

// Create or update elements
export async function saveTaskDB(task: Task): Promise<void> {
  const docRef = doc(db, 'tasks', task.id);
  try {
    await setDoc(docRef, task, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `tasks/${task.id}`);
  }
}

export async function deleteTaskDB(taskId: string): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
  }
}

export async function saveTicketDB(ticket: SupportTicket): Promise<void> {
  const docRef = doc(db, 'tickets', ticket.id);
  try {
    await setDoc(docRef, ticket, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `tickets/${ticket.id}`);
  }
}

export async function saveNotificationDB(notification: Notification): Promise<void> {
  const docRef = doc(db, 'notifications', notification.id);
  try {
    await setDoc(docRef, notification, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `notifications/${notification.id}`);
  }
}
