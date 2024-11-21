import { ValueOf } from 'type-fest';
import { z } from 'zod';
import {
    checkoutAppearanceSchema,
    checkoutContentSchema,
    dataSchemaSchema,
    participantsSchema,
    pricesSchema,
    settingJSONSchema,
    slotFrequencySchema,
} from './external-api';
export const userSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    username: z.string(),
    email: z.string(),
    provider: z.string().nullable(),
    resetPasswordToken: z.string().nullable(),
    confirmationToken: z.string().nullable(),
    confirmed: z.boolean().nullable(),
    blocked: z.boolean().nullable(),
    firstname: z.string().nullable(),
    lastname: z.string().nullable(),
    google_avatar: z.string().nullable(),
    phone: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const relationUserSchema = z.object({
    role: z.lazy(() => userSchema).nullable(),
    files: z.lazy(() => mediaSchema).array(),
});

export type RelationUser = z.infer<typeof relationUserSchema>;

export const mediaFormatSchema = z.object({
    name: z.string(),
    hash: z.string(),
    ext: z.string(),
    mime: z.string(),
    width: z.number(),
    height: z.number(),
    size: z.number(),
    path: z.string(),
    url: z.string(),
});

export type MediaFormat = z.infer<typeof mediaFormatSchema>;

export const mediaSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    alternativeText: z.string(),
    caption: z.string(),
    width: z.number(),
    height: z.number(),
    formats: z.object({
        thumbnail: mediaFormatSchema,
        medium: mediaFormatSchema,
        small: mediaFormatSchema,
    }),
    hash: z.string(),
    ext: z.string(),
    mime: z.string(),
    size: z.number(),
    url: z.string(),
    previewUrl: z.string(),
    provider: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Media = z.infer<typeof mediaSchema>;
// Content Types

export const bookingSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    relative_id: z.number(),
    firstname: z.string(),
    lastname: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    participants: participantsSchema.nullable(),
    day: z.string().nullable(),
    stripe_key: z.string().nullable(),
    status: z.enum([
        'requires_payment_method',
        'requires_slot_confirmation',
        'canceled',
        'confirmed',
        'charged',
        'confirmation_failed',
    ]),
    note: z.string().nullable(),
    customer_note: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type Booking = z.infer<typeof bookingSchema>;

export const relationBookingSchema = z.object({
    company: z.lazy(() => companySchema).nullable(),
    slot: z.lazy(() => slotSchema).nullable(),
});

export type RelationBooking = z.infer<typeof relationBookingSchema>;

export const checkoutSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    appearance: checkoutAppearanceSchema,
    content: checkoutContentSchema,
    state: z.enum(['draft', 'published', 'archived']),
    relative_id: z.number(),
    name: z.string(),
    slug: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type Checkout = z.infer<typeof checkoutSchema>;

export const relationCheckoutSchema = z.object({
    company: z.lazy(() => companySchema).nullable(),
});

export type RelationCheckout = z.infer<typeof relationCheckoutSchema>;

export const companySchema = z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    description: z.string(),
    website: z.string().nullable(),
    slug: z.string(),
    lang: z.enum(['en', 'fr']).nullable(),
    timezone: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type Company = z.infer<typeof companySchema>;

export const relationCompanySchema = z.object({
    logo: z.lazy(() => mediaSchema).nullable(),
    illustrations: z.lazy(() => mediaSchema).array(),
    logo_name: z.lazy(() => mediaSchema).nullable(),
    files: z.lazy(() => mediaSchema).array(),
});

export type RelationCompany = z.infer<typeof relationCompanySchema>;

export const companyRoleSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    role: z.enum(['owner', 'editor', 'secretary', 'contributor']),
    custom_config: z.any().nullable(),
    status: z.enum(['invitation', 'confirmed']),
    relative_id: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type CompanyRole = z.infer<typeof companyRoleSchema>;

export const relationCompanyRoleSchema = z.object({
    company: z.lazy(() => companySchema).nullable(),
    user: z.lazy(() => userSchema).nullable(),
});

export type RelationCompanyRole = z.infer<typeof relationCompanyRoleSchema>;

export const companySettingSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    slug: z.string(),
    value: settingJSONSchema.nullable(),
    visibility: z.enum(['public', 'company']),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type CompanySetting = z.infer<typeof companySettingSchema>;

