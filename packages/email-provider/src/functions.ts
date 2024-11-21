import { getCompanySettingsFromStrapi } from '@internalpackage/app-settings';
import type { Core } from '@strapi/strapi';
import { sendEmail } from './email';
import { generateSimpleEmail } from './templates/simple';

export const EMAILABLE_STATUSES = ['confirmed', 'requires_slot_confirmation'];

export async function sendSimpleEmail(
    title: string,
    paragraph: string,
    email: string,
    subject: string,
    companyDocID: string
): Promise<void> {
    const {
        email_provider: emailProvider,
        primary_color: primaryColor,
        email_displayed_name: emailDisplayedName,
        disable_email: disableEmail,
    } = await getCompanySettingsFromStrapi(companyDocID, [
        'email_provider',
        'primary_color',
        'email_displayed_name',
        'disable_email',
    ]);

    if (disableEmail) return;

    const company = await (strapi as unknown as Core.Strapi)
        .documents('api::company.company')
        .findOne({ documentId: companyDocID });

    const htmlTemplate = generateSimpleEmail(title, paragraph, {
        company,
        mailSettings: {
            primaryColor,
        },
    } as any);

    sendEmail(
        {
            from: { name: emailDisplayedName || '', address: '' },
            to: email,
            subject,
            html: htmlTemplate,
        },
        emailProvider
    );
}
