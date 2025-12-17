export function formatCurrency(amount: number, currency?: string) {
	if (!currency) {
		return amount.toFixed(2);
	}

	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: currency ?? "GBP",
	}).format(amount);
}
