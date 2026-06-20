// FIFO (First In First Out) 先进先出算法 - 按效期优先出库
import type { DrugBatch } from '../types/drug';

export interface FifoResult {
  batchList: FifoBatchItem[];
  totalQuantity: number;
  canFulfill: boolean;
  shortfall: number;
}

export interface FifoBatchItem {
  batchId: string;
  batchNo: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  remainingQuantity: number;
  price: number;
}

export function sortBatchesByExpiry(batches: DrugBatch[]): DrugBatch[] {
  return [...batches].sort((a, b) => {
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    return dateA - dateB;
  });
}

export function filterAvailableBatches(batches: DrugBatch[]): DrugBatch[] {
  return batches.filter(batch => {
    if (batch.status === 'locked' || batch.status === 'expired' || batch.status === 'used_up') {
      return false;
    }
    if (batch.remainingQuantity <= 0) {
      return false;
    }
    const expiryTime = new Date(batch.expiryDate).getTime();
    const now = Date.now();
    return expiryTime >= now;
  });
}

export function calculateFifo(batches: DrugBatch[], requiredQuantity: number): FifoResult {
  const availableBatches = filterAvailableBatches(batches);
  const sortedBatches = sortBatchesByExpiry(availableBatches);

  const result: FifoBatchItem[] = [];
  let remainingNeeded = requiredQuantity;
  let totalAllocated = 0;

  for (const batch of sortedBatches) {
    if (remainingNeeded <= 0) break;

    const availableQty = batch.remainingQuantity;
    const allocateQty = Math.min(availableQty, remainingNeeded);

    if (allocateQty > 0) {
      result.push({
        batchId: batch.id,
        batchNo: batch.batchNo,
        quantity: allocateQty,
        unit: batch.unit,
        expiryDate: batch.expiryDate,
        remainingQuantity: batch.remainingQuantity,
        price: batch.price
      });

      totalAllocated += allocateQty;
      remainingNeeded -= allocateQty;
    }
  }

  return {
    batchList: result,
    totalQuantity: totalAllocated,
    canFulfill: remainingNeeded <= 0,
    shortfall: Math.max(0, remainingNeeded)
  };
}

export function validateBatchForOutbound(batch: DrugBatch): { valid: boolean; reason?: string } {
  if (batch.status === 'locked') {
    return { valid: false, reason: '批次已锁定，不可出库' };
  }
  if (batch.status === 'expired') {
    return { valid: false, reason: '批次已过期，不可出库' };
  }
  if (batch.status === 'used_up') {
    return { valid: false, reason: '批次已用完' };
  }
  if (batch.remainingQuantity <= 0) {
    return { valid: false, reason: '库存不足' };
  }

  const expiryTime = new Date(batch.expiryDate).getTime();
  const now = Date.now();
  if (expiryTime < now) {
    return { valid: false, reason: '药品已过期，不可出库' };
  }

  return { valid: true };
}

export function getTotalAvailableQuantity(batches: DrugBatch[]): number {
  return filterAvailableBatches(batches).reduce((sum, batch) => sum + batch.remainingQuantity, 0);
}

export function getTotalLockedQuantity(batches: DrugBatch[]): number {
  return batches
    .filter(batch => batch.status === 'locked')
    .reduce((sum, batch) => sum + batch.remainingQuantity, 0);
}

export function getTotalExpiredQuantity(batches: DrugBatch[]): number {
  return batches
    .filter(batch => batch.status === 'expired')
    .reduce((sum, batch) => sum + batch.remainingQuantity, 0);
}

export function getExpiringSoonBatches(batches: DrugBatch[], days: number = 90): DrugBatch[] {
  const now = Date.now();
  const warningDate = now + days * 24 * 60 * 60 * 1000;

  return batches.filter(batch => {
    if (batch.status === 'expired' || batch.status === 'used_up') {
      return false;
    }
    const expiryTime = new Date(batch.expiryDate).getTime();
    return expiryTime >= now && expiryTime <= warningDate;
  });
}
