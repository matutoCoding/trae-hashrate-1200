import { create } from 'zustand';
import type { Drug, DrugBatch, StockInRecord, ExpiryWarning } from '../types/drug';
import type { ApprovalOrder, RouterRule, ApprovalBranch, ApprovalContent } from '../types/approval';
import type { Recipient, QualificationReview, DistributionRecord } from '../types/distribution';
import { mockDrugs, mockDrugBatches, mockStockInRecords, generateExpiryWarnings, getBatchesByDrugId } from '../data/drugData';
import { mockApprovalOrders, mockRouterRules } from '../data/approvalData';
import { mockRecipients, mockQualificationReviews, mockDistributionRecords } from '../data/distributionData';
import { calculateFifo } from '../utils/fifo';
import { matchRouterRule } from '../utils/approvalRouter';
import { getExpiryWarningLevel, isExpired } from '../utils/date';

interface AppState {
  drugs: Drug[];
  batches: DrugBatch[];
  stockInRecords: StockInRecord[];
  expiryWarnings: ExpiryWarning[];
  approvalOrders: ApprovalOrder[];
  routerRules: RouterRule[];
  recipients: Recipient[];
  qualificationReviews: QualificationReview[];
  distributionRecords: DistributionRecord[];
  reservedQuantities: Record<string, number>;

  initData: () => void;

  addStockIn: (record: Omit<StockInRecord, 'id' | 'receiveTime'>) => void;
  getDrugBatches: (drugId: string) => DrugBatch[];
  getDrugTotalStock: (drugId: string) => number;
  getAvailableStock: (drugId: string) => number;

  createStockOutApproval: (params: {
    drugId: string;
    quantity: number;
    applicant: string;
    purpose?: string;
    remark?: string;
  }) => { success: boolean; message: string; orderId?: string };

  processApproval: (params: {
    approvalId: string;
    action: 'approve' | 'reject';
    level: number;
    remark?: string;
    approver?: string;
  }) => { success: boolean; message: string };

  updateRouterRule: (rule: RouterRule) => void;
  addRouterRule: (rule: Omit<RouterRule, 'id' | 'createTime' | 'updateTime'>) => void;
  toggleRouterRule: (ruleId: string, enabled: boolean) => void;
  deleteRouterRule: (ruleId: string) => void;

  processQualificationReview: (params: {
    reviewId: string;
    action: 'approve' | 'reject';
    remark?: string;
    reviewer?: string;
  }) => { success: boolean; message: string };

  createDistribution: (params: {
    recipientId: string;
    drugId: string;
    quantity: number;
    approvalId?: string;
    distributor: string;
    pickUpMethod: 'self' | 'family' | 'delivery';
    pickUpPerson?: string;
    pickUpPersonIdCard?: string;
    remark?: string;
  }) => { success: boolean; message: string; recordId?: string };

  refreshExpiryWarnings: () => void;
  refreshDrugStatus: (drugId: string) => void;
  refreshAllDrugStatus: () => void;
}

