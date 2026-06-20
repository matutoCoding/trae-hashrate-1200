import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockRouterRules, getRouterRulesByType } from '../../data/approvalData';
import { APPROVAL_TYPE_MAP, CONDITION_FIELD_MAP, OPERATOR_MAP } from '../../types/approval';
import type { RouterRule } from '../../types/approval';
import { formatConditionDisplay } from '../../utils/approvalRouter';

type TabType = 'stock_out' | 'distribution';

const RouterConfigPage: React.FC = () => {
  const [activeType, setActiveType] = useState<TabType>('stock_out');
  const [rules, setRules] = useState<RouterRule[]>([]);

  React.useEffect(() => {
    const data = getRouterRulesByType(activeType);
    setRules(data);
    console.log('[RouterConfig] 路由规则:', activeType, data.length);
  }, [activeType]);

  const handleToggle = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleEditRule = (ruleId: string) => {
    Taro.showToast({ title: '编辑规则', icon: 'none' });
    console.log('[RouterConfig] 编辑规则:', ruleId);
  };

  const handleAddRule = () => {
    Taro.showToast({ title: '新增规则', icon: 'none' });
    console.log('[RouterConfig] 新增规则');
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
                onClick={() => handleEditRule(rule.id)}
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
                      handleToggle(rule.id);
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
    </View>
  );
};

export default RouterConfigPage;
