// src/services/firestoreService.ts

import {
  collection,
  query,
  where,
  or,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Attaches a real-time listener to a Firestore collection, with optional
 * filtering for public and user-owned documents.
 *
 * @param collectionName - The name of the collection to listen to.
 * @param userId - The ID of the authenticated user. If null, only public documents are fetched.
 * @param callback - The function to call with the updated data.
 * @returns An unsubscribe function to detach the listener.
 */
export function onCollectionUpdate(
  collectionName: string,
  userId: string | null,
  callback: (data: DocumentData[]) => void
) {
  const dataCollection = collection(db, collectionName);
  let q: Query;

  if (userId) {
    q = query(
      dataCollection,
      or(where("visibility", "==", "public"), where("ownerId", "==", userId))
    );
  } else {
    q = query(dataCollection, where("visibility", "==", "public"));
  }

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const data: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    callback(data);
  });

  return unsubscribe;
}

export function onUserCollectionUpdate(
  collectionName: string,
  userId: string,
  callback: (data: DocumentData[]) => void
) {
  const dataCollection = collection(db, collectionName);
  const q = query(dataCollection, where("ownerId", "==", userId));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const data: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    callback(data);
  });

  return unsubscribe;
}
/**
 * Adds a new document to a specified collection.
 *
 * @param collectionName - The name of the collection.
 * @param data - The data object for the new document.
 * @returns The ID of the newly created document.
 */
export async function addDocument(
  collectionName: string,
  data: DocumentData
): Promise<string> {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

/**
 * Updates an existing document in a specified collection.
 *
 * @param collectionName - The name of the collection.
 * @param docId - The ID of the document to update.
 * @param data - An object containing the fields to update.
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

/**
 * Deletes a document from a specified collection.
 *
 * @param collectionName - The name of the collection.
 * @param docId - The ID of the document to delete.
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}
//USER SETTINGS//
/**
 * Fetches a single user settings document from Firestore.
 *
 * @param userId - The ID of the user whose settings are being fetched.
 * @returns The user's settings data object, or null if it doesn't exist.
 */
export async function getUserSettings(
  userId: string
): Promise<DocumentData | null> {
  const docRef = doc(db, "userSettings", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Document does not exist
    return null;
  }
}

/**
 * Creates the initial settings document for a new user.
 *
 * @param userId - The ID of the new user.
 * @param defaultSettings - The default settings object to save.
 */
export async function createUserSettings(
  userId: string,
  defaultSettings: DocumentData
): Promise<void> {
  const docRef = doc(db, "userSettings", userId);
  await setDoc(docRef, defaultSettings);
}

/**
 * Updates an existing user settings document in Firestore using a merge.
 * This only modifies the fields provided and leaves other fields untouched.
 *
 * @param userId - The ID of the user.
 * @param newSettings - An object containing the fields to update.
 */
export async function updateUserSettings(
  userId: string,
  newSettings: DocumentData
): Promise<void> {
  const docRef = doc(db, "userSettings", userId);
  // Using { merge: true } ensures we don't overwrite the entire document
  await setDoc(docRef, newSettings, { merge: true });
}
