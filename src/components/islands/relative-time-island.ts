const RELATIVE_TIME_SELECTOR = 'time[data-relative-time]';

type RelativeUnit =
    | 'year'
    | 'month'
    | 'week'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second';

type Threshold = {
    limit: number;
    divisor: number;
    unit: RelativeUnit;
};

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30.4375 * DAY; // Average Gregorian month length
const YEAR = 365.25 * DAY; // Average Gregorian year length

const thresholds: Threshold[] = [
    { limit: MINUTE, divisor: SECOND, unit: 'second' },
    { limit: HOUR, divisor: MINUTE, unit: 'minute' },
    { limit: DAY, divisor: HOUR, unit: 'hour' },
    { limit: WEEK, divisor: DAY, unit: 'day' },
    { limit: MONTH, divisor: WEEK, unit: 'week' },
    { limit: YEAR, divisor: MONTH, unit: 'month' },
    { limit: Number.POSITIVE_INFINITY, divisor: YEAR, unit: 'year' }
];

declare global {
    interface Window {
        __relativeTimeIslandLoaded?: boolean;
    }
}

function selectRelativeUnit(diffInSeconds: number): { value: number; unit: RelativeUnit } {
    const absoluteDiff = Math.abs(diffInSeconds);

    for (const { limit, divisor, unit } of thresholds) {
        if (absoluteDiff < limit) {
            const rawValue = Math.round(diffInSeconds / divisor);
            const value = rawValue === 0 && diffInSeconds < 0 ? -0 : rawValue;
            if (value !== 0 || unit === 'second') {
                return { value, unit };
            }
        }
    }

    return { value: 0, unit: 'second' };
}

function updateRelativeTime(element: HTMLTimeElement, formatter: Intl.RelativeTimeFormat) {
    const datetime = element.getAttribute('datetime') ?? element.dateTime;
    if (!datetime) {
        return;
    }

    const parsedDate = new Date(datetime);
    if (Number.isNaN(parsedDate.getTime())) {
        return;
    }

    const now = new Date();
    const diffInSeconds = (parsedDate.getTime() - now.getTime()) / 1000;
    const { value, unit } = selectRelativeUnit(diffInSeconds);

    element.textContent = formatter.format(value, unit);
}

function applyRelativeTimes() {
    const elements = document.querySelectorAll<HTMLTimeElement>(RELATIVE_TIME_SELECTOR);
    if (elements.length === 0) {
        return;
    }

    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    elements.forEach((element) => {
        updateRelativeTime(element, formatter);
    });
}

function init() {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.__relativeTimeIslandLoaded) {
        return;
    }

    window.__relativeTimeIslandLoaded = true;

    const run = () => {
        applyRelativeTimes();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
}

init();

export {};
