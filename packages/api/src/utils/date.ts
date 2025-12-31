export class DateTime extends Date {
	constructor(value?: string | number | Date) {
		super(value ?? new Date());
	}

	truncateTime(): DateTime {
		const d = new DateTime(this);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	subtractPeriod(value: string): DateTime {
		const regex = /^(\d+)([a-zA-Z]+)$/;
		const match = value.match(regex);

		if (!match) {
			throw new Error("Invalid period format. Use e.g., '1y', '3m'");
		}

		const [, number, unit] = match;
		const val = Number(number);

		switch (unit) {
			case "y":
				return this.subtract(val, "y");
			case "m":
				return this.subtract(val, "m");
			case "w":
				return this.subtract(val * 7, "d");
			case "d":
				return this.subtract(val, "d");
			case "h":
				return this.subtract(val, "h");
			default:
				throw new Error(`Unsupported unit: ${unit}`);
		}
	}

	subtract(value: number, unit: "y" | "m" | "d" | "h"): DateTime {
		const d = new DateTime(this);

		switch (unit) {
			case "y":
				d.setFullYear(d.getFullYear() - value);
				break;
			case "m":
				d.setMonth(d.getMonth() - value);
				break;
			case "d":
				d.setDate(d.getDate() - value);
				break;
			case "h":
				d.setHours(d.getHours() - value);
				break;
		}
		return d;
	}

	addPeriod(value: string): DateTime {
		const regex = /^(\d+)([a-zA-Z]+)$/;
		const match = value.match(regex);

		if (!match) {
			throw new Error("Invalid period format. Use e.g., '1y', '3m'");
		}

		const [, number, unit] = match;
		const val = Number(number);

		switch (unit) {
			case "y":
				return this.add(val, "y");
			case "m":
				return this.add(val, "m");
			case "w":
				return this.add(val * 7, "d");
			case "d":
				return this.add(val, "d");
			case "h":
				return this.add(val, "h");
			default:
				throw new Error(`Unsupported unit: ${unit}`);
		}
	}

	add(value: number, unit: "y" | "m" | "d" | "h"): DateTime {
		const d = new DateTime(this);

		switch (unit) {
			case "y":
				d.setFullYear(d.getFullYear() + value);
				break;
			case "m":
				d.setMonth(d.getMonth() + value);
				break;
			case "d":
				d.setDate(d.getDate() + value);
				break;
			case "h":
				d.setHours(d.getHours() + value);
				break;
		}
		return d;
	}
}
