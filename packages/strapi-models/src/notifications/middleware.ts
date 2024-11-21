import { CompanyRole, Populated } from '@internalpackage/types';
import { StrapiUtils } from '@internalpackage/utils';
import type { Core } from '@strapi/strapi';
import { isEqual } from 'lodash';
import { Paths } from 'type-fest';
import { Permissions } from '../company-roles/constants';
import { parseAPIUrl } from '../utils';
import { getRolesWithPermissions } from './utils';

/* 
const notificationTypes = {
    'company-roles': [
        'company-invitation',
        'user-fired',
        'user-quit'
    ],
    'bookings': [
        'create',
        'delete'
    ],
    'slots': [
        'create',
        'moved', // todo later
        'delete'
    ]
}
*/

const NOTIFICATION_TRACES = {
    'company-roles': {
        'company-invitation': {
            method: 'POST',
            urlSegments: [],
        },
        // 'you-have-been-fired': {
        //     method: 'DELETE',
        //     urlSegments: [],
        //     custom: (n: NotificationMiddleware) => n.isUser('fired'),
        // },
        'user-fired': {
            method: 'DELETE',
            urlSegments: [],
            custom: (n: NotificationMiddleware) => n.isUser('fired'),
        },
        'user-quit': {
            method: 'DELETE',
            urlSegments: [],
            custom: (n: NotificationMiddleware) => n.isUser('resigned'),
        },
    },
    bookings: {
        create: {
            method: 'POST',
            urlSegments: [],
        },
        delete: {
            method: 'DELETE',
            urlSegments: [],
        },
    },
    // to implement later
    slots: {
        create: {
            method: 'POST',
            urlSegments: [],
        },
        delete: {
            method: 'DELETE',
            urlSegments: [],
        },
    },
} as const;

export class NotificationMiddleware {
    // private config: any;
    private strapi: Core.Strapi;
    private ctx: any;
    private contentType: string;
    private urlSegments: string[];

    constructor(strapi: Core.Strapi, ctx: any) {
        // this.config = config;
        this.strapi = strapi;
        this.ctx = ctx;
        const [contentTypes, ...params] = parseAPIUrl(ctx.request.url);
        this.contentType = contentTypes;
        this.urlSegments = params;
    }

    private async createNotification(data: any): Promise<void> {
        await this.strapi.documents('api::notification.notification').create({
            data: {
                status: 'unread',
                ...data,
            },
        });
    }

    private getCompany(): string | null {
        // const body = await this.strapi
        //     .service('api::notification.notification')
        //     .sanitizeInput(this.ctx.request.body, this.ctx);

        const body = this.ctx.request.body;
        const companyDocID = StrapiUtils.extractDocID(body.data.company);
        // body.company?.documentId ||
        // (typeof body.data?.company === 'string' ? body.data?.company : body.data?.company?.documentId) ||
        // body.data?.company?.data?.documentId;
        return companyDocID;
    }

    private async getCompanyRoles(role: Paths<Permissions>): Promise<Populated<CompanyRole>[]> {
        const roles = getRolesWithPermissions(role);
        const companyDocID = this.getCompany();

        const associatedCompanyRoles = await this.strapi
            .documents('api::company-role.company-role')
            .findMany({
                filters: {
                    company: { documentId: companyDocID },
                    role: { $in: roles },
                },
                populate: 'user',
            });

        if (!Array.isArray(associatedCompanyRoles)) {
            throw new Error('No associated company roles found');
        }

        return associatedCompanyRoles as unknown as Populated<CompanyRole>[];
    }

    public async isUser(action: 'fired' | 'resigned'): Promise<boolean> {
        const documentId = this.ctx.params.documentId;
        if (typeof documentId !== 'string') {
            throw new Error('Invalid request. documentId is not a string');
        }

        const companyRole = await this.strapi.documents('api::company-role.company-role').findOne({
            documentId,
            populate: ['user'],
        });
        if (!companyRole) {
            throw new Error('Invalid request. company role not found');
        }

        const isHimself = companyRole.user.documentId === this.ctx.state.user.documentId;
        return (action === 'fired' && !isHimself) || (action === 'resigned' && isHimself);
    }

