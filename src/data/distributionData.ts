import type { Recipient, DistributionRecord, QualificationReview } from '../types/distribution';

export const mockRecipients: Recipient[] = [
  {
    id: 'r001',
    name: '张三',
    idCard: '110101195501011234',
    phone: '13800138001',
    gender: 'male',
    age: 70,
    address: '北京市朝阳区和平街12号楼3单元201室',
    qualificationType: 'low_income',
    qualificationNo: 'DB2025001',
    qualificationExpiry: '2026-12-31',
    status: 'qualified',
    registerTime: '2025-01-15 09:00:00',
    remark: '低保户，患有高血压'
  },
  {
    id: 'r002',
    name: '李四',
    idCard: '110101194805123456',
    phone: '13800138002',
    gender: 'female',
    age: 77,
    address: '北京市海淀区中关村大街28号院1号楼101室',
    qualificationType: 'elderly',
    qualificationNo: 'GL2025002',
    qualificationExpiry: '2026-06-30',
    status: 'qualified',
    registerTime: '2025-02-20 10:30:00',
    remark: '孤寡老人，糖尿病患者'
  },
  {
    id: 'r003',
    name: '王五',
    idCard: '110101196003055678',
    phone: '13800138003',
    gender: 'male',
    age: 65,
    address: '北京市西城区西直门内大街10号',
    qualificationType: 'disabled',
    qualificationNo: 'CJ2025003',
    qualificationExpiry: '2027-01-15',
    status: 'qualified',
    registerTime: '2025-03-10 14:00:00',
    remark: '二级残疾，长期服药'
  },
  {
    id: 'r004',
    name: '赵六',
    idCard: '110101197208157890',
    phone: '13800138004',
    gender: 'male',
    age: 53,
    address: '北京市丰台区南三环西路16号',
    qualificationType: 'medical_assistance',
    qualificationNo: 'YL2025004',
    qualificationExpiry: '2026-09-30',
    status: 'pending',
    registerTime: '2026-06-10 11:20:00',
    remark: '大病医疗救助申请中'
  },
  {
    id: 'r005',
    name: '孙七',
    idCard: '110101195211209012',
    phone: '13800138005',
    gender: 'female',
    age: 73,
    address: '北京市东城区东直门内大街8号',
    qualificationType: 'low_income',
    qualificationNo: 'DB2025005',
    qualificationExpiry: '2025-12-31',
    status: 'expired',
    registerTime: '2024-12-01 09:30:00',
    remark: '低保资格已过期，需重新审核'
  },
  {
    id: 'r006',
    name: '周八',
    idCard: '110101196504181122',
    phone: '13800138006',
    gender: 'male',
    age: 60,
    address: '北京市石景山古城大街5号',
    qualificationType: 'disabled',
    qualificationNo: 'CJ2025006',
    qualificationExpiry: '2026-08-15',
    status: 'disqualified',
    registerTime: '2025-05-20 15:00:00',
    remark: '经查不符合残疾救助标准'
  }
];

