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
import { useEffect, useRef, useState } from "react";

export default function TransactionDrawer({
  item,
  isOpen,
}: {
  item: Transaction;
  isOpen: boolean;
}) {
  const [editingState, setEditingState] = useState(false);
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
      <Tabs defaultValue="details">
        <DrawerHeader className="gap-1 relative">
          <div className="absolute top-4 right-4 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingState(true)}
              disabled={isEditing}
            >
              <PencilIcon className="size-4" />
            </Button>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span>Comment</span>
              <span>{item.notes}</span>
            </div>
            <div>
              <span>Commenter</span>
              <span>{item.notes}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <DrawerFooter>
        {isEditing ? (
          <Button variant="secondary" onClick={() => setEditingState(false)}>
            Save changes
          </Button>
        ) : (
          <div>
            <span>Last updated:&nbsp;</span>
            <span>today</span>
          </div>
        )}
      </DrawerFooter>
    </DrawerContent>
  );
}
