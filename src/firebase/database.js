import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, getConnectionState } from "./config.js";

// Retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Retry utility function
const retryOperation = async (operation, attempts = RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(
        `Operation failed (attempt ${i + 1}/${attempts}):`,
        error.message,
        error.code
      );

      if (i === attempts - 1) {
        throw error;
      }

      // Check if it's a retryable error
      const retryableErrors = [
        "unavailable",
        "deadline-exceeded",
        "internal",
        "unknown",
        "aborted",
      ];

      if (retryableErrors.includes(error.code)) {
        await new Promise(
          (resolve) => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)) // Exponential backoff
        );
      } else {
        throw error; // Don't retry for other types of errors
      }
    }
  }
};

export const firebaseDB = {
  // Add a new document to a collection
  async addDocument(collectionName, data) {
    try {
      // Check connection state
      if (!getConnectionState()) {
        return { success: false, error: "No internet connection" };
      }

      const docRef = await retryOperation(async () => {
        return await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding document:", error);
      return { success: false, error: error.message };
    }
  },

  // Update a document
  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating document:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete a document
  async deleteDocument(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all documents from a collection
  async getDocuments(collectionName, userId = null) {
    try {
      // Check connection state
      if (!getConnectionState()) {
        return { success: false, error: "No internet connection", data: [] };
      }

      let q = collection(db, collectionName);

      if (userId) {
        q = query(q, where("userId", "==", userId));
      }

      const querySnapshot = await retryOperation(async () => {
        return await getDocs(q);
      });

      const documents = [];

      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return { success: true, data: documents };
    } catch (error) {
      console.error("Error getting documents:", error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get documents with ordering
  async getDocumentsOrdered(
    collectionName,
    orderByField,
    orderDirection = "desc",
    userId = null
  ) {
    try {
      let q = collection(db, collectionName);

      if (userId) {
        q = query(q, where("userId", "==", userId));
      }

      q = query(q, orderBy(orderByField, orderDirection));

      const querySnapshot = await getDocs(q);
      const documents = [];

      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return { success: true, data: documents };
    } catch (error) {
      console.error("Error getting ordered documents:", error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Listen to real-time updates (use sparingly)
  subscribeToCollection(collectionName, callback, userId = null) {
    let q = collection(db, collectionName);

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(documents);
    });
  },

  // Listen to ordered collection updates (use sparingly)
  subscribeToOrderedCollection(
    collectionName,
    orderByField,
    orderDirection = "desc",
    callback,
    userId = null
  ) {
    let q = collection(db, collectionName);

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    q = query(q, orderBy(orderByField, orderDirection));

    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(documents);
    });
  },

  // Batch fetch multiple collections at once
  async getMultipleCollections(collections, userId = null) {
    try {
      const promises = collections.map(
        ({ name, orderByField, orderDirection }) => {
          if (orderByField) {
            return this.getDocumentsOrdered(
              name,
              orderByField,
              orderDirection,
              userId
            );
          } else {
            return this.getDocuments(name, userId);
          }
        }
      );

      const results = await Promise.all(promises);

      const data = {};
      collections.forEach(({ name }, index) => {
        data[name] = results[index].success ? results[index].data : [];
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error fetching multiple collections:", error);
      return { success: false, error: error.message, data: {} };
    }
  },
};
