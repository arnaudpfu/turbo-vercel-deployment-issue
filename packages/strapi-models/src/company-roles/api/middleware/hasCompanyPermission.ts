/**
 * Used to restrict access to the following content types:
 * - "api::slot.*"
 * - "api::service.*"
 * - "api::participant-data-schema.*"
 * - "api::company-setting.*"
 * - "api::checkout.*"
 * - "api::booking.*"
 * - "api::company-role.": ["create", "find", "findOne", "update", "delete"]
 * - "api::company": [ "findOne", "update", "delete" ] => "create" is out of scope (@note: won't work for this one)
 * based on the company.
 *
 * This middleware checks if the user has the necessary permissions to access the requested resource.
 * Connection between the user and the company is established through the "api::company-role" content type.
 *
 * This middleware is a restriction, wich means if a content type is not concerned by this middleware, it will be accessible by any user. (without speaking about other middlewares)
 */

import { CompanyRole } from '@internalpackage/types';
import type { Core } from '@strapi/strapi';
import { UID } from '@strapi/types';
import { AllCompanyRoles, Permissions } from '../../constants';
import { uidFromSlug } from './permissionKey';
import { getCompanyDocID, getPermissionKeys } from './utils';

export const hasCompanyPermission = async <TUID extends UID.ContentType>(
    strapi: Core.Strapi,
    ctx: any
): Promise<any | true> => {
    const userDocID = ctx.state.user.documentId;
    console.log('userDocID');
    console.log(userDocID);
    if (!userDocID) {
        return ctx.unauthorized('You are not logged in.');
    }

    const path = getPermissionKeys(ctx);
    console.log('Path');
    console.log(path);
    if (typeof path === 'string') {
        return ctx.badRequest(
            'Invalid request. Your request does not match any known permission. MESSAGE: ' + path
        );
    }

    // @ts-ignore
    const uid = uidFromSlug[path.contentType] as TUID;
    const companyDocID = await getCompanyDocID(strapi, ctx, uid);
    console.log('companyDocID ');
    console.log(companyDocID);
    if (!companyDocID) {
        return ctx.badRequest('No company documentId associated to this request.');
    }

    const companyRoles = await strapi.documents('api::company-role.company-role').findMany({
        filters: {
            user: {
                documentId: userDocID,
            },
            company: {
                documentId: companyDocID,
            },
            status: 'confirmed',
        },
    });

    if (!Array.isArray(companyRoles) || companyRoles.length === 0) {
        return ctx.unauthorized('You are not member of this company.');
    } else if (companyRoles.length > 1) {
        // delete all except highest role ...
    }

    const companyRole = companyRoles[0] as unknown as CompanyRole;

    const permissions = (companyRole.custom_config || AllCompanyRoles[companyRole.role]) as Permissions;

    // console.log('companyRole');
    // console.log(companyRole);

    // console.log('permissions');
    // console.log(permissions);

    // console.log('ctx');
    // console.log(ctx);

    // @ts-ignore
    const hasPermission = permissions[path.contentType]?.[path.key];
    if (!hasPermission) {
        return ctx.unauthorized('You do not have the necessary permissions to access this resource.');
    }

    console.log('res after taht');

    return true;
};
