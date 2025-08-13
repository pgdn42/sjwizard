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
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";

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
