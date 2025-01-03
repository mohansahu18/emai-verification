import moment from 'moment-timezone';

// Convert date to user's timezone
export const convertToTimezone = (dateString, timezone) => {
    const { key } = timezone;
    return moment(dateString).tz(key).format('ddd, MMM D, YYYY, h:mm A');
};
