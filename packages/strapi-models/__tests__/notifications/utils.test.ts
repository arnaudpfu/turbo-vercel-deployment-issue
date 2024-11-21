import { getRolesWithPermissions } from '../../src/notifications/utils';

describe('check the getRolesWithPermissions function', () => {
    it('should return owner and editor', () => {
        expect(getRolesWithPermissions('bookings.view')).toEqual(['owner', 'editor', 'secretary']);
    });
});
