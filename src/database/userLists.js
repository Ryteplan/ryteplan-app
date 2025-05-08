import { dbFireStore } from '../firebase';
import {
  query,
  collection,
  onSnapshot,
  orderBy,
  where,
} from 'firebase/firestore';

export async function observeUserLists(userID, callback) {
  const listsQuery = query(
    collection(dbFireStore, 'lists'),
    orderBy('created', 'desc'),
    where('createdBy', '==', userID)
  );
  return onSnapshot(listsQuery, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
}
