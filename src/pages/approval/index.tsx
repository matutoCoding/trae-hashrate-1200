import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import ApprovalCard from '../../components/ApprovalCard';
import EmptyState from '../../components/EmptyState';
import { useAppStore } from '../../store';
import { formatConditionDisplay } from '../../utils/approvalRouter';

type TabType = 'pending' | 'approved' | 'router';

const ApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const approvalOrders = useAppStore(state => state.approvalOrders);
  const routerRules = useAppStore(state => state.routerRules);

  const pendingCount = useMemo(() => {
    return approvalOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  }, [approvalOrders]);

  const approvedCount = useMemo(() => {
    return approvalOrders.filter(o => o.status === 'approved').length;
  }, [approvalOrders]);

  const displayApprovals = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return approvalOrders.filter(o => o.status === 'pending' || o.status === 'processing');
      case 'approved':
        return approvalOrders.filter(o => o.status === 'approved' || o.status === 'rejected');
      default:
        return [];
    }
  }, [activeTab, approvalOrders]);

  const displayRules = useMemo(() => {
    return routerRules.filter(r => r.approvalType === 'stock_out');
  }, [routerRules]);

  const handleApprovalClick = (approvalId: string) => {
    Taro.navigateTo({
      url: `/pages/approvalDetail/index?id=${approvalId}`
    });
  };

  const handleRouterConfig = () => {
    Taro.navigateTo({
      url: '/pages/routerConfig/index'
    });
  };

  const handleMyApprovals = () => {
    Taro.showToast({ title: '我的审批', icon: 'none' });
  };

  const handleRefresh = () => {
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  React.useEffect(() => {
    console.log('[ApprovalPage] 页面加载，待审批数:', pendingCount);
  }, [pendingCount]);

  return (
    <View className={styles.page} onPullDownRefresh={handleRefresh}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>分支审批中心</Text>
        <Text className={styles.headerSubtitle}>条件路由 · 动态分支 · 多级审批</Text>

        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待审批</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{approvedCount}</Text>
            <Text className={styles.statLabel}>已审批</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{displayRules.length}</Text>
            <Text className={styles.statLabel}>路由规则</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.actionCard}>
          <View className={styles.actionItem} onClick={handleMyApprovals}>
            <Text className={styles.actionIcon}>📝</Text>
            <Text className={styles.actionText}>我的审批</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>📋</Text>
            <Text className={styles.actionText}>我发起的</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>🔍</Text>
            <Text className={styles.actionText}>审批查询</Text>
          </View>
          <View className={styles.actionItem} onClick={handleRouterConfig}>
            <Text className={styles.actionIcon}>⚙️</Text>
            <Text className={styles.actionText}>路由配置</Text>
          </View>
        </View>

        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, activeTab === 'pending' && styles.active)}
            onClick={() => setActiveTab('pending')}
          >
            待审批
            {pendingCount > 0 && (
              <Text className={styles.tabBadge}>{pendingCount}</Text>
            )}
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'approved' && styles.active)}
            onClick={() => setActiveTab('approved')}
          >
            已审批
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'router' && styles.active)}
            onClick={() => setActiveTab('router')}
          >
            路由规则
          </View>
        </View>

        {activeTab !== 'router' ? (
          <View className={styles.approvalList}>
            {displayApprovals.length > 0 ? (
              displayApprovals.map(approval => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onClick={() => handleApprovalClick(approval.id)}
                />
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <EmptyState
                  title={activeTab === 'pending' ? '暂无待审批' : '暂无审批记录'}
                  description={activeTab === 'pending' ? '您当前没有待处理的审批' : '审批记录将显示在这里'}
                  icon="📋"
                />
              </View>
            )}
          </View>
        ) : (
          <View>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>出库审批路由规则</Text>
              <Text className={styles.sectionMore} onClick={handleRouterConfig}>
                配置 →
              </Text>
            </View>

            {displayRules.map(rule => (
              <View key={rule.id} className={styles.routerCard} onClick={handleRouterConfig}>
                <View className={styles.routerHeader}>
                  <Text className={styles.routerTitle}>{rule.name}</Text>
                  <Text className={styles.routerPriority}>优先级 {rule.priority}</Text>
                </View>

                {rule.conditions.length > 0 && (
                  <View className={styles.routerConditions}>
                    <Text className={styles.conditionLabel}>触发条件（{rule.conditionLogic === 'AND' ? '全部满足' : '满足任一'}）</Text>
                    {rule.conditions.map(cond => (
                      <Text key={cond.id} className={styles.conditionTag}>
                        {formatConditionDisplay(cond)}
                      </Text>
                    ))}
                  </View>
                )}

                <View className={styles.routerBranches}>
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
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default ApprovalPage;
