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
export const db = getFirestore(app);

// Check if collections are empty, and if so, seed them with initial data
export async function seedDatabaseIfEmpty() {
  try {
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    if (tasksSnapshot.empty) {
      console.log('Seeding tasks in Firestore...');
      const batch = writeBatch(db);
      INITIAL_TASKS.forEach(task => {
        const docRef = doc(db, 'tasks', task.id);
        batch.set(docRef, task);
      });
      await batch.commit();
    }

    const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    if (ticketsSnapshot.empty) {
      console.log('Seeding support tickets in Firestore...');
      const batch = writeBatch(db);
      INITIAL_SUPPORT_TICKETS.forEach(ticket => {
        const docRef = doc(db, 'tickets', ticket.id);
        batch.set(docRef, ticket);
      });
      await batch.commit();
    }

    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    if (notificationsSnapshot.empty) {
      console.log('Seeding notifications in Firestore...');
      const batch = writeBatch(db);
      INITIAL_NOTIFICATIONS.forEach(notif => {
        const docRef = doc(db, 'notifications', notif.id);
        batch.set(docRef, notif);
      });
      await batch.commit();
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
  });
}

// Create or update elements
export async function saveTaskDB(task: Task): Promise<void> {
  const docRef = doc(db, 'tasks', task.id);
  await setDoc(docRef, task, { merge: true });
}

export async function deleteTaskDB(taskId: string): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await deleteDoc(docRef);
}

export async function saveTicketDB(ticket: SupportTicket): Promise<void> {
  const docRef = doc(db, 'tickets', ticket.id);
  await setDoc(docRef, ticket, { merge: true });
}

export async function saveNotificationDB(notification: Notification): Promise<void> {
  const docRef = doc(db, 'notifications', notification.id);
  await setDoc(docRef, notification, { merge: true });
}
