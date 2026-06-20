// 受助人
export interface Recipient {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  gender: 'male' | 'female';
  age: number;
  address: string;
  qualificationType: QualificationType;
  qualificationNo: string;
  qualificationExpiry: string;
  status: RecipientStatus;
  registerTime: string;
  remark?: string;
}

export type QualificationType = 'low_income' | 'disabled' | 'elderly' | 'medical_assistance' | 'other';

export type RecipientStatus = 'qualified' | 'pending' | 'disqualified' | 'expired';

// 受助资格审核记录
export interface QualificationReview {
  id: string;
  recipientId: string;
  recipientName: string;
  idCard: string;
  qualificationType: QualificationType;
  qualificationNo: string;
  applyTime: string;
  reviewer?: string;
  reviewTime?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewRemark?: string;
  materials: string[];
}

// 发放登记
export interface DistributionRecord {
  id: string;
  recordNo: string;
  recipientId: string;
  recipientName: string;
  idCard: string;
  drugId: string;
  drugName: string;
  spec: string;
  batchId: string;
  batchNo: string;
  quantity: number;
  unit: string;
  amount: number;
  approvalId: string;
  approvalNo: string;
  distributor: string;
  distributeTime: string;
  pickUpMethod: PickUpMethod;
  pickUpPerson?: string;
  pickUpPersonIdCard?: string;
  status: DistributionStatus;
  remark?: string;
}

export type PickUpMethod = 'self' | 'family' | 'delivery';

export type DistributionStatus = 'pending' | 'distributed' | 'returned' | 'cancelled';

// 资格类型映射
export const QUALIFICATION_TYPE_MAP: Record<QualificationType, string> = {
  low_income: '低保户',
  disabled: '残疾人',
  elderly: '孤寡老人',
  medical_assistance: '医疗救助',
  other: '其他'
};

// 受助人状态映射
export const RECIPIENT_STATUS_MAP: Record<RecipientStatus, string> = {
  qualified: '资格有效',
  pending: '待审核',
  disqualified: '资格取消',
  expired: '资格过期'
};

// 发放状态映射
export const DISTRIBUTION_STATUS_MAP: Record<DistributionStatus, string> = {
  pending: '待领取',
  distributed: '已发放',
  returned: '已退回',
  cancelled: '已取消'
};

// 领取方式映射
export const PICKUP_METHOD_MAP: Record<PickUpMethod, string> = {
  self: '本人领取',
  family: '家属代领',
  delivery: '配送上门'
};

// 审核状态映射
export const REVIEW_STATUS_MAP: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回'
};
