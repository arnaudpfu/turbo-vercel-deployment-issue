/* eslint-disable camelcase */

/**
 * Enable to specify types of the "any" attribute in the API.
 */

import { z } from 'zod';

// must fit the state type for all content types
export const CONTENT_TYPE_STATES = ['draft', 'published', 'archived'] as const;
export const contentTypeStateSchema = z.enum(CONTENT_TYPE_STATES);
export type ContentTypeState = z.infer<typeof contentTypeStateSchema>;

const participantConstraintSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('interval'),
        start: z.number().or(z.null()),
        end: z.number().or(z.null()),
    }),
    z.object({
        type: z.literal('literal'),
        value: z.union([z.number(), z.string()]).or(z.null()),
    }),
]);

export type ParticipantConstraint = z.infer<typeof participantConstraintSchema>;

const participantParticipantTableEntrySchema = z.object({
    schemaDocId: z.string(), // documentId of the participant data schema
    value: z.array(participantConstraintSchema),
});

export type ParticipantTableEntry = z.infer<typeof participantParticipantTableEntrySchema>;

export const participantTableSchema = z.object({
    cols: participantParticipantTableEntrySchema.optional(),
    rows: participantParticipantTableEntrySchema.optional(),
    values: z.array(z.array(z.number().or(z.null())).min(1)).min(1),
    fallback: z.number().optional(),
});

export type ParticipantTable = z.infer<typeof participantTableSchema>;

// data schema

/* 

king of schema type:
    -text
    -number
    -boolean
    -enum : later

*/

export const dataSchemaSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('text'),
        default: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.string(),
            }),
        ]),
        unit: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.string(),
            }),
        ]),
        min_length: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.number(),
            }),
        ]),
        max_length: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.number(),
            }),
        ]),
        required: z.boolean(),
    }),
    z.object({
        type: z.literal('number'),
        default: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.number(),
            }),
        ]),
        unit: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.string(),
            }),
        ]),
        min: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.number(),
            }),
        ]),
        max: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.number(),
            }),
        ]),
        required: z.boolean(),
    }),
    z.object({
        type: z.literal('boolean'),
        default: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: z.boolean(),
            }),
        ]),
    }),
    z.object({
        type: z.literal('calculation'),
        visible: z.boolean(),
        table: z.discriminatedUnion('used', [
            z.object({
                used: z.literal(false),
            }),
            z.object({
                used: z.literal(true),
                value: participantTableSchema,
            }),
        ]),
    }),
    // z.object({
    //     type: z.literal('date'),
    //     default: z.date().optional(),
    //     required: z.boolean(),
    // }),
    // z.object({
    //     type: z.literal('enum'),
    //     options: z.array(z.string()),
    //     default: z.string().optional(),
    //     required: z.boolean(),
    // }),
    // z.object({
    //     type: z.literal('media'),
    //     required: z.boolean(),
    // }),
    // z.object({
    //     type: z.literal('calculation'),
    //     formula: z.string(),
    //     visible: z.boolean(),
    // })
]);

export type DataSchema = z.infer<typeof dataSchemaSchema>;

const extraPriceSchema = z.object({
    schemaDocId: z.string(),
    default: z.boolean(),
    amount: z.number(),
    description: z.string(),
});

export type ExtraPrice = z.infer<typeof extraPriceSchema>;

export const extraPricesSchema = z.array(extraPriceSchema);

export type ExtraPrices = z.infer<typeof extraPricesSchema>;

export const pricesSchema = z.object({
    table: participantTableSchema,
    extra: extraPricesSchema,
});

export type Prices = z.infer<typeof pricesSchema>;

// const j: Prices = {
//     extra: [],
//     table: {
//         cols: {
//             schemaDocId: 'o5vc7v0tivykt4imjv98niby',
//             value: [
//                 { end: 10, type: 'interval', start: 0 },
//                 { end: 100, type: 'interval', start: 10 },
//             ],
//         },
//         fallback: 90,
//         values: [[57, 70]],
//     },
// };

// Slot.time

/* 
time
frequency: everyday/ everyweek/ everymonth/ everyyear/ from monday to friday


{
    frequency: "single_time" 
}
*/

const frequencyEndSchema = z.object({
    freqValue: z.number().int().min(1),
    end: z.discriminatedUnion('type', [
        z.object({ type: z.literal('never') }),
        z.object({
            type: z.literal('after'),
            after: z.number().int(),
        }),
        z.object({
            type: z.literal('on'),
            on: z.string(),
        }),
    ]),
});

export const slotFrequencySchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('once') }),
    z
        .object({
            type: z.enum(['day', 'month', 'year']),
        })
        .merge(frequencyEndSchema),
    z
        .object({
            type: z.literal('week'),
            days: z.array(z.number().min(0).max(6)),
        })
        .merge(frequencyEndSchema),
]);

export type SlotTime = z.infer<typeof slotFrequencySchema>;

export const singleParticipantSchema = z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export type SingleParticipant = z.infer<typeof singleParticipantSchema>;

export const participantsSchema = singleParticipantSchema.array();

export type Participants = z.infer<typeof participantsSchema>;

/* 
text,textMuted,border,primary,destructive,buttonBg,hoveredButtonBg,inputBg,inputBorder,underlinedBg,
*/

export const checkoutAppearanceSchema = z.object({
    theme: z
        .object({
            font: z.string().optional(),
            text: z.string().optional(),
            textMuted: z.string().optional(),
            border: z.string().optional(),
            primary: z.string().optional(),
            destructive: z.string().optional(),
            buttonBackground: z.string().optional(),
            hoveredButtonBackground: z.string().optional(),
            inputBackground: z.string().optional(),
            hoveredInputBackground: z.string().optional(),
            inputBorder: z.string().optional(),
            underlinedBackground: z.string().optional(),
            radius: z.string().nullable().optional(),
        })
        .optional(),
    style: z
        .object({
            background: z.string().optional(),
            topbarBackground: z.string().optional(),
        })
        .optional(),
});

export type CheckoutAppearance = z.infer<typeof checkoutAppearanceSchema>;

export const checkoutContentSchema = z.object({
    before_slot_selector: z.string().optional(),
    after_slot_selector: z.string().optional(),
    booking_details: z.string().optional(),
    after_booking_details: z.string().optional(),
    participants: z.string().optional(),
    after_participants: z.string().optional(),
    confirmation: z.string().optional(),
    after_confirmation: z.string().optional(),
    after_service: z.string().optional(),
});

export type CheckoutContent = z.infer<typeof checkoutContentSchema>;

export const settingJSONSchema = z.object({
    json: z.any(),
});

export type SettingJSON = z.infer<typeof settingJSONSchema>;
