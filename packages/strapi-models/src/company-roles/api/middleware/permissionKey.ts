export const uidFromSlug = {
    bookings: 'api::booking.booking',
    checkouts: 'api::checkout.checkout',
    companies: 'api::company.company',
    'company-roles': 'api::company-role.company-role',
    'company-settings': 'api::company-setting.company-setting',
    'participant-data-schemas': 'api::participant-data-schema.participant-data-schema',
    services: 'api::service.service',
    slots: 'api::slot.slot',
};

/**
 * Enable to associate a permission key to an API endpoint.
 */
export const permissionKey = {
    bookings: {
        POST: {
            root: 'create',
            'send-recap-email': 'sendRecapEmail',
        },
        PUT: {
            root: 'update',
            charge: 'charge',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
    checkouts: {
        POST: {
            root: 'create',
        },
        PUT: {
            root: 'update',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
    companies: {
        POST: {
            upload: 'update',
        },
        PUT: {
            root: 'update',
        },
        GET: {
            root: 'view',
        },
        DELETE: {
            root: 'delete',
            deleteFile: 'update',
        },
    },
    'company-roles': {
        POST: {
            root: 'create',
        },
        PUT: {
            root: 'update',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
    'company-settings': {
        POST: {
            root: 'create',
            'sync-stripe': 'update', // can 'sync-stripe' if update permission is granted
            'verify-email-provider': 'update', // can 'verify-email-provider' if update permission is granted
        },
        PUT: {
            root: 'update',
            bulk: 'update',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
    'participant-data-schemas': {
        POST: {
            root: 'create',
        },
        PUT: {
            root: 'update',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
    services: {
        POST: {
            root: 'create',
        },
        PUT: {
            root: 'update',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
    slots: {
        POST: {
            root: 'create',
            findForAgenda: 'view',
        },
        PUT: {
            root: 'update',
            merge: 'update',
            move: 'move',
        },
        GET: {
            root: 'view',
            findByCompany: 'view',
        },
        DELETE: {
            root: 'delete',
        },
    },
};
