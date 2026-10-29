import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

/**
 * Fetch all documents from a Firestore collection.
 * Returns null if collection is empty or if read fails.
 */
export async function getCollectionData(collectionName) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch (error) {
    console.warn(`Firestore read failed for ${collectionName}:`, error.message);
    return null;
  }
}

/**
 * Save or merge a single document into Firestore.
 */
export async function saveDocument(collectionName, docId, data) {
  try {
    if (!docId) return;
    const cleanId = String(docId);
    const docRef = doc(db, collectionName, cleanId);
    // Sanitize to remove any undefined fields before writing to Firestore
    const sanitized = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    console.warn(`Firestore write failed for ${collectionName}/${docId}:`, error.message);
  }
}

/**
 * Sync an entire array of items to Firestore using a batch write.
 */
export async function syncCollectionToFirestore(collectionName, items) {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach((item) => {
      if (item && item.id) {
        const docRef = doc(db, collectionName, String(item.id));
        const sanitized = JSON.parse(JSON.stringify(item));
        batch.set(docRef, sanitized, { merge: true });
      }
    });
    await batch.commit();
  } catch (error) {
    console.warn(`Firestore batch sync failed for ${collectionName}:`, error.message);
  }
}

/**
 * Delete a single document from Firestore.
 */
export async function removeDocument(collectionName, docId) {
  try {
    if (!docId) return;
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete failed for ${collectionName}/${docId}:`, error.message);
  }
}

