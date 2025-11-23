import { Button } from "@/components/ui/button";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Transaction } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { formatTime } from "@/lib/formatter";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function TransactionDrawer({
  item,
  isOpen,
}: {
  item: Transaction;
  isOpen: boolean;
}) {
  const [tabsValue, setTabsValue] = useState("details");

  return (
    <DrawerContent className="flex flex-col">
      <Tabs
        defaultValue={tabsValue}
        onValueChange={setTabsValue}
        className="flex flex-col flex-1 min-h-0"
      >
        <DrawerHeader className="gap-3 relative pb-4 shrink-0">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <DrawerTitle className="sr-only">Transaction details</DrawerTitle>
          <DrawerDescription className="sr-only">
            Transaction details for {item.name}
          </DrawerDescription>
        </DrawerHeader>
        <TabsContent value="details" className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground font-medium">
                Account
              </span>
              <span className="text-base font-semibold">{item.account}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground font-medium">
                Transaction ID
              </span>
              <span className="text-base font-mono text-sm">{item.id}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground font-medium">
                Timestamp
              </span>
              <span className="text-base">{item.timestamp}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground font-medium">
                Type
              </span>
              <span className="text-base">Direct Debit</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground font-medium">
                Currency
              </span>
              <span className="text-base font-semibold">{item.currency}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground font-medium">
                Amount
              </span>
              <span className="text-xl font-bold">{item.amount}</span>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm text-muted-foreground font-medium">
                Reference
              </span>
              <span className="text-base break-words">{item.reference}</span>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm text-muted-foreground font-medium">
                Notes
              </span>
              <span className="text-base break-words">{item.notes || "—"}</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="comments"
          className="px-4 pb-4 flex flex-col flex-1 min-h-0"
        >
          <CommentTab />
        </TabsContent>
      </Tabs>
      {tabsValue === "details" && (
        <DrawerFooter className="pt-4 shrink-0">
          <div className="text-sm text-muted-foreground">
            Last updated: <span className="font-medium">today</span>
          </div>
        </DrawerFooter>
      )}
    </DrawerContent>
  );
}

const data = [
  { id: 1, comment: "Wtf", createdAt: new Date(2025, 1, 15) },
  { id: 2, comment: "Wtf", createdAt: new Date(2025, 1, 16) },
  { id: 3, comment: "Wtf", createdAt: new Date(2025, 1, 17) },
  { id: 4, comment: "Wtf", createdAt: new Date(2025, 1, 18) },
  { id: 5, comment: "Wtf", createdAt: new Date(2025, 1, 19) },
  { id: 6, comment: "Wtf", createdAt: new Date(2025, 1, 20) },
];

function CommentTab() {
  const [comments] = useState(data);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0">
        {comments.length > 0 ? (
          <div className="flex flex-col">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={`py-3 ${index < comments.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatTime(comment.createdAt)}
                  </span>
                  <p className="text-sm leading-relaxed">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No comments yet
          </div>
        )}
      </div>
      <div className="pt-4 border-t mt-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input placeholder="Add a comment..." className="flex-1" />
          <Button type="submit" size="default">
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}
