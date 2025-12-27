import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/modules/agent/components/agent-chat";

export const Route = createFileRoute("/_app/agent")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto h-[calc(100vh-8rem)] py-4">
			<div className="mb-4">
				<h1 className="font-bold text-2xl">Finance Agent</h1>
				<p className="text-muted-foreground">
					Chat with your personal finance assistant
				</p>
			</div>
			<div className="h-full rounded-lg border">
				<AgentChat />
			</div>
		</div>
	);
}
