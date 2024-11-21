import type { Event } from '@strapi/database/dist/lifecycles';
import type { Core } from '@strapi/strapi';
import type { UID } from '@strapi/types';
import { StrapiUtils } from './StrapiUtils';

/**
 * A bunch of logic that can be used in strapi model lifecycles.
 */
export class StrapiLifecycle {
    /**
     * Set relative ID.
     *
     * @throws Error if company documentId not found
     *
     * @param event
     * @param uid
     */
    public static async setRelativeID(event: Event, uid: UID.Service): Promise<void> {
        const { data } = event.params;

        const companyDocId = await StrapiUtils.extractLifeCycleDocId(data.company);

        if (null === companyDocId) {
            throw new Error('company documentId not found');
        }

        const entry = await (strapi as unknown as Core.Strapi).documents(uid).findFirst({
            fields: ['relative_id'],
            filters: { company: { documentId: companyDocId } },
            sort: 'relative_id:desc',
        });

        event.params.data.relative_id = !entry ? 1 : entry.relative_id + 1;
    }

    /**
     * Generate slug.
     *
     * @param event
     * @param uid
     */
    public static async generateSlug(event: Event, uid: string): Promise<void> {
        const { data } = event.params;

        if (data.name && !data.slug) {
            data.slug = await strapi.service('plugin::content-manager.uid').generateUIDField({
                contentTypeUID: uid,
                field: 'slug',
                data,
            });
        }
    }
}
