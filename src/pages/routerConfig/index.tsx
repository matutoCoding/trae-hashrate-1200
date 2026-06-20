import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import { APPROVAL_TYPE_MAP, CONDITION_FIELD_MAP, OPERATOR_MAP } from '../../types/approval';
import type { RouterRule, RouterCondition } from '../../types/approval';
import { formatConditionDisplay } from '../../utils/approvalRouter';

type TabType = 'stock_out' | 'distribution';

const RouterConfigPage: React.FC = () => {
  const [activeType, setActiveType] = useState<TabType>('stock_out');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<RouterRule> | null>(null);

  const routerRules = useAppStore(state => state.routerRules);
  const addRouterRule = useAppStore(state => state.addRouterRule);
  const updateRouterRule = useAppStore(state => state.updateRouterRule);
  const toggleRouterRule = useAppStore(state => state.toggleRouterRule);
  const deleteRouterRule = useAppStore(state => state.deleteRouterRule);

  const rules = useMemo(() => {
    return routerRules.filter(r => r.approvalType === activeType);
  }, [routerRules, activeType]);

  const handleToggle = (ruleId: string, enabled: boolean) => {
    toggleRouterRule(ruleId, !enabled);
    console.log('[RouterConfig] 切换规则:', ruleId, !enabled);
  };

  const handleEditRule = (rule: RouterRule) => {
    setEditingRule({ ...rule });
    setShowModal(true);
  };

  const handleAddRule = () => {
    const defaultConditions: RouterCondition[] = [{
      id: `cond_${Date.now()}_0`,
      field: 'amount',
      operator: '>',
      value: '0',
      label: '金额 > 0'
    }];
    const defaultBranches = [{
      id: `branch_${Date.now()}_0`,
      name: '一级审批',
      level: 1,
      approverRole: '仓库管理员',
      approverList: ['张管理员']
    }];
    setEditingRule({
      name: '',
      approvalType: activeType,
      conditions: defaultConditions,
      conditionLogic: 'AND',
      branches: defaultBranches,
      approvalLevels: 1,
      priority: rules.length + 1,
      enabled: true
    });
    setShowModal(true);
  };

  const updateBranches = (levels: number) => {
    if (!editingRule) return;
    const roleMap = [
      { name: '仓库管理员', role: '仓库管理员' },
      { name: '部门主管', role: '部门主管' },
      { name: '分管领导', role: '分管领导' }
    ];
    const branches = [];
    for (let i = 0; i < levels; i++) {
      const oldBranch = editingRule.branches?.[i];
      branches.push(oldBranch || {
        id: `branch_${Date.now()}_${i}`,
        name: `${['一', '二', '三'][i]}级审批`,
        level: i + 1,
        approverRole: roleMap[i].role,
        approverList: [roleMap[i].name]
      });
    }
    setEditingRule({ ...editingRule, branches });
  };

  const handleSaveRule = () => {
    if (!editingRule || !editingRule.name || !editingRule.conditions?.length) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const conditions = editingRule.conditions.map((c, i) => ({
      ...c,
      id: c.id || `cond_${Date.now()}_${i}`
    }));

    const branches = editingRule.branches?.length
      ? editingRule.branches.map((b, i) => ({
          ...b,
          id: b.id || `branch_${Date.now()}_${i}`,
          level: i + 1
        }))
      : [{ id: `branch_${Date.now()}_0`, name: '一级审批', level: 1, approverRole: '仓库管理员', approverList: ['张管理员'] }];

    const finalRule: Partial<RouterRule> = {
      ...editingRule,
      conditions,
      branches,
      conditionLogic: editingRule.conditionLogic || 'AND'
    };

    if (finalRule.id) {
      updateRouterRule(finalRule as RouterRule);
      Taro.showToast({ title: '更新成功', icon: 'success' });
    } else {
      addRouterRule(finalRule as Omit<RouterRule, 'id' | 'createTime' | 'updateTime'>);
      Taro.showToast({ title: '新增成功', icon: 'success' });
    }
    setShowModal(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定删除此路由规则？',
      success: (res) => {
        if (res.confirm) {
          deleteRouterRule(ruleId);
          Taro.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  };

  const addCondition = () => {
    if (editingRule) {
      const conditions = [...(editingRule.conditions || [])];
      if (conditions.length > 0) {
        conditions[conditions.length - 1].logicOp = conditions[conditions.length - 1].logicOp || 'AND';
      }
      conditions.push({ field: 'amount', operator: '>', value: '0', logicOp: 'AND' });
      setEditingRule({ ...editingRule, conditions });
    }
  };

  const updateCondition = (index: number, field: keyof RouterCondition, value: any) => {
    if (editingRule && editingRule.conditions) {
      const conditions = [...editingRule.conditions];
      conditions[index] = { ...conditions[index], [field]: value };
      setEditingRule({ ...editingRule, conditions });
    }
  };

  const removeCondition = (index: number) => {
    if (editingRule && editingRule.conditions && editingRule.conditions.length > 1) {
      const conditions = editingRule.conditions.filter((_, i) => i !== index);
      setEditingRule({ ...editingRule, conditions });
    }
  };

  const tabs = [
    { key: 'stock_out', label: '出库审批' },
    { key: 'distribution', label: '发放审批' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>审批路由配置</Text>
        <Text className={styles.headerDesc}>
          按条件动态选择审批分支，支持多条件组合配置
        </Text>
      </View>

      <View className={styles.content}>
        <View style={{
          display: 'flex',
          background: '#fff',
          borderRadius: '12rpx',
          padding: '6rpx',
          marginBottom: '24rpx',
          boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)'
        }}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '16rpx 0',
                borderRadius: '8rpx',
                fontSize: '28rpx',
                color: activeType === tab.key ? '#165dff' : '#4e5969',
                fontWeight: activeType === tab.key ? '500' : '400',
                background: activeType === tab.key ? '#e8f0ff' : 'transparent',
                transition: 'all 0.25s ease'
              }}
              onClick={() => setActiveType(tab.key as TabType)}
            >
              {tab.label}
            </View>
          ))}
        </View>

        <View className={styles.addBtn} onClick={handleAddRule}>
          <Text className={styles.addIcon}>+</Text>
          <Text>新增路由规则</Text>
        </View>

        <Text className={styles.sectionTitle}>
          规则列表 <Text style={{ fontSize: '24rpx', color: '#86909c', fontWeight: '400' }}>
            (共{rules.length}条，按优先级匹配)
          </Text>
        </Text>

        <ScrollView scrollY enhanced showScrollbar={false}>
          {rules.length > 0 ? (
            rules.map(rule => (
              <View
                key={rule.id}
                className={styles.ruleCard}
                onClick={() => handleEditRule(rule)}
              >
                <View className={styles.ruleHeader}>
                  <Text className={styles.ruleName}>{rule.name}</Text>
                  <Text className={styles.rulePriority}>优先级 {rule.priority}</Text>
                </View>

                <Text className={styles.ruleType}>
                  {APPROVAL_TYPE_MAP[rule.approvalType]}
                </Text>

                <View className={styles.conditionsSection}>
                  <Text className={styles.conditionsLabel}>
                    触发条件（{rule.conditionLogic === 'AND' ? '全部满足' : '满足任一'}）
                  </Text>
                  {rule.conditions.length > 0 ? (
                    <View className={styles.conditionTags}>
                      {rule.conditions.map(cond => (
                        <Text key={cond.id} className={styles.conditionTag}>
                          {formatConditionDisplay(cond)}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ fontSize: '24rpx', color: '#86909c' }}>无特殊条件（默认规则）</Text>
                  )}
                </View>

                <View className={styles.branchesSection}>
                  <Text className={styles.branchesLabel}>审批分支（{rule.branches.length}级）</Text>
                  <View className={styles.branchFlow}>
                    {rule.branches.map((branch, index) => (
                      <React.Fragment key={branch.id}>
                        <View className={styles.branchNode}>
                          <Text className={styles.branchName}>{branch.name}</Text>
                          <Text className={styles.branchRole}>{branch.approverRole}</Text>
                        </View>
                        {index < rule.branches.length - 1 && (
                          <Text className={styles.branchArrow}>→</Text>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>

                <View className={styles.ruleFooter}>
                  <Text className={styles.remark}>{rule.remark || '无备注'}</Text>
                  <View
                    className={classnames(styles.switch, rule.enabled && styles.active)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(rule.id, rule.enabled);
                    }}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyTip}>
              <Text className={styles.emptyIcon}>⚙️</Text>
              <Text className={styles.emptyText}>暂无路由规则</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {showModal && editingRule && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {editingRule.id ? '编辑规则' : '新增规则'}
              </Text>
              <Text className={styles.modalClose} onClick={() => setShowModal(false)}>×</Text>
            </View>

            <ScrollView scrollY style={{ maxHeight: '600rpx' }}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>规则名称</Text>
                <Input
                  className={styles.formInput}
                  placeholder="请输入规则名称"
                  value={editingRule.name || ''}
                  onInput={(e) => setEditingRule({ ...editingRule, name: e.detail.value })}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>审批级别</Text>
                <View className={styles.formOptions}>
                  {[1, 2, 3].map(level => (
                    <View
                      key={level}
                      className={classnames(styles.formOption, editingRule.approvalLevels === level && styles.formOptionActive)}
                      onClick={() => {
                        setEditingRule({ ...editingRule, approvalLevels: level });
                        updateBranches(level);
                      }}
                    >
                      <Text>{level}级审批</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <View className={styles.formLabelRow}>
                  <Text className={styles.formLabel}>触发条件</Text>
                  <Text className={styles.formAddBtn} onClick={addCondition}>+ 添加条件</Text>
                </View>

                {editingRule.conditions?.map((cond, index) => (
                  <View key={index} className={styles.conditionRow}>
                    {index > 0 && (
                      <View className={styles.conditionLogic}>
                        {['AND', 'OR'].map(logic => (
                          <Text
                            key={logic}
                            className={classnames(styles.logicBtn, cond.logicOp === logic && styles.logicBtnActive)}
                            onClick={() => updateCondition(index, 'logicOp', logic)}
                          >
                            {logic === 'AND' ? '且' : '或'}
                          </Text>
                        ))}
                      </View>
                    )}
                    <View className={styles.conditionFields}>
                      <View className={styles.conditionField}>
                        {Object.entries(CONDITION_FIELD_MAP).map(([key, label]) => (
                          <Text
                            key={key}
                            className={classnames(styles.fieldBtn, cond.field === key && styles.fieldBtnActive)}
                            onClick={() => updateCondition(index, 'field', key)}
                          >
                            {label}
                          </Text>
                        ))}
                      </View>
                      <View className={styles.conditionOperator}>
                        {Object.entries(OPERATOR_MAP).map(([key, label]) => (
                          <Text
                            key={key}
                            className={classnames(styles.operatorBtn, cond.operator === key && styles.operatorBtnActive)}
                            onClick={() => updateCondition(index, 'operator', key)}
                          >
                            {label}
                          </Text>
                        ))}
                      </View>
                      <Input
                        className={styles.conditionValue}
                        placeholder="值"
                        value={cond.value || ''}
                        onInput={(e) => updateCondition(index, 'value', e.detail.value)}
                      />
                      {editingRule.conditions && editingRule.conditions.length > 1 && (
                        <Text className={styles.conditionDelete} onClick={() => removeCondition(index)}>×</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>优先级</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  placeholder="数字越小优先级越高"
                  value={String(editingRule.priority || '')}
                  onInput={(e) => setEditingRule({ ...editingRule, priority: parseInt(e.detail.value) || 1 })}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>备注</Text>
                <Input
                  className={styles.formInput}
                  placeholder="选填"
                  value={editingRule.remark || ''}
                  onInput={(e) => setEditingRule({ ...editingRule, remark: e.detail.value })}
                />
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              {editingRule.id && (
                <View className={styles.deleteBtn} onClick={() => handleDeleteRule(editingRule.id!)}>
                  <Text style={{ color: '#f53f3f' }}>删除</Text>
                </View>
              )}
              <View className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.confirmBtn} onClick={handleSaveRule}>
                <Text style={{ color: '#fff' }}>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RouterConfigPage;
