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
import { PencilIcon, XIcon } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/formatter";
import { Input } from "@/components/ui/input";

export default function TransactionDrawer({
  item,
  isOpen,
}: {
  item: Transaction;
  isOpen: boolean;
}) {
  const [editingState, setEditingState] = useState(false);
  const [tabsValue, setTabsValue] = useState("details");
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      // Drawer just closed, reset editing state
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setEditingState(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  const isEditing = isOpen && editingState;

  return (
    <DrawerContent>
      <Tabs defaultValue={tabsValue} onValueChange={setTabsValue}>
        <DrawerHeader className="gap-1 relative">
          <div className="absolute top-4 right-4 flex items-center">
            {tabsValue === "details" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingState(true)}
                disabled={isEditing}
              >
                <PencilIcon className="size-4" />
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon className="size-4" />
              </Button>
            </DrawerClose>
          </div>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <DrawerTitle className="sr-only">Transaction details</DrawerTitle>
          <DrawerDescription className="sr-only">
            Transaction details for {item.name}
          </DrawerDescription>
        </DrawerHeader>
        <TabsContent value="details">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span>Account</span>
              <span>{item.account}</span>
            </div>
            <div>
              <span>Transaction ID</span>
              <span>{item.id}</span>
            </div>
            <div>
              <span>Timestamp</span>
              <span>{item.timestamp}</span>
            </div>
            <div>
              <span>Type</span>
              <span>Direct Debit</span>
            </div>
            <div>
              <span>Currency</span>
              <span>{item.currency}</span>
            </div>
            <div>
              <span>Amount</span>
              <span>{item.amount}</span>
            </div>
            <div>
              <span>Reference</span>
              <span>{item.reference}</span>
            </div>
            <div>
              <span>Notes</span>
              <span>{item.notes}</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="comments">
          <CommentTab />
        </TabsContent>
      </Tabs>
      {tabsValue === "details" && (
        <DrawerFooter>
          {isEditing ? (
            <Button variant="secondary" onClick={() => setEditingState(false)}>
              Save changes
            </Button>
          ) : (
            <div>
              <span className="text-gray-500 text-sm">Last updated:&nbsp;</span>
              <span className="text-gray-500 text-sm">today</span>
            </div>
          )}
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
    <div className="flex  flex-col w-full">
      <h3>Comments</h3>
      <div className="flex flex-col justify-between w-full">
        <div>
          {comments.map((comment) => {
            return (
              <div key={comment.id} className="flex gap-6 items-center">
                <span className="text-gray-500 text-sm">
                  {formatTime(comment.createdAt)}
                </span>
                <p>{comment.comment}</p>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-1 items-center">
            <Input placeholder="Add comment" />
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
