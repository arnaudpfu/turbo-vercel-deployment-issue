import { ParticipantDataSchema, ParticipantTable } from '@internalpackage/types';
import { findCellValue, findLowestValue } from '../src/participant-table';

describe('ParticipantTable check', () => {
    // test for the findLowestValue function

    it('findLowestValue', () => {
        const values = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];
        const colIndexes = [0, 1, 2];
        const rowIndexes = [0, 1, 2];
        expect(findLowestValue(values, colIndexes, rowIndexes)).toEqual({
            value: 1,
            colIndex: 0,
            rowIndex: 0,
        });
    });

    it('findLowestValue', () => {
        const values = [
            [17, 2, 3],
            [4, -13, 6],
            [7, 21, 25],
        ];
        const colIndexes = [0, 1, 2];
        const rowIndexes = [0, 1, 2];
        expect(findLowestValue(values, colIndexes, rowIndexes)).toEqual({
            value: -13,
            colIndex: 1,
            rowIndex: 1,
        });
    });

    // findCellValue
    it('findCellValue', () => {
        const table = {
            cols: {
                schemaDocId: 'pointureDocumentId',
                value: [
                    { end: 10, type: 'interval', start: 0 },
                    { end: 100, type: 'interval', start: 10 },
                ],
            },
            fallback: 90,
            values: [[54, 70]],
        } as ParticipantTable;
        const participant = { pointure: 34 };
        const participantDataSchema: ParticipantDataSchema[] = [
            {
                documentId: 'pointureDocumentId',
                id: 34,
                name: 'Pointure',
                schema: {
                    default: { used: false },
                    max: { used: false },
                    min: { used: false },
                    required: false,
                    type: 'number',
                    unit: { used: false },
                },
                slug: 'pointure',
                createdAt: '',
                publishedAt: '',
                updatedAt: '',
            },
        ];
        expect(findCellValue(table, participant, participantDataSchema)).toEqual({
            value: 70,
            location: { row: 0, col: 1 },
        });
    });

    // findCellValue
    it('findCellValue', () => {
        const table = {
            cols: {
                schemaDocId: 'pointureDocumentId',
                value: [
                    { end: 10, type: 'interval', start: 0 },
                    { end: 100, type: 'interval', start: 10 },
                ],
            },
            rows: {
                schemaDocId: 'poidsDocumentId',
                value: [
                    { end: 10, type: 'interval', start: 0 },
                    { end: 100, type: 'interval', start: 10 },
                    { end: 600, type: 'interval', start: 100 },
                ],
            },
            fallback: 40,
            values: [
                [54, 70],
                [2, -34],
                [35, 98],
            ],
        } as ParticipantTable;
        const participant = { pointure: 52, poids: 170 };
        const participantDataSchema: ParticipantDataSchema[] = [
            {
                documentId: 'pointureDocumentId',
                id: 52,
                name: 'Pointure',
                schema: {
                    default: { used: false },
                    max: { used: false },
                    min: { used: false },
                    required: false,
                    type: 'number',
                    unit: { used: false },
                },
                slug: 'pointure',
                createdAt: '',
                publishedAt: '',
                updatedAt: '',
            },
            {
                documentId: 'poidsDocumentId',
                id: 170,
                name: 'Poids',
                schema: {
                    default: { used: false },
                    max: { used: false },
                    min: { used: false },
                    required: false,
                    type: 'number',
                    unit: { used: false },
                },
                slug: 'poids',
                createdAt: '',
                publishedAt: '',
                updatedAt: '',
            },
        ];
        expect(findCellValue(table, participant, participantDataSchema)).toEqual({
            value: 98,
            location: { row: 2, col: 1 },
        });
    });
});
