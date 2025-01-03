const Response = require('../../utils/response')

const ct = require('countries-and-timezones');
const User = require('../../models/User');
// Function to get GMT offset for a timezone
function getGmtOffset(timezone) {
    const timezoneData = ct.getTimezone(timezone);

    if (!timezoneData) {
        throw new Error(`Invalid timezone: ${timezone}`);
    }

    const date = new Date();
    const utcOffset = -date.getTimezoneOffset() / 60; // Get UTC offset in hours
    const timezoneOffset = ct.getTimezone(timezone).utcOffset;
    return `(GMT${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset})`;
}

module.exports = {
    /**
     * Get The list Of The timezone by country
     * @param {*} req 
     * @param {*} res 
     */
    getTimezonesByCountry: (req, res) => {
        const countries = ct.getAllCountries();
        const formattedTimezones = [];

        for (const countryCode in countries) {
            const country = countries[countryCode];

            country.timezones.forEach((timezone) => {
                const gmtOffset = getGmtOffset(timezone);
                formattedTimezones.push({ key: timezone, value: gmtOffset });
            });
        }

        res.json(formattedTimezones);
    },

    /**
     * Save The Timezone into user account
     * @param {*} req 
     * @param {*} res 
     */
    saveTimeZone: async (req, res) => {
        try {
            const userId = req.user.id;
            const { timezone } = req.body;

            if (!timezone) {
                return res.status(400).json(Response.error('timezone are required'));
            }

            const gmtOffset = getGmtOffset(timezone);
            if (!gmtOffset) {
                return res.status(400).json(Response.error('Invalid timezone'));
            }
            const timezoneData = {
                key: timezone,
                value: gmtOffset,
            };
            await User.findOneAndUpdate(
                { userId },
                { timezone: timezoneData },
            );
            // Save the timezone (use a database in production)
            return res.status(200).json(Response.success('Timezone saved successfully', { timezone, gmtOffset }));
        } catch (error) {
            return res.status(500).json(Response.error("Error while saving timezone", error));
        }

    }
}

