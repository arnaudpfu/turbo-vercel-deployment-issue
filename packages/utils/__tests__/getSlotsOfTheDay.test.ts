import { ClientContentType, Populated, Slot } from '@internalpackage/types';
import dayjs from 'dayjs';
import {
    checkTimeSlot,
    getDayOfTheWeek,
    getSlotsOfTheDay,
    getSlotsOfTheRange,
} from '../src/getSlotsOfTheDay';

describe('check checkTimeSlot', () => {
    it('should return true', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'day',
                        freqValue: 4,
                        end: {
                            type: 'never',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'day' };
                },
                dayjs('2022-01-01'),
                'day'
            )
        ).toBe(true);
    });

    it('should return false, 1 day on 4', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'day',
                        freqValue: 4,
                        end: {
                            type: 'never',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'day' };
                },
                dayjs('2022-01-03'),
                'day'
            )
        ).toBe(false);
    });

    it('should return true, 1 day on 4', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'day',
                        freqValue: 4,
                        end: {
                            type: 'never',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'day' };
                },
                dayjs('2022-01-21'),
                'day'
            )
        ).toBe(true);
    });

    it('should return false, 1 day on 4 with end on', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'day',
                        freqValue: 4,
                        end: {
                            type: 'on',
                            on: '2022-03-20',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'day' };
                },
                dayjs('2022-03-21'),
                'day'
            )
        ).toBe(false);
    });

    // WEEK TESTS __________________________________________________________

    it('should return true, week', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'week',
                        freqValue: 1,
                        end: {
                            type: 'never',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'week' };
                },
                dayjs('2022-01-08'),
                'week'
            )
        ).toBe(true);
    });

    it('should return false, week', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'week',
                        freqValue: 1,
                        end: {
                            type: 'never',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'week' };
                },
                dayjs('2022-01-06'),
                'week'
            )
        ).toBe(false);
    });

    it('should return true, 1 week on 2', () => {
        expect(
            checkTimeSlot(
                {
                    date: '2022-01-01',
                    frequency: {
                        type: 'week',
                        freqValue: 2,
                        end: {
                            type: 'never',
                        },
                    },
                } as ClientContentType<Populated<Slot>> & {
                    frequency: { type: 'week' };
                },
                dayjs('2022-01-15'),
                'week'
            )
        ).toBe(true);
    });

    it('should return false, week on days 3,5,6', () => {
        expect(
            getSlotsOfTheDay(
                [
                    {
                        date: '2022-01-01', // Saturday
                        frequency: {
                            type: 'week',
                            freqValue: 2,
                            days: [3, 5, 6], // Wednesday, Friday, Saturday
                            end: {
                                type: 'never',
                            },
                        },
                    },
                ] as ClientContentType<Populated<Slot>>[],
                dayjs('2022-01-10') // Monday
            )
        ).toHaveLength(0);
    });

    it('should return false, week on days 3,5,6', () => {
        expect(
            getSlotsOfTheDay(
                [
                    {
                        date: '2022-01-01', // Saturday
                        frequency: {
                            type: 'week',
                            freqValue: 2,
                            days: [3, 5, 6], // Wednesday, Friday, Saturday
                            end: {
                                type: 'never',
                            },
                        },
                    },
                ] as ClientContentType<Populated<Slot>>[],
                dayjs('2022-01-05') // Monday
            )
        ).toHaveLength(0);
    });

    it('should return true, week on days 3,5,6', () => {
        expect(
            getSlotsOfTheDay(
                [
                    {
                        date: '2022-01-01', // Saturday
                        frequency: {
                            type: 'week',
                            freqValue: 2,
                            days: [3, 5, 6], // Wednesday, Friday, Saturday
                            end: {
                                type: 'never',
                            },
                        },
                    },
                ] as ClientContentType<Populated<Slot>>[],
                dayjs('2022-01-12') // Wednesday
            )
        ).toHaveLength(1);
    });
});

