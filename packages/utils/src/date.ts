export type Period = {
	years?: number;
	months?: number;
	weeks?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
	milliseconds?: number;
};

export function parsePeriod(periodString: string): Period {
	const regex = /^(\d+)([a-zA-Z]+)$/;
	const match = periodString.match(regex);

	if (!match) {
		throw new Error("Invalid period format. Use e.g., '1y', '3m'");
	}

	const [, number, unit] = match;
	const val = Number(number);

	switch (unit) {
		case "y":
			return { years: val };
		case "m":
			return { months: val };
		case "w":
			return { weeks: val };
		case "d":
			return { days: val };
		case "h":
			return { hours: val };
		default:
			throw new Error(`Unsupported unit: ${unit}`);
	}
}

export class DateTime extends Date {
	constructor(value?: string | number | Date) {
		super(value ?? new Date());
	}

	startOfDay(): DateTime {
		const d = new DateTime(this);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	subtract(period: Period): DateTime {
		const d = new DateTime(this);

		if (period.years !== undefined) {
			d.setFullYear(d.getFullYear() - period.years);
		}
		if (period.months !== undefined) {
			d.setMonth(d.getMonth() - period.months);
		}
		if (period.weeks !== undefined) {
			d.setDate(d.getDate() - period.weeks * 7);
		}
		if (period.days !== undefined) {
			d.setDate(d.getDate() - period.days);
		}
		if (period.hours !== undefined) {
			d.setHours(d.getHours() - period.hours);
		}
		if (period.minutes !== undefined) {
			d.setMinutes(d.getMinutes() - period.minutes);
		}
		if (period.seconds !== undefined) {
			d.setSeconds(d.getSeconds() - period.seconds);
		}
		if (period.milliseconds !== undefined) {
			d.setMilliseconds(d.getMilliseconds() - period.milliseconds);
		}

		return d;
	}

	add(period: Period): DateTime {
		const d = new DateTime(this);

		if (period.years !== undefined) {
			d.setFullYear(d.getFullYear() + period.years);
		}
		if (period.months !== undefined) {
			d.setMonth(d.getMonth() + period.months);
		}
		if (period.weeks !== undefined) {
			d.setDate(d.getDate() + period.weeks * 7);
		}
		if (period.days !== undefined) {
			d.setDate(d.getDate() + period.days);
		}
		if (period.hours !== undefined) {
			d.setHours(d.getHours() + period.hours);
		}
		if (period.minutes !== undefined) {
			d.setMinutes(d.getMinutes() + period.minutes);
		}
		if (period.seconds !== undefined) {
			d.setSeconds(d.getSeconds() + period.seconds);
		}
		if (period.milliseconds !== undefined) {
			d.setMilliseconds(d.getMilliseconds() + period.milliseconds);
		}

		return d;
	}
}
