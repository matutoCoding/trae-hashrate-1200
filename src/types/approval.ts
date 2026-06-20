// 审批单类型
export type ApprovalType = 'stock_out' | 'distribution' | 'drug_return' | 'stock_transfer';

// 审批状态
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'processing';

// 审批路由条件类型
export type RouterConditionType = 'drug_category' | 'amount' | 'drug_type' | 'quantity';

// 审批分支
export interface ApprovalBranch {
  id: string;
  name: string;
  level: number;
  approver: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'current';
  approveTime?: string;
  remark?: string;
}

// 审批路由条件
export interface RouterCondition {
  id: string;
  field: RouterConditionType;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'between';
  value: string | number | string[] | number[];
  label: string;
}

// 审批路由规则
export interface RouterRule {
  id: string;
  name: string;
  approvalType: ApprovalType;
  conditions: RouterCondition[];
  conditionLogic: 'AND' | 'OR';
  branches: ApprovalBranchTemplate[];
  priority: number;
  enabled: boolean;
  createTime: string;
  updateTime: string;
  remark?: string;
}

// 审批分支模板
export interface ApprovalBranchTemplate {
  id: string;
  name: string;
  level: number;
  approverRole: string;
  approverList?: string[];
}

// 审批单
export interface ApprovalOrder {
  id: string;
  orderNo: string;
  approvalType: ApprovalType;
  title: string;
  applicant: string;
  applyTime: string;
  status: ApprovalStatus;
  currentLevel: number;
  totalLevels: number;
  branches: ApprovalBranch[];
  content: ApprovalContent;
  routerRuleId: string;
  routerRuleName: string;
}

// 审批内容（根据类型不同有不同字段）
export interface ApprovalContent {
  drugId?: string;
  drugName?: string;
  drugCategory?: string;
  quantity?: number;
  unit?: string;
  amount?: number;
  batchList?: ApprovalBatchItem[];
  recipient?: string;
  purpose?: string;
  remark?: string;
}

// 审批批次项
export interface ApprovalBatchItem {
  batchId: string;
  batchNo: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}

// 审批操作记录
export interface ApprovalRecord {
  id: string;
  approvalId: string;
  level: number;
  approver: string;
  action: 'approved' | 'rejected' | 'transferred';
  time: string;
  remark?: string;
}

// 审批类型映射
export const APPROVAL_TYPE_MAP: Record<ApprovalType, string> = {
  stock_out: '药品出库',
  distribution: '药品发放',
  drug_return: '药品退回',
  stock_transfer: '库存调拨'
};

// 审批状态映射
export const APPROVAL_STATUS_MAP: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  processing: '审批中'
};

// 条件字段映射
export const CONDITION_FIELD_MAP: Record<RouterConditionType, string> = {
  drug_category: '药品分类',
  amount: '金额',
  drug_type: '药品类型',
  quantity: '数量'
};

// 操作符映射
export const OPERATOR_MAP: Record<string, string> = {
  eq: '等于',
  gt: '大于',
  lt: '小于',
  gte: '大于等于',
  lte: '小于等于',
  in: '包含于',
  not_in: '不包含',
  between: '在...之间'
};
