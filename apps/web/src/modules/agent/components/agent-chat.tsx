import { useChat } from "@ai-sdk/react";
import { eventIteratorToUnproxiedDataStream } from "@orpc/client";
import { Send } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { client } from "@/utils/orpc";

export function AgentChat() {
	const { messages, sendMessage, status } = useChat({
		transport: {
			async sendMessages(options) {
				return eventIteratorToUnproxiedDataStream(
					await client.agent.chat(
						{
							chatId: options.chatId,
							messages: options.messages,
						},
						{ signal: options.abortSignal },
					),
				);
			},
			reconnectToStream(_options) {
				throw new Error("Unsupported");
			},
		},
	});

	const [input, setInput] = useState("");

	const messagesEndRef = useRef<HTMLDivElement>(null);

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4">
					{messages.length === 0 && (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							<p>Start a conversation with your finance agent...</p>
						</div>
					)}
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.role === "user" ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`max-w-[80%] rounded-lg p-3 ${
									message.role === "user"
										? "bg-primary text-primary-foreground"
										: "bg-muted"
								}`}
							>
								{message.parts.map((part) =>
									part.type === "text" ? (
										<span key={crypto.randomUUID()}>{part.text}</span>
									) : null,
								)}
							</div>
						</div>
					))}
					{status !== "ready" && (
						<div className="flex justify-start">
							<div className="max-w-[80%] rounded-lg bg-muted p-3">
								<p className="text-muted-foreground">Thinking...</p>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (input.trim()) {
						sendMessage({ text: input });
						setInput("");
					}
				}}
				className="border-t p-4"
			>
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask about your finances..."
						disabled={status !== "ready"}
						className="flex-1"
					/>
					<Button type="submit" disabled={status !== "ready" || !input.trim()}>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</form>
		</div>
	);
}
