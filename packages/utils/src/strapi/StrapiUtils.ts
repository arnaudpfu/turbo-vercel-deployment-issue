import { Company } from '@internalpackage/types';
import { UID } from '@strapi/types';

export class StrapiUtils {
    public static extractDocID(
        data:
            | undefined
            | string
            | null
            | { documentId: string | null }
            | { data: { documentId: string | null } }
    ): string | null {
        if (!data) {
            return null;
        }

        if (typeof data === 'string') {
            return data;
        }

        if (typeof (data as { documentId: string | null }).documentId === 'string') {
            return (data as { documentId: string | null }).documentId;
        }
        if (typeof (data as { data: { documentId: string | null } }).data?.documentId === 'string') {
            return (data as { data: { documentId: string | null } }).data.documentId;
        }
        return null;
    }

    private static extractLifeCycleId(data: { set: [{ id: number }] }): number | null {
        if (Object.hasOwn(data, 'set')) {
            return data.set[0].id;
        }
        return null;
    }

    public static async convertIdToDocId(id: number, uid: UID.Service): Promise<string | null> {
        const company = (await strapi.entityService.findOne(uid, id)) as Company | null;
        return company?.documentId ?? null;
    }

    public static async extractLifeCycleDocId(data: { set: [{ id: number }] }): Promise<string | null> {
        const id = StrapiUtils.extractLifeCycleId(data);
        if (id === null) {
            return null;
        }

        return await StrapiUtils.convertIdToDocId(id, 'api::company.company');
    }
}
