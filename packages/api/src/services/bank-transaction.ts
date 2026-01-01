import type { TransactionInsert } from "@vibenance/db/schema/transaction";
import { detectParser, parseFile } from "@vibenance/parser/core/parse";
import { BankTransactionRepository } from "../repository/bank-transaction";
import { DateTime } from "../utils/date";
import type { DateRange, Pagination } from "../utils/filter";
import { FileService } from "./file";
import { FileImportService } from "./file-import";

type TransactionCreate = Omit<
	TransactionInsert,
	"id" | "accountId" | "fileImportId"
>;

export const BankTransactionService = {
	getAll: async (
		type: string,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		const count = await BankTransactionRepository.count(type, dateRange);
		const transactions = await BankTransactionRepository.getAll(
			type,
			dateRange,
			pagination,
		);

		return { count, transactions };
	},

	previewImport: async (id: string) => {
		const fileImport = await FileImportService.findById(id);
		if (!fileImport || !fileImport.files[0]) {
			throw new Error("NOT FOUND");
		}

		const file = Bun.file(fileImport.files[0].filePath);

		const parseType = await detectParser(file);
		return await parseFile(file, parseType);
	},

	createImport: async (fileId: string) => {
		const fileImport = await FileImportService.create("transactions");
		if (!fileImport) {
			throw new Error("INTERNAL SERVER ERROR");
		}

		await FileService.update(fileId, {
			fileImportId: fileImport.id,
		});
		return fileImport || null;
	},

	bulkCreate: async (
		transactions: Array<TransactionCreate>,
		accountId: string,
		fileImportId: string,
	) => {
		const txs = transactions.map((tx) => {
			return {
				...tx,
				accountId: accountId,
				fileImportId: fileImportId,
			};
		});

		const objs = await BankTransactionRepository.bulkCreate(txs);
		await FileImportService.update(fileImportId, { status: "success" });

		return objs;
	},

	getSummary: async (dateRange: DateRange | undefined) => {
		let range = dateRange;
		let previousRange = dateRange;

		if (range?.from) {
			range.from = new DateTime(range.from).truncateTime();
		}
		if (range?.to) {
			range.to = new DateTime(range.to).truncateTime().addPeriod("1d");
		}

		if (range?.period) {
			range = {
				from: new DateTime().truncateTime().subtractPeriod(range.period),
				to: range.to,
				period: range.period,
			};
			previousRange = {
				from: (range.from as DateTime).subtractPeriod(range.period as string),
				to: range.from,
				period: range.period,
			};
		} else if (range?.from && range.to) {
			const diffInDays =
				(range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24);
			const from = new DateTime(range.from);
			previousRange = {
				from: from.subtract(diffInDays, "d"),
				to: range.from,
			};
		}

		const [count, totalIncome, totalExpenses] = await Promise.all([
			BankTransactionRepository.count("all", range),
			BankTransactionRepository.totalIncome(range),
			BankTransactionRepository.totalExpenses(range),
		]);

		let prevCount = 0;
		let prevTotalIncome = "0";
		let prevTotalExpenses = "0";

		if (previousRange) {
			[prevCount, prevTotalIncome, prevTotalExpenses] = await Promise.all([
				BankTransactionRepository.count("all", previousRange),
				BankTransactionRepository.totalIncome(previousRange),
				BankTransactionRepository.totalExpenses(previousRange),
			]);
		}

		return {
			count: count,
			totalIncome: Number(totalIncome),
			totalExpenses: -Number(totalExpenses),
			netAmount: Number(totalIncome) + Number(totalExpenses),

			prevCount: prevCount,
			prevTotalIncome: Number(prevTotalIncome),
			prevTotalExpenses: -Number(prevTotalExpenses),
			prevNetAmount: Number(prevTotalIncome) + Number(prevTotalExpenses),
		};
	},

	listCategories: async () => {
		return await BankTransactionRepository.listCategories();
	},

	updateCategory: async (transactionId: string, categoryId: string | null) => {
		return await BankTransactionRepository.updateCategory(
			transactionId,
			categoryId,
		);
	},

	categoryBreakdown: async (dateRange?: DateRange) => {
		const [categories, totalExpenses] = await Promise.all([
			BankTransactionRepository.categoriesWithTransactions(dateRange),
			BankTransactionRepository.totalExpenses(dateRange),
		]);

		// Keep top 6 categories, group the rest into "Others"
		const maxCategories = 6;
		const topCategories = categories.slice(0, maxCategories);
		const otherCategories = categories.slice(maxCategories);

		const formattedCategories = topCategories.map((category, index) => {
			return {
				category: category.name || "Uncategorized",
				sum: -Number(category.sum),
				fill: `var(--chart-${(index % 6) + 1})`,
			};
		});

		// Add "Others" category if there are remaining categories
		if (otherCategories.length > 0) {
			const othersSum = otherCategories.reduce(
				(acc, cat) => acc + Number(cat.sum || 0),
				0,
			);
			formattedCategories.push({
				category: "Others",
				sum: -othersSum,
				fill: "var(--chart-7)",
			});
		}

		return {
			categories: formattedCategories,
			sum: totalExpenses,
		};
	},

	spendingTrend: async (dateRange?: DateRange) => {
		let window = dateRange;

		if (!window) {
			const range = await BankTransactionRepository.spendingPeriod();
			window = { from: range.min, to: range.max };
		}

		const { interval, format } = getChartInterval(window.from, window.to);
		const data = await BankTransactionRepository.spendingTrend(
			window,
			interval,
		);

		return {
			data: data,
			interval: interval,
			format: format,
		};
	},

	spendingTrendByCategory: async (dateRange?: DateRange) => {
		let window = dateRange;

		if (!window) {
			const range = await BankTransactionRepository.spendingPeriod();
			window = { from: range.min, to: range.max };
		}

		const { interval, format } = getChartInterval(window.from, window.to);
		const data = await BankTransactionRepository.spendingTrendByCategory(
			window,
			interval,
		);
		const categories = new Map<string, null>();

		type TrendItem = {
			bin: string;
			category: string | null;
			sum: string;
		};

		type FlattenedItem = {
			bin: string;
		} & {
			[categoryName: string]: string | number;
		};

		const typedData = data as TrendItem[];

		const flattenedData = Object.values(
			typedData.reduce(
				(acc: Record<string, FlattenedItem>, item: TrendItem) => {
					const bin = item.bin;
					if (!acc[bin]) {
						acc[bin] = { bin: bin };
					}

					const categoryName = item.category || "Uncategorized";
					categories.set(categoryName, null);
					acc[bin][categoryName] = -Number.parseFloat(item.sum);

					return acc;
				},
				{} as Record<string, FlattenedItem>,
			),
		);

		return {
			data: flattenedData,
			categories: categories.keys().toArray(),
			interval: interval,
			format: format,
		};
	},
};

function getChartInterval(from: Date | undefined, to: Date | undefined) {
	if (!from || !to) {
		return { interval: undefined, format: undefined };
	}

	const diffInMs = to.getTime() - from.getTime();
	const diffInMinutes = diffInMs / (1000 * 60);
	const diffInHours = diffInMinutes / 60;
	const diffInDays = diffInHours / 24;

	if (diffInDays > 10 * 365) {
		return { interval: "year", format: { year: "numeric" } };
	}
	if (diffInDays > 10 * 30) {
		return { interval: "month", format: { month: "short", year: "2-digit" } };
	}
	if (diffInDays > 10 * 7) {
		return { interval: "week", format: { month: "short", day: "numeric" } };
	}
	if (diffInDays > 10) {
		return { interval: "day", format: { month: "short", day: "numeric" } };
	}
	if (diffInHours > 10) {
		return { interval: "hour", format: { hour: "numeric", minute: "2-digit" } };
	}
	return { interval: "month", format: { month: "short", year: "2-digit" } };
}
