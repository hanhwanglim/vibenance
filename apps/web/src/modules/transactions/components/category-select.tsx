import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/utils/orpc";

type CategorySelectProps = {
	value?: string | null;
	onValueChange: (value: string) => void;
};

export function CategorySelect({ value, onValueChange }: CategorySelectProps) {
	const { data: categories } = useQuery(
		orpc.transaction.listCategories.queryOptions(),
	);

	return (
		<>
			<Label className="sr-only">Category</Label>
			<Select onValueChange={onValueChange} defaultValue={value || "null"}>
				<SelectTrigger className="w-45">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Category</SelectLabel>
						{categories?.map((category) => {
							return (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							);
						})}
						<Separator />
						<SelectItem value="null">-</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</>
	);
}
