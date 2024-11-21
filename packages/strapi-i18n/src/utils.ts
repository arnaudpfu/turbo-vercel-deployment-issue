import { replaceDynamicValue } from '@internalpackage/utils';
import en from '../en.json';
import fr from '../fr.json';

type Translation = typeof en;

export type Translator = (key: keyof Translation, params?: Record<string, string | number | null>) => string;

/**
 * Create a translator function
 *
 * @param path Path to the i18n folder
 * @param locale fr or en
 * @returns
 */
export const createTranslator = (locale: 'en' | 'fr'): Translator => {
    const messages = (locale === 'en' ? en : fr) as Record<string, string>;

    return (key: keyof Translation, params?: Record<string, string | number | null>) => {
        let message = messages[key] || '';
        if (params) {
            message = replaceDynamicValue(message, params);
        }
        return message;
    };
};
