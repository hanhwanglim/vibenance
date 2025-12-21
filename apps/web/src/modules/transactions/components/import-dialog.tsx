import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export function ImportDialog() {
	const navigate = useNavigate();

	const uploadMutation = useMutation(orpc.file.upload.mutationOptions({}));
	const importMutation = useMutation(
		orpc.transaction.createImport.mutationOptions({}),
	);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData(e.target as HTMLFormElement);
		const file = formData.get("file") as File;

		uploadMutation.mutate(file, {
			onSuccess: (data) => {
				importMutation.mutate(data.id, {
					onSuccess: (data) => {
						navigate({
							to: "/transactions/imports/$id",
							params: { id: String(data.id) },
						});
					},
				});
			},
			onError: (error) => {
				console.log(error);
			},
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<PlusIcon />
					<span className="hidden lg:inline">Import Transactions</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Import Transactions</DialogTitle>
						<DialogDescription>
							Import transactions to your account.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="file">File</Label>
							<Input name="file" type="file" />
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button type="submit">Upload</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