    private async getType(): Promise<Paths<typeof NOTIFICATION_TRACES> | null> {
        for (const cT in NOTIFICATION_TRACES) {
            // @ts-ignore
            for (const nT in NOTIFICATION_TRACES[cT]) {
                // @ts-ignore
                const trace = NOTIFICATION_TRACES[cT][nT];
                if (
                    this.contentType === cT &&
                    this.ctx.request.method === trace.method &&
                    isEqual(this.urlSegments, trace.urlSegments) &&
                    (trace.custom ? await trace.custom(this) : true)
                ) {
                    return (cT + '.' + nT) as Paths<typeof NOTIFICATION_TRACES>;
                }
            }
        }

        return null;
    }

    public async start(next: () => Promise<any>): Promise<void> {
        const userDocID = this.ctx.state.user?.documentId as string | undefined;
        console.log('this.ctx.state.user?.documentId');
        console.log(this.ctx.state.user?.documentId);
        console.log(this.ctx.state.user);
        console.log(this.ctx.state);

        const type = await this.getType();
        const res = await next();

        console.log('this.ctx.response.body');
        console.log(this.ctx.response.body);
        console.log(this.ctx.response.body?.data);
        console.log(this.ctx.response);
        console.log(this.ctx);
        console.log('res');
        console.log(res);

        const documentId = (this.ctx.response.body?.data?.documentId as string) || undefined;
        console.log('documentId');
        console.log(documentId);

        switch (type) {
            case 'company-roles.company-invitation':
                if (!documentId) break;
                const invitationCompanyRole = await this.strapi
                    .documents('api::company-role.company-role')
                    .findOne({
                        documentId,
                        populate: ['user'],
                    });

                await this.createNotification({
                    user: invitationCompanyRole?.user.documentId,
                    type: type,
                    data: {
                        companyRoleDocID: documentId,
                    },
                });
                break;
            case 'company-roles.user-fired':
            case 'company-roles.user-quit':
                // we need to get all users of the company with permissions bookings.create
                const presentCompanyRoles = await this.getCompanyRoles('company-roles.view');
                const companyDocID = this.getCompany();

                // @todo: send notification if user is fired
                if (type === 'company-roles.user-fired' && documentId) {
                    const deletedCompanyRole = await this.strapi
                        .documents('api::company-role.company-role')
                        .findOne({
                            documentId,
                            populate: ['user'],
                        });

                    await this.createNotification({
                        user: deletedCompanyRole?.user.documentId,
                        type: 'company-roles.you-have-been-fired',
                        data: {
                            company: companyDocID,
                        },
                    });
                }

                for (const singleCompanyRole of presentCompanyRoles) {
                    if (
                        userDocID &&
                        (singleCompanyRole.user as unknown as { documentId: string }).documentId === userDocID
                    )
                        continue;
                    await this.createNotification({
                        user: (singleCompanyRole.user as unknown as { documentId: string }).documentId,
                        type: type,
                        data: {
                            company: companyDocID,
                        },
                    });
                }
                break;
            case 'bookings.create':
            case 'bookings.delete':
                const associatedCompanyRoles = await this.getCompanyRoles('bookings.view');

                if (Array.isArray(associatedCompanyRoles)) {
                    for (const singleCompanyRole of associatedCompanyRoles) {
                        if (
                            userDocID &&
                            (singleCompanyRole.user as unknown as { documentId: string }).documentId ===
                                userDocID
                        )
                            continue;
                        await this.createNotification({
                            user: (singleCompanyRole.user as unknown as { documentId: string }).documentId,
                            type: type,
                            data: {
                                bookingDocID: documentId,
                            },
                        });
                    }
                }
            // create api::notification.notification with type: company-roles.company-invitation
            /*
                {
                data: {
                    user: userID,
                    type: 'company-roles.company-invitation',
                    status: 'unread',
                    data {
                    
                    }
                }
                */
        }

        return res;
    }
}

// @ts-ignore
export const startNotificationMiddleware = (config, { strapi }: { strapi: Strapi }) => {
    // Add your own logic here.
    // @ts-ignore
    return async (ctx, next) => {
        try {
            const m = new NotificationMiddleware(strapi, ctx);
            return m.start(next);
        } catch (e: any) {
            console.log(e);
            return ctx.badRequest('Issue in the notification middleware : ' + e.message);
        }
    };
};
