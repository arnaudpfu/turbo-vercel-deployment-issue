import { Context } from '@internalpackage/strapi-extra-types';
import { CompanyIDDocKey } from '@internalpackage/types';
import type { Core } from '@strapi/strapi';
import { UID } from '@strapi/types';
import { Base, ContentType, Generic } from '@strapi/types/dist/core/core-api/controller';

export const findByCompany = async <TUID extends UID.ContentType>(
    strapi: Core.Strapi,
    t: Partial<Base> & Generic,
    uid: TUID,
    ctx: Context<CompanyIDDocKey>
): Promise<(Partial<ContentType<TUID>> & Generic) | Context<CompanyIDDocKey> | void> => {
    try {
        await t.validateQuery?.(ctx);
        const sanitizedQueryParams = await t.sanitizeQuery?.(ctx);

        const { companyDocID } = ctx.params;
        if (typeof companyDocID !== 'string') {
            ctx.response.status = 400;
            return ctx.badRequest('companyDocID must be a string') as Context<CompanyIDDocKey>;
        }

        // console.log( 'ctx' )
        // console.log( ctx )
        console.log('sanitizedQueryParams');
        console.log(sanitizedQueryParams);

        // Perform whatever custom actions are needed
        const { results, pagination } = await strapi.service(uid as UID.Service).find({
            ...sanitizedQueryParams,
            filters: {
                ...(sanitizedQueryParams?.filters || {}),
                company: {
                    documentId: {
                        $eq: companyDocID,
                    },
                },
            },
        });

        // sanitizeOutput removes any data that was returned by our query that the ctx.user should not have access to
        const sanitizedResults = await t.sanitizeOutput?.(results, ctx);

        if (!Array.isArray(sanitizedResults)) {
            ctx.response.status = 400;
            return ctx.badRequest('No entities found') as Context<CompanyIDDocKey>;
        }

        // transformResponse correctly formats the data and meta fields of your results to return to the API
        if (t.transformResponse) {
            return t.transformResponse(sanitizedResults, { pagination }) as
                | (Partial<ContentType<TUID>> & Generic)
                | Context<CompanyIDDocKey>;
        }
    } catch {
        ctx.badRequest(uid + '.findByCompany controller error');
    }
};
