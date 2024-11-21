export const notificationTypes = {
    'company-roles': ['company-invitation', 'user-fired', 'user-quit'],
    bookings: ['create', 'delete'],
    slots: [
        'create',
        'moved', // todo later
        'delete',
    ],
};

export interface NotificationData {
    'company-roles.company-invitation': {
        companyRoleID: string;
    };
    'company-roles.user-fired': {
        companyDocID: string;
    };
    'company-roles.you-have-been-fired': {
        companyDocID: string;
    };
    'company-roles.user-quit': {
        companyDocID: string;
    };
    'bookings.create': {
        bookingDocID: string;
    };
    'bookings.delete': {
        bookingDocID: string;
    };
}
