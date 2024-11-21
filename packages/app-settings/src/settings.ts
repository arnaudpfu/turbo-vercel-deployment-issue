/* eslint-disable camelcase */
import { Media } from '@internalpackage/types';

export type Currency = 'eur' | 'usd';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    eur: '€',
    usd: '$',
};

export type EmailProvider = {
    service: 'gmail' | 'planoby';
    auth: {
        user: string;
        pass: string;
    };
};

export type SMSProvider =
    | {
          service: 'bird';
          auth: {
              token: string;
          };
          originator: string;
      }
    | {
          service: 'gatewayapi';
          auth: {
              token: string;
          };
      }
    | {
          service: 'vonage';
          auth: {
              apiKey: string;
              apiSecret: string;
          };
          from: string;
      };

export enum CheckoutConfirmationMethod {
    STRIPE_CARD_INFO = 'stripe_card_info',
    ANY = 'any',
}

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export const DEFAULT_LANG = 'en';

const DEFAULT_TIME_ZONE = 'Europe/Paris';
const DEFAULT_DELAY = {
    hours: 0,
    days: 2,
};
const DEFAULT_DURATION_BEFORE_BOOKING = {
    hours: 0,
    days: 1,
};

export interface SettingTypes {
    company_name: string;
    company_slug: string;
    company_lang: (typeof SUPPORTED_LANGUAGES)[number];
    company_website: string;
    company_description: string;
    company_logo: Media | null;
    company_logo_name: Media | null;
    schedule_start_time: string;
    schedule_end_time: string;
    primary_color: string;
    company_timezone: string;
    currency: Currency;
    stripe_publishable_key: string;
    // @authenticated
    stripe_secret_key: string;
    confirmation_method: CheckoutConfirmationMethod;
    time_before_booking: typeof DEFAULT_DURATION_BEFORE_BOOKING;
    ceil_to_day_time_before_duration: boolean;
    enable_customer_note: boolean;
    enable_slot_request: boolean;
    disable_email: boolean;
    // @authenticated
    email_provider: EmailProvider | null;
    disable_sms: boolean;
    // @authenticated
    sms_provider: SMSProvider | null;
    email_displayed_name: string;
    email_content: string;
    sms: boolean;
    sms_content: string;
    sms_delay: typeof DEFAULT_DELAY;
    user_username: string;
    user_firstname: string;
    user_lastname: string;
    user_email: string;
    user_phone: string;
}

export const DEFAULT_SETTINGS: SettingTypes = {
    company_name: '',
    company_slug: '',
    company_lang: DEFAULT_LANG,
    company_website: '',
    company_description: '',
    company_logo: null,
    company_logo_name: null,
    schedule_start_time: '00:00',
    schedule_end_time: '24:00',
    primary_color: '#0f172A',
    company_timezone: DEFAULT_TIME_ZONE,
    currency: 'eur',
    stripe_publishable_key: '',
    stripe_secret_key: '',
    confirmation_method: CheckoutConfirmationMethod.ANY,
    time_before_booking: DEFAULT_DURATION_BEFORE_BOOKING,
    ceil_to_day_time_before_duration: false,
    enable_customer_note: true,
    enable_slot_request: false,
    disable_email: false,
    email_provider: null,
    disable_sms: false,
    sms_provider: null,
    email_displayed_name: '',
    email_content: '',
    sms: false,
    sms_content: '',
    sms_delay: DEFAULT_DELAY,
    user_username: '',
    user_firstname: '',
    user_lastname: '',
    user_email: '',
    user_phone: '',
};
