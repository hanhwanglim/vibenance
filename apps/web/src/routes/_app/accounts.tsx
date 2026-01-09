import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AccountDialog } from "@/modules/accounts/components/account-dialog";
import { AccountList } from "@/modules/accounts/components/account-list";

export const Route = createFileRoute("/_app/accounts")({
	component: RouteComponent,
});

function RouteComponent() {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div>
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="flex items-center justify-between px-4 lg:px-6">
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<Button onClick={() => setDialogOpen(true)} className="gap-2">
							<Plus className="h-4 w-4" />
							Add Account
						</Button>
						<AccountDialog mode="create" onOpenChange={setDialogOpen} />
					</Dialog>
				</div>
				<AccountList />
			</div>
		</div>
	);
}
