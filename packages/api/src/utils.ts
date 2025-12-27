import z from "zod";

export const pagination = z.object({
	pageIndex: z.number().default(0),
	pageSize: z.number().default(20),
});

export const dateRange = z.object({
	from: z.date().optional(),
	to: z.date().optional(),
});

export type Pagination = z.infer<typeof pagination>;
export type DateRange = z.infer<typeof dateRange>;
