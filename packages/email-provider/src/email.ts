import { EmailProvider } from '@internalpackage/app-settings';
import nodemailer from 'nodemailer';

interface MailMessage {
    from?: string | { name: string; address: string };
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

type EmailResponse =
    | {
          success: true;
      }
    | {
          error?: any;
      };

async function sendWithDefaultConfig({ from, ...message }: MailMessage): Promise<EmailResponse> {
    return new Promise((resolve) => {
        try {
            strapi.plugins['email'].services.email
                .send({
                    ...message,
                    from:
                        typeof from === 'object'
                            ? `${from.name} <${strapi.config.get(
                                  'plugins.email.config.providerOptions.auth.user',
                                  process.env.CONFIG_EMAIL_USER || ''
                              )}>`
                            : from,
                })
                .then(() => {
                    resolve({ success: true });
                });
        } catch (err) {
            resolve({ error: err });
        }
    });
}

async function sendWithGmail(
    { from, ...message }: MailMessage,
    { auth: { user, pass } }: EmailProvider
): Promise<EmailResponse> {
    return new Promise((resolve) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user,
                pass,
            },
        });

        transporter.sendMail(
            {
                ...message,
                from: typeof from === 'object' ? `${from.name} <${user}>` : from,
            },
            function (error, info) {
                if (error) {
                    console.log(error);
                    resolve({ error });
                } else {
                    console.log('Email sent: ' + info.response);
                    resolve({ success: true });
                }
            }
        );
    });
}

export async function sendEmail(
    message: MailMessage,
    provider: null | EmailProvider = null
): Promise<EmailResponse> {
    if (provider) {
        return await sendWithGmail(message, provider);
    } else {
        return await sendWithDefaultConfig(message);
    }
}
