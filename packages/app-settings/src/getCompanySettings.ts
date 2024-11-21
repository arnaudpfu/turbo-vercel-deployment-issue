import type { CompanySetting, Populated } from '@internalpackage/types';
import { RequestHelper } from '@internalpackage/utils';
import { DEFAULT_SETTINGS, SettingTypes } from './settings';

export async function getCompanySettings<Keys extends keyof SettingTypes>({
    jwt,
    companyDocID,
    settingSlugs,
}: {
    jwt?: string;
    companyDocID: string;
    settingSlugs: readonly Keys[];
}): Promise<Pick<SettingTypes, Keys>> {
    const relativeUrl =
        `/company-settings/findByCompany/${companyDocID}?${settingSlugs.map((s, i) => `filters[$or][${i}][slug]=${s}`).join('&')}${settingSlugs.length > 0 ? '&' : ''}populate=*` as const;

    const values = Object.fromEntries(settingSlugs.map((s) => [s, DEFAULT_SETTINGS[s]])) as Pick<
        SettingTypes,
        Keys
    >;

    if (jwt) {
        await RequestHelper.loadAuth({
            jwt,
            relativeUrl,
            onLoad: (res) => {
                res.data.forEach((setting: Populated<CompanySetting>) => {
                    values[setting.slug as Keys] = setting.value?.json;
                });
            },
        });
    } else {
        await RequestHelper.load({
            relativeUrl,
            onLoad: (res) => {
                res.data.forEach((setting: Populated<CompanySetting>) => {
                    values[setting.slug as Keys] = setting.value?.json;
                });
            },
        });
    }

    return values;
}
