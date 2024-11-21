import { Context } from '@internalpackage/strapi-extra-types';
import { CompanyIDDocKey, IDDocKey } from '@internalpackage/types';
import type { Core } from '@strapi/strapi';
import { UID } from '@strapi/types';
import { parseAPIUrl } from '../../../utils/functions';
import { permissionKey } from './permissionKey';

export const getCompanyDocID = async <TUID extends UID.ContentType>(
    strapi: Core.Strapi,
    ctx: Context<CompanyIDDocKey | IDDocKey | 'id', any>,
    uid: TUID
): Promise<string | null> => {
    const { companyDocID } = ctx.params;
    if (typeof companyDocID === 'string') {
        return companyDocID;
    }

    // strapi call the first params `id` by default
    const documentId = ctx.params.id ?? ctx.params.documentId ?? undefined;
    // @ts-ignore
    if (!isNaN(parseInt(documentId, 10))) {
        throw new Error('Invalid documentId, number id should not be used');
    }

    if (!documentId) {
        if (ctx.request.method === 'POST') {
            const body = (await strapi
                .controller(uid as UID.Controller)
                // @ts-ignore
                .sanitizeInput(ctx.request.body, ctx)) as CompanyIDContext['request']['body'];
            // @note: won't work for the company content type

            const companyDocID =
                body.company?.documentId ||
                (typeof body.data?.company === 'string'
                    ? body.data?.company
                    : body.data?.company?.documentId) ||
                body.data?.company?.data?.documentId;
            return companyDocID;
        }
        return null;
    }

    if (ctx.request.url.startsWith('/api/companies/')) {
        return documentId;
    }

    const entry = await strapi.documents(uid as UID.Service).findOne({ documentId, populate: 'company' });
    if (!entry?.company.documentId) {
        throw new Error('Company documentId not defined.');
    }
    return entry?.company.documentId || null;
};

function isDocumentId(id: string): boolean {
    const documentIdPattern = /^[a-z0-9]{24}$/;
    return documentIdPattern.test(id);
}

export const getPermissionKeys = (ctx: any): { contentType: string; key: string } | string => {
    const method = ctx.request.method;
    const [contentTypes, ...params] = parseAPIUrl(ctx.request.url);

    // @ts-ignore
    const routeKeysByHTTPMethod = permissionKey[contentTypes];
    if (!routeKeysByHTTPMethod) {
        return contentTypes + ' is not a permission key.';
    }

    const routeKeys = routeKeysByHTTPMethod[method];
    if (!routeKeys) {
        return 'Method ' + method + ' is not supported for ' + contentTypes;
    }

    const route = Boolean(params[0]) && !isDocumentId(params[0]) ? params[0] : 'root';
    const key = routeKeys[route];
    if (!key) {
        return "Route '" + route + "' is not supported for " + contentTypes;
    }

    return {
        contentType: contentTypes,
        key,
    };
};