describe('check getDayOfTheWeek', () => {
    it('should return the day of the week', () => {
        expect(getDayOfTheWeek(dayjs('2022-01-01'), 6).format('YYYY-MM-DD')).toBe('2022-01-01');
    });

    it('should return the day of the week', () => {
        expect(getDayOfTheWeek(dayjs('2022-01-01'), 3).format('YYYY-MM-DD')).toBe('2021-12-29');
    });

    it('should return the day of the week', () => {
        expect(getDayOfTheWeek(dayjs('2022-01-01'), 0).format('YYYY-MM-DD')).toBe('2021-12-26');
    });

    it('should return the day of the week', () => {
        expect(getDayOfTheWeek(dayjs('2024-06-25'), 5).format('YYYY-MM-DD')).toBe('2024-06-28');
    });
});

describe('check getSlotsOfTheRange', () => {
    it('test with once slots', () => {
        expect(
            getSlotsOfTheRange(
                [
                    {
                        documentId: '1',
                        date: '2024-07-09',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '2',
                        date: '2024-07-21',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '3',
                        date: '2024-07-16',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '4',
                        date: '2023-07-16',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                ],
                [
                    '2024-07-14',
                    '2024-07-15',
                    '2024-07-16',
                    '2024-07-17',
                    '2024-07-18',
                    '2024-07-19',
                    '2024-07-20',
                    '2024-07-21',
                ]
            )
        ).toEqual([
            {
                documentId: '2',
                date: '2024-07-21',
                frequency: {
                    type: 'once',
                },
            } as ClientContentType<Populated<Slot>> & {
                frequency: { type: 'once' };
            },
            {
                documentId: '3',
                date: '2024-07-16',
                frequency: {
                    type: 'once',
                },
            } as ClientContentType<Populated<Slot>> & {
                frequency: { type: 'once' };
            },
        ]);
    });

    it('test with dynamic slot', () => {
        expect(
            getSlotsOfTheRange(
                [
                    {
                        documentId: '1',
                        date: '2024-07-09',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '2',
                        date: '2024-07-21',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '3',
                        date: '2024-07-16',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '4',
                        date: '2023-07-16',
                        frequency: {
                            type: 'once',
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'once' };
                    },
                    {
                        documentId: '5',
                        date: '2022-01-01',
                        frequency: {
                            type: 'week',
                            freqValue: 1,
                            days: [3, 5, 6],
                            end: {
                                type: 'never',
                            },
                        },
                    } as ClientContentType<Populated<Slot>> & {
                        frequency: { type: 'week' };
                    },
                ],
                [
                    '2024-07-14',
                    '2024-07-15',
                    '2024-07-16',
                    '2024-07-17',
                    '2024-07-18',
                    '2024-07-19',
                    '2024-07-20',
                    '2024-07-21',
                ]
            )
        ).toEqual([
            {
                documentId: '2',
                date: '2024-07-21',
                frequency: {
                    type: 'once',
                },
            } as ClientContentType<Populated<Slot>> & {
                frequency: { type: 'once' };
            },
            {
                documentId: '3',
                date: '2024-07-16',
                frequency: {
                    type: 'once',
                },
            } as ClientContentType<Populated<Slot>> & {
                frequency: { type: 'once' };
            },
            {
                documentId: '5',
                date: '2022-01-01',
                frequency: {
                    type: 'week',
                    freqValue: 1,
                    days: [3, 5, 6],
                    end: {
                        type: 'never',
                    },
                },
            } as ClientContentType<Populated<Slot>> & {
                frequency: { type: 'week' };
            },
        ]);
    });

    // it('should return the day of the week', () => {
    //     expect(getDayOfTheWeek(dayjs('2022-01-01'), 3).format('YYYY-MM-DD')).toBe('2021-12-29');
    // });

    // it('should return the day of the week', () => {
    //     expect(getDayOfTheWeek(dayjs('2022-01-01'), 0).format('YYYY-MM-DD')).toBe('2021-12-26');
    // });

    // it('should return the day of the week', () => {
    //     expect(getDayOfTheWeek(dayjs('2024-06-25'), 5).format('YYYY-MM-DD')).toBe('2024-06-28');
    // });
});
