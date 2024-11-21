import { padStart } from 'lodash';

export function formatTimeDifference(timestamp: string): string {
    const now: Date = new Date();
    const dtObject: Date = new Date(timestamp);
    const timeDifference: number = now.getTime() - dtObject.getTime();
    const seconds: number = Math.floor(timeDifference / 1000);
    const minutes: number = Math.floor(seconds / 60);
    const hours: number = Math.floor(minutes / 60);
    const days: number = Math.floor(hours / 24);
    const weeks: number = Math.floor(days / 7);
    const months: number = Math.floor(days / 30);
    const years: number = Math.floor(days / 365);

    if (seconds < 60) {
        return 'just now';
    } else if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (days === 1) {
        return `yesterday at ${dtObject.getHours()}:${
            dtObject.getMinutes() < 10 ? '0' : ''
        }${dtObject.getMinutes()}`;
    } else if (days < 7) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (weeks < 4) {
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (months < 12) {
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
}

export interface HHmm {
    h: number;
    m: number;
}

export const parseHHmm = (time: string): { h: number; m: number } => {
    const [h, m] = time.split(':').map((n) => parseInt(n, 10));
    return { h, m };
};

export const hhMMToString = (time: HHmm): string => {
    return `${padStart(String(time.h), 2, '0')}:${padStart(String(time.m), 2, '0')}`;
};

// not limited to 24h hours
const addHHmm = (t1: HHmm, t2: HHmm): HHmm => {
    return {
        h: t1.h + t2.h + Math.floor((t1.m + t2.m) / 60),
        m: (t1.m + t2.m) % 60,
    };
};

const minHHmm = (...times: HHmm[]): HHmm => {
    return times.reduce(
        (acc, time) => {
            if (time.h < acc.h) return time;
            if (time.h === acc.h && time.m < acc.m) return time;
            return acc;
        },
        { h: 24, m: 0 }
    );
};

export const computeAutomaticEndTime = (
    startTime: HHmm | string,
    durationTime: HHmm | string,
    maxTime: HHmm | string = {
        h: 24,
        m: 0,
    }
): string => {
    const start = typeof startTime === 'string' ? parseHHmm(startTime) : startTime;
    const duration = typeof durationTime === 'string' ? parseHHmm(durationTime) : durationTime;
    const max = typeof maxTime === 'string' ? parseHHmm(maxTime) : maxTime;

    const end = addHHmm(start, duration);
    const maxEnd = minHHmm(end, max);
    return hhMMToString(maxEnd);
};

export const toHHmmSS = (time: string): string => {
    return time.length > 8 ? time.slice(0, 8) : time + '00:00:00'.slice(time.length);
};

export const toHHmm = (time: string): string => {
    return time.length > 5 ? time.slice(0, 5) : time + '00:00'.slice(time.length);
};
