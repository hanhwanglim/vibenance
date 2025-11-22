import { Transaction } from "./columns";
import { sampleTransactions } from "./sample-transactions";

// This would normally come from a database/API
export function getAllTransactions(): Transaction[] {
  return sampleTransactions;
}

// Helper to flatten transactions including sub-transactions
export function flattenTransactions(
  transactions: Transaction[],
): Transaction[] {
  const flattened: Transaction[] = [];

  function addTransaction(txn: Transaction) {
    flattened.push(txn);
    if (txn.subTransactions) {
      txn.subTransactions.forEach(addTransaction);
    }
  }

  transactions.forEach(addTransaction);
  return flattened;
}
