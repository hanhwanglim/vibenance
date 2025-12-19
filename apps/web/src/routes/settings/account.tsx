import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/settings/account")({
	component: RouteComponent,
});

function RouteComponent() {
	const [telegramUserId, setTelegramUserId] = useState<string | null>(null);
	const [telegramChatId, setTelegramChatId] = useState<string | null>(null);

	const { data: telegramCredential, isLoading } = useQuery(
		orpc.settings.list.queryOptions({
			queryKey: ["settings", "telegramCredential"],
		}),
	);

	const createMutation = useMutation(
		orpc.settings.createTelegramCredential.mutationOptions({}),
	);
	const deleteMutation = useMutation(orpc.settings.delete.mutationOptions({}));

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!telegramUserId || !telegramChatId) {
			return;
		}

		createMutation.mutate(
			{
				telegramUserId: telegramUserId,
				telegramChatId: telegramChatId,
			},
			{
				onSuccess: () => {
					toast.success("Success");
					queryClient.invalidateQueries({
						queryKey: ["settings", "telegramCredential"],
					});
				},
			},
		);
	};

	const handleDelete = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!telegramCredential) {
			return;
		}

		deleteMutation.mutate(telegramCredential.id, {
			onSuccess: () => {
				toast.success("Deleted credential");
				queryClient.invalidateQueries({
					queryKey: ["settings", "telegramCredential"],
				});
			},
		});
	};

	if (!isLoading && !!telegramCredential) {
		return (
			<div>
				<form onSubmit={handleDelete}>
					<p>Telegram user id</p>
					<p>{telegramCredential.telegramUserId}</p>
					<p>Telegram chat id</p>
					<p>{telegramCredential.telegramChatId}</p>
					<Button variant="destructive">Delete</Button>
				</form>
			</div>
		);
	}

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<Label>Telegram user id</Label>
				<Input
					type="text"
					onChange={(e) => setTelegramUserId(e.target.value)}
				/>
				<Label>Telegram chat id</Label>
				<Input
					type="text"
					onChange={(e) => setTelegramChatId(e.target.value)}
				/>
				<Button>Save</Button>
			</form>
		</div>
	);
}
