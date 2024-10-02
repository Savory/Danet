// Copyright (c) 2017-2024 Kamil Mysliwiec MIT

/**
 * Enum representing various cron expressions for scheduling tasks.
 *
 * @enum {string}
 * @readonly
 * @property {string} EVERY_MINUTE - Runs every minute.
 * @property {string} EVERY_5_MINUTES - Runs every 5 minutes.
 * @property {string} EVERY_10_MINUTES - Runs every 10 minutes.
 * @property {string} EVERY_30_MINUTES - Runs every 30 minutes.
 * @property {string} EVERY_HOUR - Runs every hour.
 * @property {string} EVERY_2_HOURS - Runs every 2 hours.
 * @property {string} EVERY_3_HOURS - Runs every 3 hours.
 * @property {string} EVERY_4_HOURS - Runs every 4 hours.
 * @property {string} EVERY_5_HOURS - Runs every 5 hours.
 * @property {string} EVERY_6_HOURS - Runs every 6 hours.
 * @property {string} EVERY_7_HOURS - Runs every 7 hours.
 * @property {string} EVERY_8_HOURS - Runs every 8 hours.
 * @property {string} EVERY_9_HOURS - Runs every 9 hours.
 * @property {string} EVERY_10_HOURS - Runs every 10 hours.
 * @property {string} EVERY_11_HOURS - Runs every 11 hours.
 * @property {string} EVERY_12_HOURS - Runs every 12 hours.
 * @property {string} EVERY_DAY_AT_1AM - Runs every day at 1 AM.
 * @property {string} EVERY_DAY_AT_2AM - Runs every day at 2 AM.
 * @property {string} EVERY_DAY_AT_3AM - Runs every day at 3 AM.
 * @property {string} EVERY_DAY_AT_4AM - Runs every day at 4 AM.
 * @property {string} EVERY_DAY_AT_5AM - Runs every day at 5 AM.
 * @property {string} EVERY_DAY_AT_6AM - Runs every day at 6 AM.
 * @property {string} EVERY_DAY_AT_7AM - Runs every day at 7 AM.
 * @property {string} EVERY_DAY_AT_8AM - Runs every day at 8 AM.
 * @property {string} EVERY_DAY_AT_9AM - Runs every day at 9 AM.
 * @property {string} EVERY_DAY_AT_10AM - Runs every day at 10 AM.
 * @property {string} EVERY_DAY_AT_11AM - Runs every day at 11 AM.
 * @property {string} EVERY_DAY_AT_NOON - Runs every day at noon.
 * @property {string} EVERY_DAY_AT_1PM - Runs every day at 1 PM.
 * @property {string} EVERY_DAY_AT_2PM - Runs every day at 2 PM.
 * @property {string} EVERY_DAY_AT_3PM - Runs every day at 3 PM.
 * @property {string} EVERY_DAY_AT_4PM - Runs every day at 4 PM.
 * @property {string} EVERY_DAY_AT_5PM - Runs every day at 5 PM.
 * @property {string} EVERY_DAY_AT_6PM - Runs every day at 6 PM.
 * @property {string} EVERY_DAY_AT_7PM - Runs every day at 7 PM.
 * @property {string} EVERY_DAY_AT_8PM - Runs every day at 8 PM.
 * @property {string} EVERY_DAY_AT_9PM - Runs every day at 9 PM.
 * @property {string} EVERY_DAY_AT_10PM - Runs every day at 10 PM.
 * @property {string} EVERY_DAY_AT_11PM - Runs every day at 11 PM.
 * @property {string} EVERY_DAY_AT_MIDNIGHT - Runs every day at midnight.
 * @property {string} EVERY_WEEK - Runs every week.
 * @property {string} EVERY_WEEKDAY - Runs every weekday.
 * @property {string} EVERY_WEEKEND - Runs every weekend.
 * @property {string} EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT - Runs on the 1st day of every month at midnight.
 * @property {string} EVERY_1ST_DAY_OF_MONTH_AT_NOON - Runs on the 1st day of every month at noon.
 * @property {string} EVERY_2ND_HOUR - Runs every 2nd hour.
 * @property {string} EVERY_2ND_HOUR_FROM_1AM_THROUGH_11PM - Runs every 2nd hour from 1 AM through 11 PM.
 * @property {string} EVERY_2ND_MONTH - Runs every 2nd month.
 * @property {string} EVERY_QUARTER - Runs every quarter.
 * @property {string} EVERY_6_MONTHS - Runs every 6 months.
 * @property {string} EVERY_YEAR - Runs every year.
 * @property {string} EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM - Runs every 30 minutes between 9 AM and 5 PM.
 * @property {string} EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM - Runs every 30 minutes between 9 AM and 6 PM.
 * @property {string} EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM - Runs every 30 minutes between 10 AM and 7 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_1AM - Runs Monday to Friday at 1 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_2AM - Runs Monday to Friday at 2 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_3AM - Runs Monday to Friday at 3 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_4AM - Runs Monday to Friday at 4 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_5AM - Runs Monday to Friday at 5 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_6AM - Runs Monday to Friday at 6 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_7AM - Runs Monday to Friday at 7 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_8AM - Runs Monday to Friday at 8 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_9AM - Runs Monday to Friday at 9 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_09_30AM - Runs Monday to Friday at 9:30 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_10AM - Runs Monday to Friday at 10 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_11AM - Runs Monday to Friday at 11 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_11_30AM - Runs Monday to Friday at 11:30 AM.
 * @property {string} MONDAY_TO_FRIDAY_AT_12PM - Runs Monday to Friday at 12 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_1PM - Runs Monday to Friday at 1 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_2PM - Runs Monday to Friday at 2 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_3PM - Runs Monday to Friday at 3 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_4PM - Runs Monday to Friday at 4 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_5PM - Runs Monday to Friday at 5 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_6PM - Runs Monday to Friday at 6 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_7PM - Runs Monday to Friday at 7 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_8PM - Runs Monday to Friday at 8 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_9PM - Runs Monday to Friday at 9 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_10PM - Runs Monday to Friday at 10 PM.
 * @property {string} MONDAY_TO_FRIDAY_AT_11PM - Runs Monday to Friday at 11 PM.
 */
