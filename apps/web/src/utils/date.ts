export class DateTime {
	private date: Date;

	constructor() {
		this.date = new Date();
	}

	subtract(value: number, unit: "year" | "month" | "day" | "hour") {
		const d = new Date();
		switch (unit) {
			case "year":
				d.setFullYear(this.date.getFullYear() - value);
				return d;
			case "month":
				d.setMonth(this.date.getMonth() - value);
				return d;
			case "day":
				d.setDate(this.date.getDate() - value);
				return d;
			case "hour":
				d.setHours(this.date.getHours() - value);
				return d;
		}
	}
}
