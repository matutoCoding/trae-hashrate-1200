// 审批路由引擎 - 动态条件路由
import type {
  RouterRule,
  RouterCondition,
  ApprovalContent,
  ApprovalBranch,
  ApprovalBranchTemplate
} from '../types/approval';

export interface RouterMatchResult {
  matched: boolean;
  rule?: RouterRule;
  branches: ApprovalBranch[];
  reason?: string;
}

export function evaluateCondition(condition: RouterCondition, content: ApprovalContent): boolean {
  const { field, operator, value } = condition;

  let actualValue: any;

  switch (field) {
    case 'drug_category':
      actualValue = content.drugCategory;
      break;
    case 'amount':
      actualValue = content.amount || 0;
      break;
    case 'drug_type':
      actualValue = content.drugCategory;
      break;
    case 'quantity':
      actualValue = content.quantity || 0;
      break;
    default:
      return false;
  }

  switch (operator) {
    case 'eq':
      return actualValue === value;
    case 'gt':
      return Number(actualValue) > Number(value);
    case 'lt':
      return Number(actualValue) < Number(value);
    case 'gte':
      return Number(actualValue) >= Number(value);
    case 'lte':
      return Number(actualValue) <= Number(value);
    case 'in':
      if (Array.isArray(value)) {
        return value.includes(actualValue);
      }
      return String(actualValue).includes(String(value));
    case 'not_in':
      if (Array.isArray(value)) {
        return !value.includes(actualValue);
      }
      return !String(actualValue).includes(String(value));
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const num = Number(actualValue);
        return num >= Number(value[0]) && num <= Number(value[1]);
      }
      return false;
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: RouterCondition[],
  logic: 'AND' | 'OR',
  content: ApprovalContent
): boolean {
  if (conditions.length === 0) {
    return true;
  }

  if (logic === 'AND') {
    return conditions.every(condition => evaluateCondition(condition, content));
  } else {
    return conditions.some(condition => evaluateCondition(condition, content));
  }
}

export function matchRouterRule(
  rules: RouterRule[],
  content: ApprovalContent
): RouterMatchResult {
  const enabledRules = rules
    .filter(rule => rule.enabled)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of enabledRules) {
    const matched = evaluateConditions(rule.conditions, rule.conditionLogic, content);

    if (matched) {
      const branches = createBranchesFromTemplate(rule.branches);
      return {
        matched: true,
        rule,
        branches
      };
    }
  }

  return {
    matched: false,
    branches: []
  };
}

export function createBranchesFromTemplate(
  templates: ApprovalBranchTemplate[]
): ApprovalBranch[] {
  return templates
    .sort((a, b) => a.level - b.level)
    .map(template => ({
      id: template.id,
      name: template.name,
      level: template.level,
      approver: '',
      approverRole: template.approverRole,
      status: template.level === 1 ? 'current' : 'pending' as const
    }));
}

export function getCurrentBranch(branches: ApprovalBranch[]): ApprovalBranch | undefined {
  return branches.find(b => b.status === 'current');
}

export function getNextBranch(branches: ApprovalBranch[]): ApprovalBranch | undefined {
  const currentLevel = getCurrentBranchLevel(branches);
  return branches.find(b => b.level === currentLevel + 1);
}

export function getCurrentBranchLevel(branches: ApprovalBranch[]): number {
  const current = branches.find(b => b.status === 'current');
  return current ? current.level : 0;
}

export function getTotalLevels(branches: ApprovalBranch[]): number {
  return branches.length;
}

export function isApprovalComplete(branches: ApprovalBranch[]): boolean {
  return branches.every(b => b.status === 'approved');
}

export function isApprovalRejected(branches: ApprovalBranch[]): boolean {
  return branches.some(b => b.status === 'rejected');
}

export function getApprovalProgress(branches: ApprovalBranch[]): {
  currentLevel: number;
  totalLevels: number;
  percentage: number;
} {
  const totalLevels = branches.length;
  const approvedCount = branches.filter(b => b.status === 'approved').length;
  const current = getCurrentBranch(branches);
  const currentLevel = current ? current.level : totalLevels;

  const percentage = totalLevels > 0 ? (approvedCount / totalLevels) * 100 : 0;

  return {
    currentLevel,
    totalLevels,
    percentage: Math.round(percentage)
  };
}

export function getApprovalStatusText(branches: ApprovalBranch[]): string {
  if (isApprovalRejected(branches)) {
    return '已驳回';
  }
  if (isApprovalComplete(branches)) {
    return '已通过';
  }
  const current = getCurrentBranch(branches);
  if (current) {
    return `第${current.level}级审批中`;
  }
  return '待审批';
}

export function formatConditionDisplay(condition: RouterCondition): string {
  const fieldMap: Record<string, string> = {
    drug_category: '药品分类',
    amount: '金额(元)',
    drug_type: '药品类型',
    quantity: '数量'
  };

  const operatorMap: Record<string, string> = {
    eq: '等于',
    gt: '大于',
    lt: '小于',
    gte: '大于等于',
    lte: '小于等于',
    in: '包含于',
    not_in: '不包含',
    between: '在...之间'
  };

  const fieldName = fieldMap[condition.field] || condition.field;
  const opName = operatorMap[condition.operator] || condition.operator;

  let valueText: string;
  if (Array.isArray(condition.value)) {
    valueText = condition.value.join(' ~ ');
  } else {
    valueText = String(condition.value);
  }

  return `${fieldName} ${opName} ${valueText}`;
}
