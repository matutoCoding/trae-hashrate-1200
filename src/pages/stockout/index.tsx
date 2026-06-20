import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import EmptyState from '../../components/EmptyState';
import StatusTag from '../../components/StatusTag';
import { generateExpiryWarnings, mockDrugBatches } from '../../data/drugData';
import { getTotalAvailableQuantity, getTotalLockedQuantity, getTotalExpiredQuantity } from '../../utils/fifo';
import { formatDate } from '../../utils/date';
import type { ExpiryWarning } from '../../types/drug';

type TabType = 'warning' | 'expired' | 'locked';

const StockoutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('warning');

  const warnings = useMemo(() => generateExpiryWarnings(), []);

  const stats = useMemo(() => {
    const available = getTotalAvailableQuantity(mockDrugBatches);
    const locked = getTotalLockedQuantity(mockDrugBatches);
    const expired = getTotalExpiredQuantity(mockDrugBatches);
    const expiring = warnings.filter(w => w.warningLevel === 'severe' || w.warningLevel === 'warning').length;
    return { available, locked, expired, expiring };
  }, [warnings]);

  const displayWarnings = useMemo(() => {
    switch (activeTab) {
      case 'warning':
        return warnings.filter(w => w.daysRemaining >= 0 && w.daysRemaining <= 180);
      case 'expired':
        return warnings.filter(w => w.daysRemaining < 0);
      case 'locked':
        return mockDrugBatches
          .filter(b => b.status === 'locked')
          .map(b => ({
            id: `locked_${b.id}`,
            drugId: b.drugId,
            drugName: b.drugName,
            batchId: b.id,
            batchNo: b.batchNo,
            spec: b.spec,
            remainingQuantity: b.remainingQuantity,
            unit: b.unit,
            expiryDate: b.expiryDate,
            daysRemaining: 0,
            warningLevel: 'severe' as const
          }));
      default:
        return [];
    }
  }, [activeTab, warnings]);

  const handleApplyOutbound = () => {
    Taro.navigateTo({
      url: '/pages/stockOutApply/index'
    });
  };

  const handleWarningList = () => {
    Taro.navigateTo({
      url: '/pages/warningList/index'
    });
  };

  const handleBatchClick = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/drugDetail/index?id=${drugId}`
    });
  };

  const handleRefresh = () => {
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  React.useEffect(() => {
    console.log('[StockoutPage] 页面加载，临期预警数:', warnings.length);
  }, [warnings]);

  const getWarningItem = (item: ExpiryWarning | any) => {
    const isSevere = item.warningLevel === 'severe' || item.daysRemaining < 0;
    const daysText = item.daysRemaining < 0
      ? `已过期 ${Math.abs(item.daysRemaining)} 天`
      : `剩余 ${item.daysRemaining} 天`;

    return (
      <View
        key={item.id}
        className={classnames(styles.warningItem, isSevere && styles.severe)}
        onClick={() => handleBatchClick(item.drugId)}
      >
        <View className={styles.warningInfo}>
          <Text className={styles.warningDrugName}>{item.drugName}</Text>
          <Text className={styles.warningBatch}>批号：{item.batchNo}</Text>
          <Text className={styles.warningDate}>
            有效期至：{formatDate(item.expiryDate)}
          </Text>
        </View>
        <View className={classnames(styles.warningDays, isSevere && styles.severe)}>
          <Text className={styles.daysNumber}>
            {item.daysRemaining < 0 ? Math.abs(item.daysRemaining) : item.daysRemaining}
          </Text>
          <Text className={styles.daysLabel}>
            {item.daysRemaining < 0 ? '天前过期' : '天后到期'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className={styles.page} onPullDownRefresh={handleRefresh}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>效期出库管理</Text>
        <Text className={styles.headerSubtitle}>先进先出 · 效期优先 · 临期预警</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.statGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statCardTitle}>可用库存</Text>
            <View style={{ display: 'flex', alignItems: 'baseline' }}>
              <Text className={styles.statCardValue}>{stats.available}</Text>
              <Text className={styles.statCardUnit}>单位</Text>
            </View>
          </View>
          <View className={classnames(styles.statCard, styles.statCardWarning)}>
            <Text className={styles.statCardTitle}>临期预警</Text>
            <View style={{ display: 'flex', alignItems: 'baseline' }}>
              <Text className={styles.statCardValue}>{stats.expiring}</Text>
              <Text className={styles.statCardUnit}>批次</Text>
            </View>
          </View>
          <View className={classnames(styles.statCard, styles.statCardError)}>
            <Text className={styles.statCardTitle}>过期锁定</Text>
            <View style={{ display: 'flex', alignItems: 'baseline' }}>
              <Text className={styles.statCardValue}>{stats.expired}</Text>
              <Text className={styles.statCardUnit}>批次</Text>
            </View>
          </View>
          <View className={classnames(styles.statCard, styles.statCardSuccess)}>
            <Text className={styles.statCardTitle}>正常批次</Text>
            <View style={{ display: 'flex', alignItems: 'baseline' }}>
              <Text className={styles.statCardValue}>
                {mockDrugBatches.filter(b => b.status === 'normal').length}
              </Text>
              <Text className={styles.statCardUnit}>批次</Text>
            </View>
          </View>
        </View>

        <View className={styles.fifoCard}>
          <View className={styles.fifoHeader}>
            <Text className={styles.fifoTitle}>
              <Text className={styles.fifoIcon}>📋</Text>
              出库规则说明
            </Text>
            <Text className={styles.fifoBadge}>FIFO</Text>
          </View>
          <Text className={styles.fifoDesc}>
            药品出库严格遵循先进先出原则，系统自动按效期排序，优先发放临近效期的药品，确保药品在有效期内得到合理使用。
          </Text>
          <View className={styles.fifoRule}>
            <Text className={styles.fifoRuleIcon}>✅</Text>
            <Text className={styles.fifoRuleText}>
              系统自动按效期从近到远排序，优先出库临近效期批次
            </Text>
          </View>
          <View className={styles.fifoRule}>
            <Text className={styles.fifoRuleIcon}>🚫</Text>
            <Text className={styles.fifoRuleText}>
              过期批次自动锁定，禁止出库发放
            </Text>
          </View>
          <View className={styles.fifoRule}>
            <Text className={styles.fifoRuleIcon}>⚠️</Text>
            <Text className={styles.fifoRuleText}>
              临期药品自动预警，提前30/90/180天分级提醒
            </Text>
          </View>
          <View className={styles.fifoRule}>
            <Text className={styles.fifoRuleIcon}>🔒</Text>
            <Text className={styles.fifoRuleText}>
              质量抽检等特殊情况可手动锁定批次
            </Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>效期预警</Text>
          <Text className={styles.sectionMore} onClick={handleWarningList}>
            查看全部 →
          </Text>
        </View>

        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, activeTab === 'warning' && styles.active)}
            onClick={() => setActiveTab('warning')}
          >
            临期 ({warnings.filter(w => w.daysRemaining >= 0).length})
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'expired' && styles.active)}
            onClick={() => setActiveTab('expired')}
          >
            已过期 ({warnings.filter(w => w.daysRemaining < 0).length})
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'locked' && styles.active)}
            onClick={() => setActiveTab('locked')}
          >
            已锁定 ({mockDrugBatches.filter(b => b.status === 'locked').length})
          </View>
        </View>

        <View className={styles.warningList}>
          {displayWarnings.length > 0 ? (
            displayWarnings.map(item => getWarningItem(item))
          ) : (
            <EmptyState
              title={activeTab === 'warning' ? '暂无临期药品' : activeTab === 'expired' ? '暂无过期药品' : '暂无锁定批次'}
              description="数据将实时更新"
              icon={activeTab === 'expired' ? '❌' : '🔔'}
            />
          )}
        </View>
      </View>

      <View className={styles.applyBtn} onClick={handleApplyOutbound}>
        <Text className={styles.applyBtnText}>申请出库</Text>
      </View>
    </View>
  );
};

export default StockoutPage;