const generateId = (prefix: string) => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const generateOrderNo = (prefix: string) => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${dateStr}${random}`;
};

export const useAppStore = create<AppState>((set, get) => ({
  drugs: [],
  batches: [],
  stockInRecords: [],
  expiryWarnings: [],
  approvalOrders: [],
  routerRules: [],
  recipients: [],
  qualificationReviews: [],
  distributionRecords: [],
  reservedQuantities: {},

  initData: () => {
    const drugs = [...mockDrugs];
    const batches = [...mockDrugBatches];
    const stockInRecords = [...mockStockInRecords];
    const expiryWarnings = generateExpiryWarnings(batches);
    const approvalOrders = [...mockApprovalOrders];
    const routerRules = [...mockRouterRules];
    const recipients = [...mockRecipients];
    const qualificationReviews = [...mockQualificationReviews];
    const distributionRecords = [...mockDistributionRecords];

    const reservedQuantities: Record<string, number> = {};
    approvalOrders.forEach(order => {
      if ((order.status === 'pending' || order.status === 'processing') && order.content.batchList) {
        order.content.batchList.forEach(item => {
          if (reservedQuantities[item.batchId]) {
            reservedQuantities[item.batchId] += item.quantity;
          } else {
            reservedQuantities[item.batchId] = item.quantity;
          }
        });
      }
    });

    set({
      drugs,
      batches,
      stockInRecords,
      expiryWarnings,
      approvalOrders,
      routerRules,
      recipients,
      qualificationReviews,
      distributionRecords,
      reservedQuantities
    });
  },

  addStockIn: (record) => {
    const newRecord: StockInRecord = {
      ...record,
      id: generateId('in'),
      receiveTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const drug = get().drugs.find(d => d.id === record.drugId);
    if (!drug) return;

    const existingBatch = get().batches.find(
      b => b.drugId === record.drugId && b.batchNo === record.batchNo
    );

    let newBatch: DrugBatch;
    if (existingBatch) {
      newBatch = {
        ...existingBatch,
        quantity: existingBatch.quantity + record.quantity,
        remainingQuantity: existingBatch.remainingQuantity + record.quantity
      };
      set(state => ({
        batches: state.batches.map(b => b.id === existingBatch.id ? newBatch : b)
      }));
    } else {
      newBatch = {
        id: generateId('batch'),
        drugId: record.drugId,
        drugName: record.drugName,
        batchNo: record.batchNo,
        spec: record.spec,
        quantity: record.quantity,
        remainingQuantity: record.quantity,
        expiryDate: record.expiryDate,
        productionDate: record.productionDate,
        manufacturer: record.manufacturer,
        unit: record.unit,
        price: drug.price,
        status: isExpired(record.expiryDate) ? 'expired' : 'normal',
        storageLocation: 'A-01',
        receiveTime: newRecord.receiveTime,
        receivePerson: record.receivePerson,
        supplier: record.supplier,
        inspectionStatus: record.inspectionStatus,
        inspectionRemark: record.inspectionRemark
      };
      set(state => ({
        batches: [...state.batches, newBatch]
      }));
    }

    set(state => ({
      stockInRecords: [newRecord, ...state.stockInRecords]
    }));

    get().refreshDrugStatus(record.drugId);
    get().refreshExpiryWarnings();
  },

  getDrugBatches: (drugId) => {
    return get().batches.filter(b => b.drugId === drugId);
  },

  getDrugTotalStock: (drugId) => {
    return get().batches
      .filter(b => b.drugId === drugId)
      .reduce((sum, b) => sum + b.remainingQuantity, 0);
  },

  getAvailableStock: (drugId) => {
    const { batches, reservedQuantities } = get();
    return batches
      .filter(b => b.drugId === drugId && b.status !== 'expired' && b.status !== 'locked' && b.status !== 'used_up')
      .reduce((sum, b) => {
        const reserved = reservedQuantities[b.id] || 0;
        return sum + (b.remainingQuantity - reserved);
      }, 0);
  },

  createStockOutApproval: ({ drugId, quantity, applicant, purpose, remark }) => {
    const { drugs, batches, routerRules, reservedQuantities } = get();
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) {
      return { success: false, message: '药品不存在' };
    }

    const availableBatches = batches.filter(
      b => b.drugId === drugId &&
        b.status !== 'expired' &&
        b.status !== 'locked' &&
        b.status !== 'used_up' &&
        b.remainingQuantity > (reservedQuantities[b.id] || 0)
    ).map(b => ({
      ...b,
      availableQuantity: b.remainingQuantity - (reservedQuantities[b.id] || 0)
    }));

    const fifoResult = calculateFifo(availableBatches, quantity);
    if (!fifoResult.success) {
      return { success: false, message: fifoResult.message || '库存不足' };
    }

    const amount = quantity * drug.price;

    const content: ApprovalContent = {
      drugId: drug.id,
      drugName: drug.name,
      drugCategory: drug.category,
      quantity,
      unit: drug.unit,
      amount,
      purpose,
      remark,
      batchList: fifoResult.allocations.map(a => ({
        batchId: a.batchId,
        batchNo: a.batchNo,
        quantity: a.quantity,
        unit: drug.unit,
        expiryDate: a.expiryDate
      }))
    };

    const matchedRule = matchRouterRule(
      routerRules.filter(r => r.enabled && r.approvalType === 'stock_out'),
      content
    );

    if (!matchedRule) {
      return { success: false, message: '未匹配到审批规则' };
    }

    const branches: ApprovalBranch[] = matchedRule.branches.map((template, index) => ({
      id: generateId('branch'),
      name: template.name,
      level: template.level,
      approver: template.approverList?.[0] || '',
      approverRole: template.approverRole,
      status: index === 0 ? 'current' : 'pending'
    }));

    const newOrder: ApprovalOrder = {
      id: generateId('app'),
      orderNo: generateOrderNo('CK'),
      approvalType: 'stock_out',
      title: `${drug.name} 出库申请`,
      applicant,
      applyTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: branches.length === 1 ? 'pending' : 'processing',
      currentLevel: 1,
      totalLevels: branches.length,
      branches,
      content,
      routerRuleId: matchedRule.id,
      routerRuleName: matchedRule.name
    };

    const newReserved = { ...reservedQuantities };
    fifoResult.allocations.forEach(a => {
      if (newReserved[a.batchId]) {
        newReserved[a.batchId] += a.quantity;
      } else {
        newReserved[a.batchId] = a.quantity;
      }
    });

    set(state => ({
      approvalOrders: [newOrder, ...state.approvalOrders],
      reservedQuantities: newReserved
    }));

    return { success: true, message: '申请提交成功', orderId: newOrder.id };
  },

  processApproval: ({ approvalId, action, level, remark, approver = '当前用户' }) => {
    const { approvalOrders, batches, reservedQuantities, drugs } = get();
    const order = approvalOrders.find(o => o.id === approvalId);
    if (!order) {
      return { success: false, message: '审批单不存在' };
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      return { success: false, message: '当前状态不可操作' };
    }

    const updatedBranches = order.branches.map(b => {
      if (b.level === level) {
        return {
          ...b,
          status: action === 'approve' ? 'approved' : 'rejected',
          approveTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          remark
        };
      }
      return b;
    });

    let newStatus = order.status;
    let newCurrentLevel = level;

    if (action === 'reject') {
      newStatus = 'rejected';

      const newReserved = { ...reservedQuantities };
      if (order.content.batchList) {
        order.content.batchList.forEach(item => {
          if (newReserved[item.batchId]) {
            newReserved[item.batchId] = Math.max(0, newReserved[item.batchId] - item.quantity);
            if (newReserved[item.batchId] === 0) {
              delete newReserved[item.batchId];
            }
          }
        });
      }

      set(state => ({
        reservedQuantities: newReserved
      }));
    } else {
      if (level >= order.totalLevels) {
        newStatus = 'approved';

        const newReserved = { ...reservedQuantities };
        const updatedBatchesList = [...batches];
        if (order.content.batchList) {
          order.content.batchList.forEach(item => {
            if (newReserved[item.batchId]) {
              newReserved[item.batchId] = Math.max(0, newReserved[item.batchId] - item.quantity);
              if (newReserved[item.batchId] === 0) {
                delete newReserved[item.batchId];
              }
            }
            const batchIndex = updatedBatchesList.findIndex(b => b.id === item.batchId);
            if (batchIndex !== -1) {
              const batch = updatedBatchesList[batchIndex];
              const newRemaining = batch.remainingQuantity - item.quantity;
              updatedBatchesList[batchIndex] = {
                ...batch,
                remainingQuantity: newRemaining,
                status: newRemaining <= 0 ? 'used_up' : batch.status
              };
            }
          });
        }

        set(state => ({
          batches: updatedBatchesList,
          reservedQuantities: newReserved
        }));

        if (order.content.drugId) {
          setTimeout(() => {
            get().refreshDrugStatus(order.content.drugId!);
            get().refreshExpiryWarnings();
          }, 0);
        }
      } else {
        newStatus = 'processing';
        newCurrentLevel = level + 1;

        for (let i = 0; i < updatedBranches.length; i++) {
          if (updatedBranches[i].level === newCurrentLevel) {
            updatedBranches[i] = { ...updatedBranches[i], status: 'current' };
            break;
          }
        }
      }
    }

    const updatedOrder: ApprovalOrder = {
      ...order,
      status: newStatus,
      currentLevel: newCurrentLevel,
      branches: updatedBranches
    };

    set(state => ({
      approvalOrders: state.approvalOrders.map(o => o.id === approvalId ? updatedOrder : o)
    }));

    return {
      success: true,
      message: action === 'approve' ? '审批通过' : '已驳回'
    };
  },

  updateRouterRule: (rule) => {
    set(state => ({
      routerRules: state.routerRules.map(r =>
        r.id === rule.id ? { ...rule, updateTime: new Date().toISOString().slice(0, 10) } : r
      )
    }));
  },

  addRouterRule: (rule) => {
    const newRule: RouterRule = {
      ...rule,
      id: generateId('rule'),
      createTime: new Date().toISOString().slice(0, 10),
      updateTime: new Date().toISOString().slice(0, 10)
    };
    set(state => ({
      routerRules: [newRule, ...state.routerRules]
    }));
  },

  toggleRouterRule: (ruleId, enabled) => {
    set(state => ({
      routerRules: state.routerRules.map(r =>
        r.id === ruleId ? { ...r, enabled, updateTime: new Date().toISOString().slice(0, 10) } : r
      )
    }));
  },

  deleteRouterRule: (ruleId) => {
    set(state => ({
      routerRules: state.routerRules.filter(r => r.id !== ruleId)
    }));
  },

  processQualificationReview: ({ reviewId, action, remark, reviewer = '当前用户' }) => {
    const { qualificationReviews, recipients } = get();
    const review = qualificationReviews.find(r => r.id === reviewId);
    if (!review) {
      return { success: false, message: '审核记录不存在' };
    }

    if (review.status !== 'pending') {
      return { success: false, message: '当前状态不可操作' };
    }

    const updatedReview: QualificationReview = {
      ...review,
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewer,
      reviewTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reviewRemark: remark
    };

    const updatedRecipients = recipients.map(r => {
      if (r.id === review.recipientId) {
        return {
          ...r,
          status: action === 'approve' ? 'qualified' : 'disqualified'
        };
      }
      return r;
    });

    set(state => ({
      qualificationReviews: state.qualificationReviews.map(r =>
        r.id === reviewId ? updatedReview : r
      ),
      recipients: updatedRecipients
    }));

    return {
      success: true,
      message: action === 'approve' ? '审核通过' : '已驳回'
    };
  },

  createDistribution: ({ recipientId, drugId, quantity, approvalId, distributor, pickUpMethod, pickUpPerson, pickUpPersonIdCard, remark }) => {
    const { recipients, drugs, batches, reservedQuantities, approvalOrders } = get();
    const recipient = recipients.find(r => r.id === recipientId);
    if (!recipient) {
      return { success: false, message: '受助人不存在' };
    }

    if (recipient.status !== 'qualified') {
      return { success: false, message: '受助人资格无效，无法发放' };
    }

    const drug = drugs.find(d => d.id === drugId);
    if (!drug) {
      return { success: false, message: '药品不存在' };
    }

    let approvalOrder: ApprovalOrder | undefined;
    if (approvalId) {
      approvalOrder = approvalOrders.find(o => o.id === approvalId);
      if (!approvalOrder) {
        return { success: false, message: '审批单不存在' };
      }
      if (approvalOrder.status !== 'approved') {
        return { success: false, message: '审批未通过，无法发放' };
      }
    }

    const availableBatches = batches.filter(
      b => b.drugId === drugId &&
        b.status !== 'expired' &&
        b.status !== 'locked' &&
        b.status !== 'used_up' &&
        b.remainingQuantity > 0
    );

    const fifoResult = calculateFifo(availableBatches, quantity);
    if (!fifoResult.success || !fifoResult.allocations.length) {
      return { success: false, message: '库存不足' };
    }

    const firstAllocation = fifoResult.allocations[0];
    const batch = batches.find(b => b.id === firstAllocation.batchId);
    if (!batch) {
      return { success: false, message: '批次不存在' };
    }

    const amount = quantity * drug.price;

    const newRecord: DistributionRecord = {
      id: generateId('dist'),
      recordNo: generateOrderNo('FF'),
      recipientId,
      recipientName: recipient.name,
      idCard: recipient.idCard,
      drugId,
      drugName: drug.name,
      spec: drug.spec,
      batchId: firstAllocation.batchId,
      batchNo: firstAllocation.batchNo,
      quantity,
      unit: drug.unit,
      amount,
      approvalId: approvalId || '',
      approvalNo: approvalOrder?.orderNo || '',
      distributor,
      distributeTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickUpMethod,
      pickUpPerson,
      pickUpPersonIdCard,
      status: 'distributed',
      remark
    };

    const updatedBatches = batches.map(b => {
      if (b.id === firstAllocation.batchId) {
        const newRemaining = b.remainingQuantity - quantity;
        return {
          ...b,
          remainingQuantity: newRemaining,
          status: newRemaining <= 0 ? 'used_up' : b.status
        };
      }
      return b;
    });

    set(state => ({
      distributionRecords: [newRecord, ...state.distributionRecords],
      batches: updatedBatches
    }));

    setTimeout(() => {
      get().refreshDrugStatus(drugId);
      get().refreshExpiryWarnings();
    }, 0);

    return {
      success: true,
      message: '发放登记成功',
      recordId: newRecord.id
    };
  },

  refreshExpiryWarnings: () => {
    const { batches } = get();
    const warnings = generateExpiryWarnings(batches);
    set({ expiryWarnings: warnings });
  },

  refreshDrugStatus: (drugId) => {
    const { batches, reservedQuantities } = get();
    const drugBatches = batches.filter(b => b.drugId === drugId);

    if (drugBatches.length === 0) return;

    let totalStock = 0;
    let hasExpired = false;
    let hasExpiringSoon = false;
    let hasLowStock = false;

    drugBatches.forEach(batch => {
      totalStock += batch.remainingQuantity - (reservedQuantities[batch.id] || 0);
      if (batch.status === 'expired') hasExpired = true;
      if (batch.status === 'expiring_soon') hasExpiringSoon = true;
    });

    if (totalStock < 50) hasLowStock = true;

    let newStatus: Drug['status'] = 'normal';
    if (hasExpired) newStatus = 'expired';
    else if (hasExpiringSoon) newStatus = 'expiring_soon';
    else if (hasLowStock) newStatus = 'low_stock';

    set(state => ({
      drugs: state.drugs.map(d =>
        d.id === drugId
          ? { ...d, totalStock, batchCount: drugBatches.length, status: newStatus }
          : d
      )
    }));
  },

  refreshAllDrugStatus: () => {
    const { drugs } = get();
    drugs.forEach(d => get().refreshDrugStatus(d.id));
  }
}));
