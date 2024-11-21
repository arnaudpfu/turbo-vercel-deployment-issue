import { ClientContentType, Populated, Slot } from '@internalpackage/types';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

/**
 *
 * export for testing
 *
 * @param slot
 * @param day
 * @param unit
 * @returns
 */
export const checkTimeSlot = <T extends 'day' | 'week' | 'month' | 'year'>(
    slot: ClientContentType<Populated<Slot>> & { frequency: { type: T } },
    day: Dayjs,
    unit: T
): boolean => {
    // @ts-ignore
    const dayjsSlot = dayjs(slot.date);
    const diff = day.startOf('day').diff(dayjsSlot, unit, true);
    // @ts-ignore
    const interval = slot.frequency.freqValue;

    // @ts-ignore
    if (slot.frequency.end.type === 'after') {
        const count = Math.floor(diff / interval);
        // @ts-ignore
        const limitReached = count < slot.frequency.end.after;
        if (!limitReached) return false;
    }

    return diff % interval === 0;
};

/**
 * Return a new dayjs with the day of the current week
 *
 * export used for testing
 *
 * @param day
 * @param dayWeek
 * @returns
 */
export const getDayOfTheWeek = (day: Dayjs, dayWeek: number): Dayjs => {
    const dayDay = day.day();
    return dayWeek < dayDay ? day.subtract(dayDay - dayWeek, 'day') : day.add(dayWeek - dayDay, 'day');
};

const daySlotFilter = (slot: ClientContentType<Populated<Slot>>, day: Dayjs): boolean => {
    if (day.isBefore(dayjs(slot.date), 'day')) {
        // slots cannot generate "rendered slots" in the past
        return false;
    }

    if (slot.frequency.type === 'once') {
        return slot.date === day.format('YYYY-MM-DD');
    }

    if (slot.frequency.end.type === 'on' && day.isSameOrAfter(dayjs(slot.frequency.end.on), 'day')) {
        return false;
    }

    switch (slot.frequency.type) {
        case 'day':
            return checkTimeSlot(slot as any, day, 'day');
        case 'week':
            const dayWeek = day.day();
            if (!slot.frequency.days.includes(dayWeek)) return false;
            const initialSlotDay = dayjs(slot.date);
            const slotDay = getDayOfTheWeek(initialSlotDay, dayWeek);

            const diff = day.startOf('day').diff(slotDay, 'week', true);
            const interval = slot.frequency.freqValue;

            if (slot.frequency.end.type === 'after') {
                const diffWithInitial = Math.abs(day.diff(initialSlotDay, 'week', true));
                const roundedDiff = Math.floor(diffWithInitial);

                let count = Math.floor(diffWithInitial / interval) * slot.frequency.days.length;
                const multipleDay = initialSlotDay.add(roundedDiff, 'week');

                for (const dW of slot.frequency.days) {
                    if (day.isBefore(getDayOfTheWeek(multipleDay, dW), 'day')) {
                        break;
                    }
                    count++;
                }
                count--;

                const limitReached = count < slot.frequency.end.after;
                if (!limitReached) return false;
            }

            return diff % interval === 0;
        case 'month':
            return checkTimeSlot(slot as any, day, 'month');
        case 'year':
            return checkTimeSlot(slot as any, day, 'year');
    }

    return false;
};

export const getSlotsOfTheDay = <S extends ClientContentType<Populated<Slot>>>(
    slots: S[],
    day: Dayjs
): S[] => {
    return slots.filter((slot) => daySlotFilter(slot, day));
};

export const getSlotsOfTheRange = <S extends Populated<Slot>>(
    slots: Populated<Slot>[],
    days: string[], // sorted days,
    whenDayMatchSlot?: (slot: Populated<Slot>, day: string[]) => S
): S[] => {
    const oldest = dayjs(days[0]);
    const newest = dayjs(days.at(-1));

    // documentId -> string days
    const daysMatchingSlots: Record<string, string[]> = {};

    const filteredSlots = slots.filter((slot) => {
        if (newest.isBefore(dayjs(slot.date), 'day')) {
            // slots cannot generate "rendered slots" in the past
            return false;
        }

        if (slot.frequency.type !== 'once') {
            if (
                slot.frequency.end.type === 'on' &&
                oldest.isSameOrAfter(dayjs(slot.frequency.end.on), 'day')
            ) {
                return false;
            }

            // console.log(slot.id);
            let slotMatchDay = false;
            for (const day of days) {
                if (dayjs(day).isBefore(dayjs(slot.date), 'day')) continue;

                if (daySlotFilter(slot, dayjs(day))) {
                    if (whenDayMatchSlot) {
                        if (!daysMatchingSlots[slot.documentId]) {
                            slotMatchDay = true;
                            daysMatchingSlots[slot.documentId] = [];
                        }
                        daysMatchingSlots[slot.documentId].push(day);
                    } else {
                        return true;
                    }
                }
            }
            if (slotMatchDay) {
                return true;
            }
        } else {
            for (const day of days) {
                if (slot.date === day) {
                    if (whenDayMatchSlot) {
                        daysMatchingSlots[slot.documentId] = [day];
                    }
                    return true;
                }
            }
        }

        return false;
    });

    if (whenDayMatchSlot) {
        return filteredSlots.map((slot) => whenDayMatchSlot(slot, daysMatchingSlots[slot.documentId]));
    }

    return filteredSlots as S[];
};
