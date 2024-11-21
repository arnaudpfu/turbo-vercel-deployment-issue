import type { Translator } from '@internalpackage/strapi-i18n';
import { ParticipantDataSchema } from '@internalpackage/types';
import { findCellValue, getExtra } from '@internalpackage/utils';
import dayjs from 'dayjs';

const CURRENCY_SYMBOLS: Record<'eur' | 'usd', string> = {
    eur: '€',
    usd: '$',
};

const getDisplayableEmailValue = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
        return value ? '✅' : '❌';
    }

    if (typeof value === 'number') {
        if (isNaN(value)) {
            return '🚫';
        }
        return value.toString();
    }

    if (value === '') {
        return '🚫';
    }

    return value;
};

export const generateBookingConfirmationEmail = (
    t: Translator,
    emailContent: { title?: string; paragraph: string; customParagraph?: string },
    {
        booking,
        company,
        service,
        slot,
        mailSettings,
    }: {
        booking: Partial<{
            relative_id: number;
            firstname: string;
            lastname: string | null;
            email: string | null;
            phone: string | null;
            participants: Record<string, string | number | boolean>[] | null;
            customer_note: string | null;
            day: string;
            stripe_key: string | null;
            createdAt: string;
            // don't need the status, we know it's confirmed
        }>;
        company: Partial<{
            name: string;
            description: string;
            website: string | null;
            slug: string;
            createdAt: string;
            updatedAt: string;
            publishedAt: string;
            // logo: { data: Media | null };
            // illustrations: { data: Media | null };
            logo: Partial<{ url?: string }> | null;
        }>;
        service: Partial<{
            name: string;
            description: string | null;
            location: string | null;
            min_participant: number;
            max_participant: number | null;
            prices: any;
            state: 'draft' | 'published' | 'archived';
            relative_id: number;
            duration: string | null;
            calendar_color: string;
            createdAt: string;
            updatedAt: string;
            publishedAt: string;
            featured_image: Partial<{ url?: string }> | null;
            participant_data_schemas: ParticipantDataSchema[];
        }>;
        slot: Partial<{
            time: {
                end: string;
                start: string;
            };
        }>;
        mailSettings: Partial<{
            primaryColor: string;
            currency: 'eur' | 'usd';
        }>;
    }
): string => {
    console.log('TEMPLATE');
    console.log(booking);
    const details = booking.participants?.map((p) => ({
        amount:
            service.prices && service.participant_data_schemas
                ? findCellValue(service.prices.table, p, service.participant_data_schemas as any)
                : {
                      value: NaN,
                      location: { row: 0, col: 0 },
                  },
        participant: p,
        extra:
            service.prices && service.participant_data_schemas
                ? getExtra(service.prices.extra, p, service.participant_data_schemas as any)
                : [],
    }));

    const style = {
        primaryColor: mailSettings.primaryColor || '#0f172A',
    };

    const content = {
        title:
            emailContent.title ??
            // @ts-ignore
            t('email_client_title', {
                participantNumber: booking.participants?.length || 0,
                companyName: company.name || ' platform',
            }),
        firstParagraph: emailContent.paragraph,
        customParagraph: emailContent.customParagraph,
        service: {
            details: [
                // @ts-ignore
                { label: t('email_name_label'), value: service.name },
                // @ts-ignore
                { label: t('email_location_label'), value: service.location },
                {
                    // @ts-ignore
                    label: t('email_booking_date_label'),
                    // @ts-ignore
                    value: dayjs(booking.day).format(t('dateFormat')),
                },
                {
                    // @ts-ignore
                    label: t('email_duration_label'),
                    // @ts-ignore
                    value: dayjs('2000-01-01 ' + service.duration).format(t('durationFormat')),
                },
                {
                    // @ts-ignore
                    label: t('email_hours_label'),
                    value:
                        slot.time?.start && slot.time?.end
                            ? // @ts-ignore
                              t('time_interval', {
                                  // @ts-ignore
                                  from: dayjs('2000-01-01 ' + slot.time.start).format(t('timeFormat')),
                                  // @ts-ignore
                                  to: dayjs('2000-01-01 ' + slot.time.end).format(t('timeFormat')),
                              })
                            : null,
                },
            ],
            image: service.featured_image?.url,
        },
        booking: {
            col1: [
                // @ts-ignore
                { label: t('email_booking_id_label'), value: booking.relative_id },
                // @ts-ignore
                { label: t('email_firstname_label'), value: booking.firstname },
                // @ts-ignore
                { label: t('email_email_label'), value: booking.email },
                {
                    // @ts-ignore
                    label: t('email_total_amount_label'),
                    value:
                        details?.reduce(
                            (acc, d) =>
                                acc + d.amount.value + d.extra.reduce((accEx, e) => accEx + e.amount, 0),
                            0
                        ) +
                        ' ' +
                        (mailSettings?.currency ? CURRENCY_SYMBOLS[mailSettings.currency] : '€'),
                },
            ],
            col2: [
                {
                    // @ts-ignore
                    label: t('email_reservation_date_label'),
                    // @ts-ignore
                    value: dayjs(booking.createdAt).format(t('dateFormat')),
                },
                // @ts-ignore
                { label: t('email_lastname_label'), value: booking.lastname },
                // @ts-ignore
                { label: t('email_phone_label'), value: booking.phone },
                {
                    // @ts-ignore
                    label: t('email_confirmation_label'),
                    // @ts-ignore
                    value: booking.stripe_key ? t('email_credit_card') : undefined,
                },
            ],
            customer_note: booking.customer_note,
        },
        partcipants: service.participant_data_schemas
            ? booking.participants?.map((participant) => {
                  return Object.fromEntries(
                      (service.participant_data_schemas
                          ?.map((schema) => {
                              const value = getDisplayableEmailValue(participant[schema.slug]);
                              return schema.schema.type === 'calculation' && schema.schema.visible !== true
                                  ? null
                                  : [
                                        schema.name,
                                        value +
                                            ((schema.schema as { unit?: { used: boolean } }).unit?.used ===
                                            true
                                                ? ' ' +
                                                  (schema.schema as { unit: { value: string } }).unit.value
                                                : ''),
                                    ];
                          })
                          .filter(Boolean) as [string, string][]) ?? new Map()
                  );
              })
            : undefined,
        company: {
            name: company.name,
            website: company.website,
            logo: company.logo?.url,
        },
    };

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
.pl-title {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:bold;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:-1px;}
.pl-table-title {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:600;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.64px;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;}
.pl-table-value {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;}
.pl-link {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:${
        style.primaryColor
    };mso-line-height-rule:exactly;}
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (min-width: 481px) {
h1,img,p{margin:0;Margin:0}img,p{font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1{font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t13,.t131,.t176,.t179,.t183,.t206,.t218,.t220,.t5,.t58,.t9{width:570px!important}.t4{line-height:39px!important;font-size:34px!important}.t126,.t171,.t53{width:498px!important}.t46{width:57.14286%!important}.t166,.t44,.t89{padding-bottom:0!important;padding-right:5px!important}.t16,.t20,.t22,.t25,.t29,.t32,.t35,.t39,.t42{width:279.57px!important}.t134,.t138,.t142,.t144,.t147,.t151,.t154,.t157,.t161,.t164{width:493px!important}.t123,.t91{width:50%!important}.t102,.t106,.t109,.t112,.t116,.t119,.t61,.t65,.t67,.t70,.t74,.t77,.t80,.t84,.t87,.t93,.t97,.t99{width:244px!important}.t121{padding-left:5px!important}.t50{width:42.85714%!important}.t188{width:5.96491%!important}.t192,.t196,.t200,.t204{width:7.7193%!important}
}
</style>
<style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t183,.moz-text-html .t220,.moz-text-html .t5{width:570px!important}.moz-text-html .t4{line-height:39px!important;font-size:34px!important}.moz-text-html .t179{width:570px!important}.moz-text-html .t53{width:498px!important}.moz-text-html .t46{width:57.14286%!important}.moz-text-html .t44{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t35,.moz-text-html .t39,.moz-text-html .t42{width:279.57px!important}.moz-text-html .t176{width:570px!important}.moz-text-html .t171{width:498px!important}.moz-text-html .t166{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t134,.moz-text-html .t142,.moz-text-html .t144,.moz-text-html .t147,.moz-text-html .t151,.moz-text-html .t154,.moz-text-html .t157,.moz-text-html .t161,.moz-text-html .t164{width:493px!important}.moz-text-html .t131{width:570px!important}.moz-text-html .t138{width:493px!important}.moz-text-html .t13,.moz-text-html .t58{width:570px!important}.moz-text-html .t126{width:498px!important}.moz-text-html .t91{width:50%!important}.moz-text-html .t89{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t61,.moz-text-html .t65,.moz-text-html .t67,.moz-text-html .t70,.moz-text-html .t74,.moz-text-html .t77,.moz-text-html .t80,.moz-text-html .t84,.moz-text-html .t87{width:244px!important}.moz-text-html .t123{width:50%!important}.moz-text-html .t121{padding-left:5px!important}.moz-text-html .t102,.moz-text-html .t106,.moz-text-html .t109,.moz-text-html .t112,.moz-text-html .t116,.moz-text-html .t119,.moz-text-html .t93,.moz-text-html .t97,.moz-text-html .t99{width:244px!important}.moz-text-html .t16,.moz-text-html .t20,.moz-text-html .t22,.moz-text-html .t25,.moz-text-html .t29,.moz-text-html .t32{width:279.57px!important}.moz-text-html .t50{width:42.85714%!important}.moz-text-html .t206,.moz-text-html .t218{width:570px!important}.moz-text-html .t188{width:5.96491%!important}.moz-text-html .t192,.moz-text-html .t196,.moz-text-html .t200,.moz-text-html .t204{width:7.7193%!important}.moz-text-html .t9{width:570px!important}</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<style type="text/css">
img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1.t4{line-height:39px !important;font-size:34px !important}div.t46{width:57.14286% !important}td.t166,td.t44{padding-bottom:0 !important;padding-right:5px !important}div.t91{width:50% !important}td.t89{padding-bottom:0 !important;padding-right:5px !important}div.t123{width:50% !important}td.t121{padding-left:5px !important}div.t50{width:42.85714% !important}div.t188{width:5.96491% !important}div.t192,div.t196,div.t200,div.t204{width:7.7193% !important}
</style>
<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t224" style="min-width:100%;Margin:0px;padding:0px;background-color:#FAF8F5;"><div class="t223" style="background-color:#FAF8F5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t222" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#FAF8F5;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#FAF8F5"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td>
<!--[if mso]>
<table class="t221" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t221" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->

<tr>
<!--[if mso]>
<td class="t220" style="width:600px;padding:40px 15px 40px 15px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t220" style="width:450px;padding:40px 15px 40px 15px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">

${
    content.company?.logo
        ? `<tr><td>
<!--[if mso]>
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t1" style="width:40px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t1" style="width:40px;">
<!--<![endif]-->
<div style="font-size:0px;">
<img class="t0" style="display:block;border:0;Margin:0;width:auto;" width="40" height="40" alt="" src="${
              content.company.logo || 'https://via.placeholder.com/40x40'
          }"/>
</div></td>
</tr></table>
</td></tr>
<tr><td><div class="t3" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>`
        : ''
}
<tr><td>
<!--[if mso]>
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t5" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t5" style="width:450px;">
<!--<![endif]-->
<h1 class="t4" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:600;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:-1.36px;direction:ltr;color:${
        style.primaryColor
    };text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
        content.title || 'Booking confirmation'
    }</h1></td>
</tr></table>
</td></tr><tr><td><div class="t7" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t9" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t9" style="width:450px;">
<!--<![endif]-->
<p class="t8" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
        content.firstParagraph || 'Thanks for your reservation'
    }</p></td>
</tr></table>
</td></tr><tr><td><div class="t12" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>

${
    content.customParagraph
        ? `
<!--[if mso]>
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t9" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t9" style="width:450px;">
<!--<![endif]-->
<p class="t8" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
              content.customParagraph.replace(/\n/g, '<br />') || 'Thanks for your reservation'
          }</p></td>
</tr></table>
</td></tr>

<tr><td><div class="t12" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>`
        : ''
}

<tr><td>
<!--[if mso]>
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t14" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t13" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t13" style="width:450px;">
<!--<![endif]-->
<p class="t11 pl-title">Service</p></td>
</tr></table>
</td></tr><tr><td><div class="t52" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t54" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t54" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t53" style="background-color:#FFFFFF;border:1px solid #CFCFCF;overflow:hidden;width:570px;padding:30px 35px 30px 35px;border-radius:12px 12px 12px 12px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t53" style="background-color:#FFFFFF;border:1px solid #CFCFCF;overflow:hidden;width:378px;padding:30px 35px 30px 35px;border-radius:12px 12px 12px 12px;">
<!--<![endif]-->
<div class="t51" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="498"><tr><td width="284.57143" valign="top"><![endif]-->
<div class="t46" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:800px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t45"><tr>
<td class="t44" style="padding:0 0 15px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${content.service.details
    .map(({ label, value }) =>
        !value
            ? ''
            : `
  <tr><td>
<!--[if mso]>
<table class="t23" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t23" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t22" style="width:279.57px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t22" style="width:800px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
<!--[if mso]>
<table class="t17" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t17" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t16" style="width:279.57px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t16" style="width:600px;">
<!--<![endif]-->
<p class="t15 pl-table-title">${label}</p></td>
</tr></table>
</td></tr><tr><td><div class="t19" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t21" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t21" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t20" style="width:279.57px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t20" style="width:600px;">
<!--<![endif]-->
<p class="t18 pl-table-value">${value}</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr>
  `
    )
    .join(
        '<tr><td><div class="t31" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>'
    )}
</table></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="213.42857" valign="top"><![endif]-->
<div class="t50" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:600px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t49"><tr>
<td class="t48"><div style="font-size:0px;"><img class="t47" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;object-fit:cover;border-radius:8px;" width="213.42857142857144" height="350" alt="" src="${
        content.service.image || 'https://via.placeholder.com/213x350'
    }"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td><div class="t57" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>



<tr><td>
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t58" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t58" style="width:450px;">
<!--<![endif]-->
<p class="t56 pl-title">Details</p></td>
</tr></table>
</td></tr><tr><td><div class="t125" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t127" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t127" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t126" style="background-color:#FFFFFF;border:1px solid #CFCFCF;overflow:hidden;width:570px;padding:30px 35px 30px 35px;border-radius:12px 12px 12px 12px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t126" style="background-color:#FFFFFF;border:1px solid #CFCFCF;overflow:hidden;width:378px;padding:30px 35px 30px 35px;border-radius:12px 12px 12px 12px;">
<!--<![endif]-->
<div class="t124" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="498"><tr><td width="249" valign="top"><![endif]-->
<div class="t91" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:800px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t90"><tr>
<td class="t89" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${content.booking.col1
    .map(({ label, value }) =>
        value === '' || value === null || value === undefined
            ? ''
            : `
  <tr><td>
<!--[if mso]>
<table class="t68" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t68" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t67" style="width:244px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t67" style="width:800px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
<!--[if mso]>
<table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t62" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t61" style="width:244px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t61" style="width:600px;">
<!--<![endif]-->
<p class="t60 pl-table-title">${label}</p></td>
</tr></table>
</td></tr><tr><td><div class="t64" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t66" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t65" style="width:244px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t65" style="width:600px;">
<!--<![endif]-->
<p class="t63 pl-table-value">${value}</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr>
  `
    )
    .join(
        '<tr><td><div class="t76" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>'
    )}
</table></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="249" valign="top"><![endif]-->
<div class="t123" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:800px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t122"><tr>
<td class="t121"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${content.booking.col2
    .map(({ label, value }) =>
        value === '' || value === null || value === undefined
            ? ''
            : `
<tr><td>
<!--[if mso]>
<table class="t100" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t100" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t99" style="width:244px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t99" style="width:800px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
<!--[if mso]>
<table class="t94" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t94" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t93" style="width:244px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t93" style="width:600px;">
<!--<![endif]-->
<p class="t92 pl-table-title">${label}</p></td>
</tr></table>
</td></tr><tr><td><div class="t96" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t98" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t98" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t97" style="width:244px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t97" style="width:600px;">
<!--<![endif]-->
<p class="t95 pl-table-value">${value}</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr>
`
    )
    .join(
        '<tr><td><div class="t108" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>'
    )}

</table></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr>

<tr><td><div class="t128" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>

${
    content.booking.customer_note
        ? `
<tr>
<!--[if mso]>
<td class="t220" style="width:600px;padding:40px 15px 40px 15px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t220" style="width:450px;padding:40px 15px 40px 15px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
<!--[if mso]>
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t5" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t5" style="width:450px;">
<!--<![endif]-->
<p class="t11 pl-title">Note</p>
</td>
</tr></table>
</td></tr><tr><td><div class="t7" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>

<!--[if mso]>
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t9" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t9" style="width:450px;">
<!--<![endif]-->
<p class="t8" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${content.booking.customer_note.replace(
              /\n/g,
              '<br />'
          )}</p></td>
</tr></table>
</td></tr>

`
        : '<tr><td><div class="t130" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>'
}

${
    !content.partcipants || Object.keys(content.partcipants[0]).length === 0
        ? ''
        : `
<tr><td>
<!--[if mso]>
<table class="t132" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t132" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t131" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t131" style="width:450px;">
<!--<![endif]-->
<p class="t129 pl-title">Participants</p></td>
</tr></table>
</td></tr><tr><td><div class="t170" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t172" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t172" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t171" style="background-color:#FFFFFF;border:1px solid #CFCFCF;overflow:hidden;width:570px;padding:30px 35px 30px 35px;border-radius:12px 12px 12px 12px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t171" style="background-color:#FFFFFF;border:1px solid #CFCFCF;overflow:hidden;width:378px;padding:30px 35px 30px 35px;border-radius:12px 12px 12px 12px;">
<!--<![endif]-->
<div class="t169" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="498"><tr><td width="498" valign="top"><![endif]-->
<div class="t168" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:800px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t167"><tr>
<td class="t166" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">

${content.partcipants
    .map(
        (participant, index) => `<tr><td>
<!--[if mso]>
<table class="t145" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t145" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t144" style="width:493px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t144" style="width:800px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
<!--[if mso]>
<table class="t135" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t135" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t134" style="width:493px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t134" style="width:600px;">
<!--<![endif]-->
<p class="t133 pl-table-title">Participant ${index + 1}</p></td>
</tr></table>
</td></tr>
<tr><td><div class="t137" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>
${Object.entries(participant)
    .map(
        ([label, value]) => `
<tr><td>
<!--[if mso]>
<table class="t139" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t139" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t138" style="width:493px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t138" style="width:600px;">
<!--<![endif]-->
<p class="t136 pl-table-value">${label}: ${value}</p></td>
</tr></table>
</td></tr>`
    )
    .join(
        '<tr><td><div class="t141" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>'
    )}
</table></td>
</tr></table>
</td></tr>`
    )
    .join(
        '<tr><td><div class="t153" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>'
    )}</table></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr><tr><td><div class="t173" style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>`
}



<tr><td><div class="t175" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>
${
    // hide section
    false
        ? `
<tr><td>
<!--[if mso]>
<table class="t177" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t177" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t176" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t176" style="width:450px;">
<!--<![endif]-->
<p class="t174" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:bold;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Having trouble with this transaction?</p></td>
</tr></table>
</td></tr><tr><td>
<!--[if mso]>
<table class="t180" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t180" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t179" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t179" style="width:450px;">
<!--<![endif]-->
<p class="t178" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">It can take some time before this transaction is visible on your account. The amount will be deducted from your account in the coming 1-2 working days.</p></td>
</tr></table>
</td></tr><tr><td>
<!--[if mso]>
<table class="t184" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t184" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t183" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t183" style="width:450px;">
<!--<![endif]-->
<p class="t182" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><a class="t181 pl-link" href="https://tabular.email" target="_blank">More information about Buyers Protection</a></p></td>
</tr></table>
</td></tr>
`
        : ''
}
<tr><td><div class="t217" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t219" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t219" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t218" style="border-top:1px solid #CFCFCF;width:570px;padding:30px 0 40px 0;">
<![endif]-->
<!--[if !mso]>-->
<td class="t218" style="border-top:1px solid #CFCFCF;width:450px;padding:30px 0 40px 0;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">

${
    // hide reseau
    false
        ? `
<tr><td>
<!--[if mso]>
<table class="t207" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t207" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t206" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t206" style="width:450px;">
<!--<![endif]-->
<div class="t205" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="210"><tr><td width="34" valign="middle"><![endif]-->
<div class="t188" style="display:inline-table;text-align:initial;vertical-align:inherit;width:7.55556%;max-width:34px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t187"><tr>
<td class="t186" style="padding:0 10px 0 0;"><div style="font-size:0px;"><img class="t185" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="23.984375" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/29d8f748-8e14-4eaf-b461-da412b47835f.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t192" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t191"><tr>
<td class="t190" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t189" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="23.453125" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/d0ec711b-6de5-407f-8b75-89aab2384082.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t196" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t195"><tr>
<td class="t194" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t193" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="28.359375" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/b201cc1d-4caf-4bf5-bd92-d4923c388fab.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t200" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t199"><tr>
<td class="t198" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t197" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="16.75" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/71e129be-7a44-43ed-b169-9064334cba34.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t204" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t203"><tr>
<td class="t202" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t201" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="19.1875" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/a137250a-4aa6-459d-b22d-62a17cda483c.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr>
<tr><td><div class="t208" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>
`
        : ''
}

<tr><td>
<!--[if mso]>
<table class="t211" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t211" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t210" style="width:332px;padding:0 0 12px 0;">
<![endif]-->
<!--[if !mso]>-->
<td class="t210" style="width:332px;padding:0 0 12px 0;">
<!--<![endif]-->
<p class="t209" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:18px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
        content.company?.name || 'Company Name'
    }. © ${new Date().getFullYear()}</p></td>
</tr></table>
</td></tr>

${
    content.company?.website
        ? `
<tr><td>
<!--[if mso]>
<table class="t216" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t216" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t215" style="width:280px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t215" style="width:280px;">
<!--<![endif]-->
<p class="t214" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:18px;font-weight:400;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:${
              style.primaryColor
          };text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">
<a class="t212 pl-link" href="${content.company.website}" target="_blank">Website</a>
${
    // initial links
    false
        ? `<a class="t212 pl-link" href="https://tabular.email" target="_blank">Website</a>&nbsp; •&nbsp; <a class="t213 pl-link" href="https://tabular.email" target="_blank">Help</a>`
        : ''
}
</p></td>
</tr></table>
</td></tr>
`
        : ''
}
</table></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr></table></td></tr></table></div></body>
</html>`;
};
