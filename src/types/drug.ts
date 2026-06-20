// 药品类型
export interface Drug {
  id: string;
  name: string;
  genericName: string;
  spec: string;
  manufacturer: string;
  category: DrugCategory;
  unit: string;
  price: number;
  totalStock: number;
  batchCount: number;
  status: DrugStatus;
  createTime: string;
}

export type DrugCategory = 'antibiotic' | 'cardiovascular' | 'gastrointestinal' | 'respiratory' | 'antipyretic' | 'vitamin' | 'other';

export type DrugStatus = 'normal' | 'low_stock' | 'expiring_soon' | 'expired' | 'locked';

// 药品批次
export interface DrugBatch {
  id: string;
  drugId: string;
  drugName: string;
  batchNo: string;
  spec: string;
  quantity: number;
  remainingQuantity: number;
  expiryDate: string;
  productionDate: string;
  manufacturer: string;
  unit: string;
  price: number;
  status: BatchStatus;
  storageLocation: string;
  receiveTime: string;
  receivePerson: string;
  supplier: string;
  inspectionStatus: 'passed' | 'pending' | 'failed';
  inspectionRemark?: string;
}

export type BatchStatus = 'normal' | 'expiring_soon' | 'expired' | 'locked' | 'used_up';

// 入库记录
export interface StockInRecord {
  id: string;
  drugId: string;
  drugName: string;
  batchNo: string;
  spec: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  productionDate: string;
  manufacturer: string;
  supplier: string;
  receiveTime: string;
  receivePerson: string;
  inspectionStatus: 'passed' | 'pending' | 'failed';
  inspectionRemark?: string;
  remark?: string;
}

// 临期预警
export interface ExpiryWarning {
  id: string;
  drugId: string;
  drugName: string;
  batchId: string;
  batchNo: string;
  spec: string;
  remainingQuantity: number;
  unit: string;
  expiryDate: string;
  daysRemaining: number;
  warningLevel: 'severe' | 'warning' | 'reminder';
}

// 药品分类映射
export const DRUG_CATEGORY_MAP: Record<DrugCategory, string> = {
  antibiotic: '抗生素',
  cardiovascular: '心血管',
  gastrointestinal: '消化系统',
  respiratory: '呼吸系统',
  antipyretic: '解热镇痛',
  vitamin: '维生素',
  other: '其他'
};

// 药品状态映射
export const DRUG_STATUS_MAP: Record<DrugStatus, string> = {
  normal: '正常',
  low_stock: '库存不足',
  expiring_soon: '临期预警',
  expired: '已过期',
  locked: '已锁定'
};

// 批次状态映射
export const BATCH_STATUS_MAP: Record<BatchStatus, string> = {
  normal: '正常',
  expiring_soon: '临期',
  expired: '过期',
  locked: '锁定',
  used_up: '已用完'
};
