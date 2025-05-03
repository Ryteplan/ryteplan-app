import { ref, onUnmounted } from 'vue';
import { defineStore } from 'pinia';
import { doc, collection, setDoc, Timestamp } from 'firebase/firestore';

import { useDialogStore } from '@/stores/dialogStore';
import { useUserStore } from '@/stores/userStore';
import { ActionResponse, availableActions } from '@/stores/ActionResponse';

import { observeUserLists } from '@/database/userLists';
import { dbFireStore } from '@/firebase';

const checkPlanLimits = (userLists) => {
  if (userLists.value.length >= 30) {
    return new ActionResponse({
      missingPermissions: ['basicUser'],
      name: 'createNewList',
      status: 'error',
      data: {
        message: 'User has reached the maximum limit of 30 lists',
      },
    });
  }
};
export const useUserActionsStore = defineStore('userActions', () => {
  const userLists = ref([]);
  const user = useUserStore();
  const dialogStore = useDialogStore();
  console.log('subscribed to user lists', user);
  const unsubscribeToUserLists = observeUserLists(
    user.userInfo.uid,
    (lists) => {
      userLists.value = lists;
    }
  );

  const checkUserPermissions = (institutionIds) => {
    const action = availableActions.createNewList;
    const missingPermissions = action.checkMissingPermissions(user);
    if (missingPermissions) return missingPermissions;
    const planLimits = checkPlanLimits(userLists);
    if (planLimits) return planLimits;
    if (institutionIds.length > 30) {
      return new ActionResponse({
        missingPermissions: ['basicUser'],
        name: 'createNewList',
        status: 'error',
        data: {
          message: 'User has reached the maximum limit of 30 institutions per list',
        },
      });
    }
    return;
  };

  async function createNewList(listName, institutionIds =[]) {
    const response = checkUserPermissions(institutionIds);
    if (response) {
      dialogStore.showActionDialog(response)
      return response;
    }

    const newDocRef = doc(collection(dbFireStore, 'lists'));
    const data = {
      name: listName,
      createdBy: user.userInfo.uid,
      created: Timestamp.now(),
      updated: Timestamp.now(),
      institutions: institutionIds,
    }
    await setDoc(newDocRef, data);
    return new ActionResponse({
      name: 'createNewList',
      status: 'success',
      data: {
        message: 'List created successfully',
        listId: newDocRef.id,
      },
    });
  }

  onUnmounted(async () => {
    await unsubscribeToUserLists;
  });

  return {
    createNewList,
    userLists,
  };
});
