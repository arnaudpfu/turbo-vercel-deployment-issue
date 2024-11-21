import { ValueOf } from 'type-fest';
import { Media, AppContentTypes } from '../api';

export type ReplaceRelationByDocumentIdString<CT extends ValueOf<AppContentTypes>> = {
    [K in keyof CT]: NonNullable<CT[K]> extends (infer I)[]
        ? I extends ValueOf<AppContentTypes>
            ? string[] | null
            : I extends Media
              ? number[] | null
              : CT[K]
        : NonNullable<CT[K]> extends ValueOf<AppContentTypes>
          ? string | null
          : NonNullable<CT[K]> extends Media
            ? number | null
            : CT[K];
};

export type FormatAPIRestData<Data, WithPartial extends boolean = true> =
    Data extends ValueOf<AppContentTypes>
        ? WithPartial extends true
            ? Partial<ReplaceRelationByDocumentIdString<Data>>
            : ReplaceRelationByDocumentIdString<Data>
        : Data;
