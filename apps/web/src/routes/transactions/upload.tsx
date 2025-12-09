import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/transactions/upload")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	const uploadMutation = useMutation(orpc.file.upload.mutationOptions({}));
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const file = formData.get("file") as File;
		uploadMutation.mutate(file);
	};

	return (
		<form onSubmit={handleSubmit}>
			<input type="file" name="file" />
			<Button type="submit">Upload</Button>
		</form>
	);
}
