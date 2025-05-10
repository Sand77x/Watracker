import dayjs from 'dayjs';

export function getDaysApart(d1, d2) {
    const d1fmt = dayjs(d1).startOf('day');
    const d2fmt = dayjs(d2).startOf('day');
    return Math.abs(d1fmt.diff(d2fmt, 'day'));
};

export const TODAY = (() => { return dayjs().startOf('day') });
