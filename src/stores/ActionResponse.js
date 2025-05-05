class Action {
  constructor({ name, permissions=[] }) {
    this.name = name;
    this.permissions = permissions;
  }

  get requireAccountSetup() {
    return this.permissions.includes('accountSetup');
  }

  checkMissingPermissions(user) {
    const missingPermissions = this.permissions.filter((permission) =>
      !user.permissions.includes(permission)
    );
    const firstMissingPermission = missingPermissions[0];

    if (firstMissingPermission === 'olderThan13') {
      return new ActionResponse({
        missingPermissions,
        name: this.name,
        status: 'error',
        data: {
          title: 'Account Age Restriction',
          message: 'User must be older than 13 to perform this action. For your security your data will be deleted promptly.',
        },
      });
    }
    if (missingPermissions.length > 0) {
      return new ActionResponse({
          missingPermissions,
          name: this.name,
        status: 'error',
        data: {
            message: `User needs to complete the following steps: ${missingPermissions.join(', ')}`,
        },
      });
    }
  }
  hasPermission(user) {
    return this.checkMissingPermissions(user).missingPermissions.length === 0;
  }
}

export const availableActions = {
  createNewList: new Action({
    name: 'createNewList',
    permissions: ['loggedIn', 'accountSetup', 'olderThan13'],
  }),
};

export class ActionResponse {
  constructor({ name, status, data, missingPermissions = [] }) {
    this.name = name;
    this.status = status;
    this.data = data;
    this.missingPermissions = missingPermissions;
  }

  get isError() {
    return this.status === 'error';
  }

  get isSuccess() {
    return this.status === 'success';
  }
}

