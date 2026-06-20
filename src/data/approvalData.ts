import type { ApprovalOrder, RouterRule, RouterCondition, ApprovalBranchTemplate } from '../types/approval';

const baseConditions: RouterCondition[] = [
  {
    id: 'cond001',
    field: 'amount',
    operator: 'gt',
    value: 1000,
    label: '金额大于1000元'
  },
  {
    id: 'cond002',
    field: 'amount',
    operator: 'between',
    value: [500, 1000],
    label: '金额在500-1000元之间'
  },
  {
    id: 'cond003',
    field: 'drug_category',
    operator: 'in',
    value: ['antibiotic', 'cardiovascular'],
    label: '药品分类为抗生素或心血管'
  },
  {
    id: 'cond004',
    field: 'quantity',
    operator: 'gt',
    value: 50,
    label: '数量大于50'
  }
];

const branchesLevel1: ApprovalBranchTemplate[] = [
  { id: 'b1_1', name: '一级审批', level: 1, approverRole: '药房管理员', approverList: ['张药师', '李药师'] }
];

const branchesLevel2: ApprovalBranchTemplate[] = [
  { id: 'b2_1', name: '一级审批', level: 1, approverRole: '药房管理员', approverList: ['张药师', '李药师'] },
  { id: 'b2_2', name: '二级审批', level: 2, approverRole: '科室主任', approverList: ['王主任', '刘主任'] }
];

const branchesLevel3: ApprovalBranchTemplate[] = [
  { id: 'b3_1', name: '一级审批', level: 1, approverRole: '药房管理员', approverList: ['张药师', '李药师'] },
  { id: 'b3_2', name: '二级审批', level: 2, approverRole: '科室主任', approverList: ['王主任', '刘主任'] },
  { id: 'b3_3', name: '三级审批', level: 3, approverRole: '院长', approverList: ['赵院长'] }
];

export const mockRouterRules: RouterRule[] = [
  {
    id: 'rule001',
    name: '小额出库审批（单级）',
    approvalType: 'stock_out',
    conditions: [baseConditions[1]],
    conditionLogic: 'AND',
    branches: branchesLevel2,
    priority: 20,
    enabled: true,
    createTime: '2025-01-01',
    updateTime: '2025-03-15',
    remark: '金额在500-1000元之间的药品出库，需二级审批'
  },
  {
    id: 'rule002',
    name: '大额出库审批（三级）',
    approvalType: 'stock_out',
    conditions: [baseConditions[0]],
    conditionLogic: 'AND',
    branches: branchesLevel3,
    priority: 30,
    enabled: true,
    createTime: '2025-01-01',
    updateTime: '2025-02-10',
    remark: '金额大于1000元的药品出库，需三级审批'
  },
  {
    id: 'rule003',
    name: '特殊药品审批',
    approvalType: 'stock_out',
    conditions: [baseConditions[2]],
    conditionLogic: 'AND',
    branches: branchesLevel2,
    priority: 25,
    enabled: true,
    createTime: '2025-01-15',
    updateTime: '2025-04-01',
    remark: '抗生素或心血管类药品出库，需二级审批'
  },
  {
    id: 'rule004',
    name: '大数量出库审批',
    approvalType: 'stock_out',
    conditions: [baseConditions[3]],
    conditionLogic: 'AND',
    branches: branchesLevel2,
    priority: 15,
    enabled: true,
    createTime: '2025-02-01',
    updateTime: '2025-03-20',
    remark: '出库数量大于50的药品，需二级审批'
  },
  {
    id: 'rule005',
    name: '默认出库审批（单级）',
    approvalType: 'stock_out',
    conditions: [],
    conditionLogic: 'AND',
    branches: branchesLevel1,
    priority: 10,
    enabled: true,
    createTime: '2025-01-01',
    updateTime: '2025-01-15',
    remark: '默认出库审批规则，一级审批'
  },
  {
    id: 'rule006',
    name: '发放审批规则',
    approvalType: 'distribution',
    conditions: [],
    conditionLogic: 'AND',
    branches: branchesLevel2,
    priority: 10,
    enabled: true,
    createTime: '2025-01-01',
    updateTime: '2025-02-28',
    remark: '药品发放审批，二级审批'
  }
];