export const mockDistributionRecords: DistributionRecord[] = [
  {
    id: 'd001',
    recordNo: 'FF202606001',
    recipientId: 'r001',
    recipientName: '张三',
    idCard: '110101195501011234',
    drugId: 'drug001',
    drugName: '阿莫西林胶囊',
    spec: '0.25g*24粒/盒',
    batchId: 'batch001',
    batchNo: '20250115',
    quantity: 2,
    unit: '盒',
    amount: 31.6,
    approvalId: 'ap001',
    approvalNo: 'CK202506001',
    distributor: '张药师',
    distributeTime: '2026-06-15 10:30:00',
    pickUpMethod: 'self',
    status: 'distributed',
    remark: '本人签字领取'
  },
  {
    id: 'd002',
    recordNo: 'FF202606002',
    recipientId: 'r002',
    recipientName: '李四',
    idCard: '110101194805123456',
    drugId: 'drug002',
    drugName: '硝苯地平缓释片',
    spec: '10mg*30片/瓶',
    batchId: 'batch005',
    batchNo: '20250210',
    quantity: 1,
    unit: '瓶',
    amount: 32.5,
    approvalId: 'ap002',
    approvalNo: 'CK202506002',
    distributor: '李药师',
    distributeTime: '2026-06-14 15:00:00',
    pickUpMethod: 'family',
    pickUpPerson: '李小明',
    pickUpPersonIdCard: '110101198001011234',
    status: 'distributed',
    remark: '儿子代领，已核验身份证'
  },
  {
    id: 'd003',
    recordNo: 'FF202606003',
    recipientId: 'r003',
    recipientName: '王五',
    idCard: '110101196003055678',
    drugId: 'drug003',
    drugName: '奥美拉唑肠溶胶囊',
    spec: '20mg*14粒/盒',
    batchId: 'batch006',
    batchNo: '20250105',
    quantity: 3,
    unit: '盒',
    amount: 144.0,
    approvalId: 'ap003',
    approvalNo: 'CK202506003',
    distributor: '王药师',
    distributeTime: '2026-06-13 14:00:00',
    pickUpMethod: 'delivery',
    status: 'distributed',
    remark: '配送上门，志愿者送达'
  },
  {
    id: 'd004',
    recordNo: 'FF202606004',
    recipientId: 'r001',
    recipientName: '张三',
    idCard: '110101195501011234',
    drugId: 'drug006',
    drugName: '维生素C片',
    spec: '100mg*100片/瓶',
    batchId: 'batch009',
    batchNo: '20250301',
    quantity: 1,
    unit: '瓶',
    amount: 8.5,
    approvalId: 'ap005',
    approvalNo: 'FF202506001',
    distributor: '张药师',
    distributeTime: '2026-06-12 09:30:00',
    pickUpMethod: 'self',
    status: 'distributed'
  },
  {
    id: 'd005',
    recordNo: 'FF202606005',
    recipientId: 'r002',
    recipientName: '李四',
    idCard: '110101194805123456',
    drugId: 'drug009',
    drugName: '蒙脱石散',
    spec: '3g*10袋/盒',
    batchId: 'batch014',
    batchNo: '20250315',
    quantity: 2,
    unit: '盒',
    amount: 44.0,
    approvalId: 'ap006',
    approvalNo: 'CK202506005',
    distributor: '李药师',
    distributeTime: '2026-06-11 16:00:00',
    pickUpMethod: 'delivery',
    status: 'distributed',
    remark: '夏季肠道健康预防用药'
  },
  {
    id: 'd006',
    recordNo: 'FF202606006',
    recipientId: 'r003',
    recipientName: '王五',
    idCard: '110101196003055678',
    drugId: 'drug007',
    drugName: '头孢克肟分散片',
    spec: '0.1g*6片/盒',
    batchId: 'batch011',
    batchNo: '20250220',
    quantity: 1,
    unit: '盒',
    amount: 28.0,
    approvalId: 'ap004',
    approvalNo: 'CK202506004',
    distributor: '',
    distributeTime: '',
    pickUpMethod: 'self',
    status: 'pending',
    remark: '审批通过，待领取'
  }
];

export const mockQualificationReviews: QualificationReview[] = [
  {
    id: 'qr001',
    recipientId: 'r004',
    recipientName: '赵六',
    idCard: '110101197208157890',
    qualificationType: 'medical_assistance',
    qualificationNo: 'YL2025004',
    applyTime: '2026-06-10 11:20:00',
    status: 'pending',
    materials: ['身份证复印件', '低保证明', '医院诊断证明', '病历资料']
  },
  {
    id: 'qr002',
    recipientId: 'r005',
    recipientName: '孙七',
    idCard: '110101195211209012',
    qualificationType: 'low_income',
    qualificationNo: 'DB2026007',
    applyTime: '2026-06-08 09:00:00',
    reviewer: '王主任',
    reviewTime: '2026-06-09 15:30:00',
    status: 'approved',
    reviewRemark: '材料齐全，符合低保救助条件',
    materials: ['身份证复印件', '低保证', '收入证明']
  },
  {
    id: 'qr003',
    recipientId: 'r006',
    recipientName: '周八',
    idCard: '110101196504181122',
    qualificationType: 'disabled',
    qualificationNo: 'CJ2025006',
    applyTime: '2026-05-20 14:00:00',
    reviewer: '李科长',
    reviewTime: '2026-05-25 10:00:00',
    status: 'rejected',
    reviewRemark: '残疾等级未达到救助标准',
    materials: ['身份证复印件', '残疾证', '医院诊断证明']
  }
];

export function getRecipientById(id: string): Recipient | undefined {
  return mockRecipients.find(r => r.id === id);
}

export function getDistributionByRecipient(recipientId: string): DistributionRecord[] {
  return mockDistributionRecords.filter(r => r.recipientId === recipientId)
    .sort((a, b) => new Date(b.distributeTime).getTime() - new Date(a.distributeTime).getTime());
}

export function getPendingQualificationReviews(): QualificationReview[] {
  return mockQualificationReviews.filter(r => r.status === 'pending');
}

export function getQualificationReviewById(id: string): QualificationReview | undefined {
  return mockQualificationReviews.find(r => r.id === id);
}

export function getDistributionById(id: string): DistributionRecord | undefined {
  return mockDistributionRecords.find(r => r.id === id);
}
