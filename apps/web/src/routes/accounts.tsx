import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AccountCards } from "@/modules/accounts/components/account-card";
import { AccountDialog } from "@/modules/accounts/components/create-account-dialog";

export const Route = createFileRoute("/accounts")({
	component: RouteComponent,
});

function RouteComponent() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<AccountWithStats | null>(
		null,
	);
	const handleDialogSuccess = () => {
		setDialogOpen(false);
		setEditingAccount(null);
	};

	return (
		<div>
			<div className="px-4 lg:px-6">
				<div className="flex items-center justify-between">
					<Dialog
						open={dialogOpen}
						onOpenChange={(open) => {
							setDialogOpen(open);
							if (!open) setEditingAccount(null);
						}}
					>
						<Button
							onClick={() => {
								setEditingAccount(null);
								setDialogOpen(true);
							}}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Account
						</Button>
						<AccountDialog
							account={editingAccount}
							open={dialogOpen}
							onOpenChange={(open) => {
								setDialogOpen(open);
								if (!open) setEditingAccount(null);
							}}
							onSuccess={handleDialogSuccess}
						/>
					</Dialog>
				</div>
				<AccountCards />
			</div>
		</div>
	);
}