export const relationCompanySettingSchema = z.object({
    company: z.lazy(() => companySchema).nullable(),
});

export type RelationCompanySetting = z.infer<typeof relationCompanySettingSchema>;

export const notificationSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    type: z.enum([
        'company-roles.company-invitation',
        'company-roles.you-have-been-fired',
        'company-roles.user-fired',
        'company-roles.user-quit',
        'bookings.create',
        'bookings.delete',
        'slots.create',
        'slots.delete',
    ]),
    status: z.enum(['unread', 'read']),
    data: z.any(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const relationNotificationSchema = z.object({
    user: z.lazy(() => userSchema).nullable(),
});

export type RelationNotification = z.infer<typeof relationNotificationSchema>;

export const participantDataSchemaSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    schema: dataSchemaSchema,
    slug: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type ParticipantDataSchema = z.infer<typeof participantDataSchemaSchema>;

export const relationParticipantDataSchemaSchema = z.object({
    company: z.lazy(() => companySchema).nullable(),
});

export type RelationParticipantDataSchema = z.infer<typeof relationParticipantDataSchemaSchema>;

export const serviceSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    location: z.string().nullable(),
    min_participant: z.number(),
    max_participant: z.number().nullable(),
    prices: pricesSchema,
    state: z.enum(['draft', 'published', 'archived']),
    relative_id: z.number(),
    duration: z.string().nullable(),
    calendar_color: z.string(),
    email_content: z.string().nullable(),
    sms_content: z.string().nullable(),
    confirmation_page_message: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type Service = z.infer<typeof serviceSchema>;

export const relationServiceSchema = z.object({
    images: z.lazy(() => mediaSchema).array(),
    company: z.lazy(() => companySchema).nullable(),
    participant_data_schemas: z.lazy(() => participantDataSchemaSchema).array(),
    featured_image: z.lazy(() => mediaSchema).nullable(),
});

export type RelationService = z.infer<typeof relationServiceSchema>;

export const slotSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    custom_label: z.string().nullable(),
    status: z.enum(['confirmed', 'requested']),
    frequency: slotFrequencySchema,
    visible: z.boolean().nullable(),
    date: z.string(),
    start: z.string(),
    end: z.string(),
    max_participant: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type Slot = z.infer<typeof slotSchema>;

export const relationSlotSchema = z.object({
    service: z.lazy(() => serviceSchema).nullable(),
    company: z.lazy(() => companySchema).nullable(),
    company_member: z.lazy(() => userSchema).nullable(),
});

export type RelationSlot = z.infer<typeof relationSlotSchema>;

export const userSettingSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    slug: z.string(),
    value: settingJSONSchema.nullable(),
    visibility: z.enum(['public', 'company']),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
});

export type UserSetting = z.infer<typeof userSettingSchema>;

export const relationUserSettingSchema = z.object({
    user: z.lazy(() => userSchema).nullable(),
});

export type RelationUserSetting = z.infer<typeof relationUserSettingSchema>;

export type AppContentTypes = {
    users: User;
    bookings: Booking;
    checkouts: Checkout;
    companies: Company;
    'company-roles': CompanyRole;
    'company-settings': CompanySetting;
    notifications: Notification;
    'participant-data-schemas': ParticipantDataSchema;
    services: Service;
    slots: Slot;
    'user-settings': UserSetting;
};

export type PopulatedList<CT extends ValueOf<AppContentTypes>> = CT extends User
    ? RelationUser
    : CT extends Booking
      ? RelationBooking
      : CT extends Checkout
        ? RelationCheckout
        : CT extends Company
          ? RelationCompany
          : CT extends CompanyRole
            ? RelationCompanyRole
            : CT extends CompanySetting
              ? RelationCompanySetting
              : CT extends Notification
                ? RelationNotification
                : CT extends ParticipantDataSchema
                  ? RelationParticipantDataSchema
                  : CT extends Service
                    ? RelationService
                    : CT extends Slot
                      ? RelationSlot
                      : CT extends UserSetting
                        ? RelationUserSetting
                        : CT extends Media
                          ? Media
                          : never;

export type Populated<
    CT extends ValueOf<AppContentTypes>,
    K extends keyof PopulatedList<CT> = keyof PopulatedList<CT>,
> = CT & { [P in K]: PopulatedList<CT>[P] };