export enum CronExpression {
	EVERY_MINUTE = '*/1 * * * *',
	EVERY_5_MINUTES = '*/5 * * * *',
	EVERY_10_MINUTES = '*/10 * * * *',
	EVERY_30_MINUTES = '*/30 * * * *',
	EVERY_HOUR = '0 0-23/1 * * *',
	EVERY_2_HOURS = '0 0-23/2 * * *',
	EVERY_3_HOURS = '0 0-23/3 * * *',
	EVERY_4_HOURS = '0 0-23/4 * * *',
	EVERY_5_HOURS = '0 0-23/5 * * *',
	EVERY_6_HOURS = '0 0-23/6 * * *',
	EVERY_7_HOURS = '0 0-23/7 * * *',
	EVERY_8_HOURS = '0 0-23/8 * * *',
	EVERY_9_HOURS = '0 0-23/9 * * *',
	EVERY_10_HOURS = '0 0-23/10 * * *',
	EVERY_11_HOURS = '0 0-23/11 * * *',
	EVERY_12_HOURS = '0 0-23/12 * * *',
	EVERY_DAY_AT_1AM = '0 01 * * *',
	EVERY_DAY_AT_2AM = '0 02 * * *',
	EVERY_DAY_AT_3AM = '0 03 * * *',
	EVERY_DAY_AT_4AM = '0 04 * * *',
	EVERY_DAY_AT_5AM = '0 05 * * *',
	EVERY_DAY_AT_6AM = '0 06 * * *',
	EVERY_DAY_AT_7AM = '0 07 * * *',
	EVERY_DAY_AT_8AM = '0 08 * * *',
	EVERY_DAY_AT_9AM = '0 09 * * *',
	EVERY_DAY_AT_10AM = '0 10 * * *',
	EVERY_DAY_AT_11AM = '0 11 * * *',
	EVERY_DAY_AT_NOON = '0 12 * * *',
	EVERY_DAY_AT_1PM = '0 13 * * *',
	EVERY_DAY_AT_2PM = '0 14 * * *',
	EVERY_DAY_AT_3PM = '0 15 * * *',
	EVERY_DAY_AT_4PM = '0 16 * * *',
	EVERY_DAY_AT_5PM = '0 17 * * *',
	EVERY_DAY_AT_6PM = '0 18 * * *',
	EVERY_DAY_AT_7PM = '0 19 * * *',
	EVERY_DAY_AT_8PM = '0 20 * * *',
	EVERY_DAY_AT_9PM = '0 21 * * *',
	EVERY_DAY_AT_10PM = '0 22 * * *',
	EVERY_DAY_AT_11PM = '0 23 * * *',
	EVERY_DAY_AT_MIDNIGHT = '0 0 * * *',
	EVERY_WEEK = '0 0 * * 0',
	EVERY_WEEKDAY = '0 0 * * 1-5',
	EVERY_WEEKEND = '0 0 * * 6,0',
	EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT = '0 0 1 * *',
	EVERY_1ST_DAY_OF_MONTH_AT_NOON = '0 12 1 * *',
	EVERY_2ND_HOUR = '0 */2 * * *',
	EVERY_2ND_HOUR_FROM_1AM_THROUGH_11PM = '0 1-23/2 * * *',
	EVERY_2ND_MONTH = '0 0 1 */2 *',
	EVERY_QUARTER = '0 0 1 */3 *',
	EVERY_6_MONTHS = '0 0 1 */6 *',
	EVERY_YEAR = '0 0 1 0 *',
	EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM = '0 */30 9-17 * * *',
	EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM = '0 */30 9-18 * * *',
	EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM = '0 */30 10-19 * * *',
	MONDAY_TO_FRIDAY_AT_1AM = '0 0 01 * * 1-5',
	MONDAY_TO_FRIDAY_AT_2AM = '0 0 02 * * 1-5',
	MONDAY_TO_FRIDAY_AT_3AM = '0 0 03 * * 1-5',
	MONDAY_TO_FRIDAY_AT_4AM = '0 0 04 * * 1-5',
	MONDAY_TO_FRIDAY_AT_5AM = '0 0 05 * * 1-5',
	MONDAY_TO_FRIDAY_AT_6AM = '0 0 06 * * 1-5',
	MONDAY_TO_FRIDAY_AT_7AM = '0 0 07 * * 1-5',
	MONDAY_TO_FRIDAY_AT_8AM = '0 0 08 * * 1-5',
	MONDAY_TO_FRIDAY_AT_9AM = '0 0 09 * * 1-5',
	MONDAY_TO_FRIDAY_AT_09_30AM = '0 30 09 * * 1-5',
	MONDAY_TO_FRIDAY_AT_10AM = '0 0 10 * * 1-5',
	MONDAY_TO_FRIDAY_AT_11AM = '0 0 11 * * 1-5',
	MONDAY_TO_FRIDAY_AT_11_30AM = '0 30 11 * * 1-5',
	MONDAY_TO_FRIDAY_AT_12PM = '0 0 12 * * 1-5',
	MONDAY_TO_FRIDAY_AT_1PM = '0 0 13 * * 1-5',
	MONDAY_TO_FRIDAY_AT_2PM = '0 0 14 * * 1-5',
	MONDAY_TO_FRIDAY_AT_3PM = '0 0 15 * * 1-5',
	MONDAY_TO_FRIDAY_AT_4PM = '0 0 16 * * 1-5',
	MONDAY_TO_FRIDAY_AT_5PM = '0 0 17 * * 1-5',
	MONDAY_TO_FRIDAY_AT_6PM = '0 0 18 * * 1-5',
	MONDAY_TO_FRIDAY_AT_7PM = '0 0 19 * * 1-5',
	MONDAY_TO_FRIDAY_AT_8PM = '0 0 20 * * 1-5',
	MONDAY_TO_FRIDAY_AT_9PM = '0 0 21 * * 1-5',
	MONDAY_TO_FRIDAY_AT_10PM = '0 0 22 * * 1-5',
	MONDAY_TO_FRIDAY_AT_11PM = '0 0 23 * * 1-5',
}

/**
 * Various time intervals in milliseconds.
 *
 * @enum {number}
 * @readonly
 * @property {number} MILISECOND - Represents one millisecond.
 * @property {number} SECOND - Represents one second (1000 milliseconds).
 * @property {number} MINUTE - Represents one minute (60,000 milliseconds).
 * @property {number} HOUR - Represents one hour (3,600,000 milliseconds).
 * @property {number} DAY - Represents one day (86,400,000 milliseconds).
 */
export enum IntervalExpression {
	MILISECOND = 1,
	SECOND = 1000,
	MINUTE = 1000 * 60,
	HOUR = 1000 * 60 * 60,
	DAY = 1000 * 60 * 60 * 24,
}
