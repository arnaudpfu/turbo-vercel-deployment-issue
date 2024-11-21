import { Core } from '@strapi/strapi';
import { DEFAULT_SETTINGS, SettingTypes } from './settings';

/**
 * Get company settings
 *
 * @throws Error if no setting slug is passed or if company with ID is not found (when a company setting attribute is requested)
 *
 * @param companyDocID Company ID
 * @param settingSlugs Array of setting slugs
 * @returns
 */
export const getCompanySettingsFromStrapi = async <Keys extends keyof SettingTypes>(
    companyDocID: string,
    settingSlugs: Keys[]
): Promise<Pick<SettingTypes, Keys>> => {
    if (settingSlugs.length === 0) {
        throw new Error('You must pass at least one setting slug');
    }

    const res = {} as Pick<SettingTypes, Keys>;

    const companySettingSlugs: string[] = [];
    const attributeSlugs: string[] = [];

    for (const setting of settingSlugs) {
        if (setting.startsWith('company_')) {
            attributeSlugs.push(setting);
        } else {
            companySettingSlugs.push(setting);
        }
    }

    if (attributeSlugs.length) {
        const slugsWithoutPrefix = attributeSlugs.map((slug) => slug.replace('company_', ''));
        const company = await (strapi as unknown as Core.Strapi).documents('api::company.company').findOne({
            documentId: companyDocID,
            fields: slugsWithoutPrefix,
        });

        if (!company) {
            throw new Error(`Company with ID ${companyDocID} not found.`);
        }

        for (const slug of slugsWithoutPrefix) {
            res[`company_${slug}` as Keys] = company[slug] ?? DEFAULT_SETTINGS[`company_${slug}` as Keys];
        }
    }

    if (companySettingSlugs.length) {
        const companySettingsEntity = await (strapi as unknown as Core.Strapi)
            .documents('api::company-setting.company-setting')
            .findMany({
                filters: {
                    $or: companySettingSlugs.map((slug) => ({ slug })) as { slug: string }[],
                    company: {
                        documentId: companyDocID,
                    },
                },
            });

        const entities = Array.isArray(companySettingsEntity)
            ? companySettingsEntity
            : companySettingsEntity
              ? [companySettingsEntity]
              : null;

        for (const setting of companySettingSlugs) {
            res[setting as Keys] =
                (
                    (entities as unknown as null | { slug: string }[])?.find(
                        (entry) => entry.slug === setting
                    ) as {
                        value?: {
                            json: SettingTypes[Keys];
                        };
                    }
                )?.value?.json || DEFAULT_SETTINGS[setting as Keys];
        }
    }

    return res;
};
