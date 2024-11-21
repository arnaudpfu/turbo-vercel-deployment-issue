import {
    ExtraPrice,
    ParticipantConstraint,
    ParticipantDataSchema,
    ParticipantTable,
    SingleParticipant,
} from '@internalpackage/types';
import { compact } from 'lodash';

const findConstraintIndex = (value: number | boolean, constraints: ParticipantConstraint[]): number[] => {
    const indexes: number[] = [];

    for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i];
        if (constraint.type === 'literal') {
            if (constraint.value === value) {
                indexes.push(i);
            }
            continue;
        } else if (constraint.type === 'interval') {
            if (
                (constraint.start === null || (value as number) >= constraint.start) &&
                (constraint.end === null || (value as number) < constraint.end)
            ) {
                indexes.push(i);
            }
        }
    }

    return indexes;
};

/**
 * @throws Error if no value is found
 *
 * @param values Bidimensional array of values
 * @param colIndexes
 * @param rowIndexes
 * @returns
 */
export const findLowestValue = (
    values: (number | null)[][],
    colIndexes: number[],
    rowIndexes = [0]
): { value: number; colIndex: number; rowIndex: number } => {
    let lowestValue = Infinity;
    let colIndex = -1;
    let rowIndex = -1;

    for (const row of rowIndexes) {
        for (const col of colIndexes) {
            const value = values[row][col];
            if (typeof value === 'number' && value < lowestValue) {
                lowestValue = value;
                colIndex = col;
                rowIndex = row;
            }
        }
    }

    if (lowestValue === Infinity) {
        throw new Error('No value found');
    }

    return { value: lowestValue, colIndex, rowIndex };
};

export const findCellValue = (
    table: ParticipantTable,
    participant: SingleParticipant,
    participantDataSchema: ParticipantDataSchema[]
): {
    value: number;
    location: { row: number; col: number };
} => {
    if (!table.cols)
        return {
            value: table.values[0][0] as number,
            location: { row: 0, col: 0 },
        };
    const colSlug: string | null =
        participantDataSchema.find((sh) => sh.documentId === table.cols?.schemaDocId)?.slug || null;
    const defaultCellValue = { value: table.fallback || NaN, location: { row: -1, col: -1 } };
    if (!colSlug) return defaultCellValue;

    const colValue = participant[colSlug] as number | boolean;
    const colIndexes = findConstraintIndex(colValue, table.cols.value);

    if (colIndexes.length === 0) return defaultCellValue;

    if (table.rows) {
        const rowSlug: string | null =
            participantDataSchema.find((sh) => sh.documentId === table.rows?.schemaDocId)?.slug || null;
        if (!rowSlug) return defaultCellValue;
        const rowValue = participant[rowSlug] as number | boolean;
        const rowIndexes = findConstraintIndex(rowValue, table.rows.value);

        if (rowIndexes.length === 0) return defaultCellValue;

        const rowLowestValue = findLowestValue(table.values, colIndexes, rowIndexes);
        return {
            value: rowLowestValue.value,
            location: { row: rowLowestValue.rowIndex, col: rowLowestValue.colIndex },
        };
    }

    const lowestValue = findLowestValue(table.values, colIndexes);
    return {
        value: lowestValue.value,
        location: { row: lowestValue.rowIndex, col: lowestValue.colIndex },
    };
};

export const getExtra = (
    extras: ExtraPrice[],
    participant: SingleParticipant,
    participantDataSchema: ParticipantDataSchema[]
): (ExtraPrice & { participantDataSchema: ParticipantDataSchema })[] => {
    return compact(
        extras.map((extra) => {
            const schema = participantDataSchema.find((sh) => sh.documentId === extra.schemaDocId);
            if (!schema) return null;
            const value = participant[schema.slug] as boolean;
            return value ? { ...extra, participantDataSchema: schema } : null;
        })
    );
};