export const mockApprovalOrders: ApprovalOrder[] = [
  {
    id: 'ap001',
    orderNo: 'CK202506001',
    approvalType: 'stock_out',
    title: '阿莫西林胶囊出库申请',
    applicant: '张药师',
    applyTime: '2026-06-15 09:30:00',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 1,
    routerRuleId: 'rule005',
    routerRuleName: '默认出库审批（单级）',
    branches: [
      { id: 'b1', name: '一级审批', level: 1, approver: '', approverRole: '药房管理员', status: 'current' }
    ],
    content: {
      drugId: 'drug001',
      drugName: '阿莫西林胶囊',
      drugCategory: 'antibiotic',
      quantity: 10,
      unit: '盒',
      amount: 158.0,
      purpose: '社区义诊活动发放',
      remark: '用于周六社区健康义诊活动'
    }
  },
  {
    id: 'ap002',
    orderNo: 'CK202506002',
    approvalType: 'stock_out',
    title: '硝苯地平缓释片出库申请',
    applicant: '李药师',
    applyTime: '2026-06-14 14:20:00',
    status: 'processing',
    currentLevel: 2,
    totalLevels: 3,
    routerRuleId: 'rule002',
    routerRuleName: '大额出库审批（三级）',
    branches: [
      { id: 'b1', name: '一级审批', level: 1, approver: '张药师', approverRole: '药房管理员', status: 'approved', approveTime: '2026-06-14 16:00:00', remark: '同意，库存充足' },
      { id: 'b2', name: '二级审批', level: 2, approver: '', approverRole: '科室主任', status: 'current' },
      { id: 'b3', name: '三级审批', level: 3, approver: '', approverRole: '院长', status: 'pending' }
    ],
    content: {
      drugId: 'drug002',
      drugName: '硝苯地平缓释片',
      drugCategory: 'cardiovascular',
      quantity: 50,
      unit: '瓶',
      amount: 1625.0,
      purpose: '老年关爱项目',
      remark: '夕阳红老年关爱项目，预计发放给50位老人'
    }
  },
  {
    id: 'ap003',
    orderNo: 'CK202506003',
    approvalType: 'stock_out',
    title: '维生素C片出库申请',
    applicant: '王药师',
    applyTime: '2026-06-13 10:15:00',
    status: 'approved',
    currentLevel: 2,
    totalLevels: 2,
    routerRuleId: 'rule004',
    routerRuleName: '大数量出库审批',
    branches: [
      { id: 'b1', name: '一级审批', level: 1, approver: '李药师', approverRole: '药房管理员', status: 'approved', approveTime: '2026-06-13 11:00:00' },
      { id: 'b2', name: '二级审批', level: 2, approver: '王主任', approverRole: '科室主任', status: 'approved', approveTime: '2026-06-13 15:30:00', remark: '同意，请按计划发放' }
    ],
    content: {
      drugId: 'drug006',
      drugName: '维生素C片',
      drugCategory: 'vitamin',
      quantity: 100,
      unit: '瓶',
      amount: 850.0,
      purpose: '儿童营养补充',
      remark: '留守儿童营养补充计划'
    }
  },
  {
    id: 'ap004',
    orderNo: 'CK202506004',
    approvalType: 'stock_out',
    title: '奥美拉唑肠溶胶囊出库申请',
    applicant: '张药师',
    applyTime: '2026-06-12 09:00:00',
    status: 'rejected',
    currentLevel: 1,
    totalLevels: 2,
    routerRuleId: 'rule003',
    routerRuleName: '特殊药品审批',
    branches: [
      { id: 'b1', name: '一级审批', level: 1, approver: '李药师', approverRole: '药房管理员', status: 'rejected', approveTime: '2026-06-12 10:30:00', remark: '库存不足，请减少申请数量' },
      { id: 'b2', name: '二级审批', level: 2, approver: '', approverRole: '科室主任', status: 'pending' }
    ],
    content: {
      drugId: 'drug003',
      drugName: '奥美拉唑肠溶胶囊',
      drugCategory: 'gastrointestinal',
      quantity: 80,
      unit: '盒',
      amount: 3840.0,
      purpose: '胃病患者救助',
      remark: '用于贫困胃病患者救助项目'
    }
  },
  {
    id: 'ap005',
    orderNo: 'FF202506001',
    approvalType: 'distribution',
    title: '阿莫西林胶囊发放申请',
    applicant: '王药师',
    applyTime: '2026-06-15 11:00:00',
    status: 'processing',
    currentLevel: 1,
    totalLevels: 2,
    routerRuleId: 'rule006',
    routerRuleName: '发放审批规则',
    branches: [
      { id: 'b1', name: '一级审批', level: 1, approver: '', approverRole: '药房管理员', status: 'current' },
      { id: 'b2', name: '二级审批', level: 2, approver: '', approverRole: '科室主任', status: 'pending' }
    ],
    content: {
      drugId: 'drug001',
      drugName: '阿莫西林胶囊',
      drugCategory: 'antibiotic',
      quantity: 5,
      unit: '盒',
      amount: 79.0,
      recipient: '张三',
      purpose: '受助人发放'
    }
  },
  {
    id: 'ap006',
    orderNo: 'CK202506005',
    approvalType: 'stock_out',
    title: '蒙脱石散出库申请',
    applicant: '李药师',
    applyTime: '2026-06-11 14:30:00',
    status: 'approved',
    currentLevel: 2,
    totalLevels: 2,
    routerRuleId: 'rule001',
    routerRuleName: '小额出库审批（单级）',
    branches: [
      { id: 'b1', name: '一级审批', level: 1, approver: '张药师', approverRole: '药房管理员', status: 'approved', approveTime: '2026-06-11 15:00:00' },
      { id: 'b2', name: '二级审批', level: 2, approver: '王主任', approverRole: '科室主任', status: 'approved', approveTime: '2026-06-11 17:00:00' }
    ],
    content: {
      drugId: 'drug009',
      drugName: '蒙脱石散',
      drugCategory: 'gastrointestinal',
      quantity: 30,
      unit: '盒',
      amount: 660.0,
      purpose: '夏季腹泻预防',
      remark: '社区夏季肠道健康宣传活动'
    }
  }
];

export function getRouterRulesByType(type: string): RouterRule[] {
  return mockRouterRules.filter(rule => rule.approvalType === type && rule.enabled);
}

export function getApprovalById(id: string): ApprovalOrder | undefined {
  return mockApprovalOrders.find(order => order.id === id);
}

export function getPendingApprovals(): ApprovalOrder[] {
  return mockApprovalOrders.filter(order => order.status === 'pending' || order.status === 'processing');
}

export function getApprovedApprovals(): ApprovalOrder[] {
  return mockApprovalOrders.filter(order => order.status === 'approved');
}

export function getMyApprovals(approver: string): ApprovalOrder[] {
  return mockApprovalOrders.filter(order =>
    order.branches.some(b => b.approver === approver || (b.status === 'current' && b.approverRole === '药房管理员'))
  );
}
