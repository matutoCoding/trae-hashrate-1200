import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '../../components/StatusTag';
import EmptyState from '../../components/EmptyState';
import { useAppStore } from '../../store';
import { formatDate } from '../../utils/date';
import type { ExpiryWarning } from '../../types/drug';

type TabType = 'all' | 'severe' | 'warning' | 'reminder' | 'expired';

const WarningListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const expiryWarnings = useAppStore(state => state.expiryWarnings);
  const batches = useAppStore(state => state.batches);

  const allWarnings = useMemo(() => {
    const expired = batches
      .filter(b => b.status === 'expired')
      .map(b => ({
        id: `exp_${b.id}`,
        drugId: b.drugId,
        drugName: b.drugName,
        batchId: b.id,
        batchNo: b.batchNo,
        spec: b.spec,
        remainingQuantity: b.remainingQuantity,
        unit: b.unit,
        expiryDate: b.expiryDate,
        daysRemaining: -10,
        warningLevel: 'severe' as const
      }));
    return [...expiryWarnings, ...expired].sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [expiryWarnings, batches]);

  const stats = useMemo(() => {
    const severe = allWarnings.filter(w => w.warningLevel === 'severe' && w.daysRemaining >= 0).length;
    const warning = allWarnings.filter(w => w.warningLevel === 'warning').length;
    const reminder = allWarnings.filter(w => w.warningLevel === 'reminder').length;
    const expired = allWarnings.filter(w => w.daysRemaining < 0).length;
    return { severe, warning, reminder, expired, total: allWarnings.length };
  }, [allWarnings]);

  const displayWarnings = useMemo(() => {
    switch (activeTab) {
      case 'severe':
        return allWarnings.filter(w => w.warningLevel === 'severe' && w.daysRemaining >= 0);
      case 'warning':
        return allWarnings.filter(w => w.warningLevel === 'warning');
      case 'reminder':
        return allWarnings.filter(w => w.warningLevel === 'reminder');
      case 'expired':
        return allWarnings.filter(w => w.daysRemaining < 0);
      default:
        return allWarnings;
    }
  }, [activeTab, allWarnings]);

  const handleWarningClick = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/drugDetail/index?id=${drugId}`
    });
  };

  const getLevelTagType = (level: string, days: number) => {
    if (days < 0) return 'error';
    switch (level) {
      case 'severe': return 'error';
      case 'warning': return 'warning';
      case 'reminder': return 'info';
      default: return 'default';
    }
  };

  const getLevelText = (level: string, days: number) => {
    if (days < 0) return '已过期';
    switch (level) {
      case 'severe': return '紧急预警';
      case 'warning': return '临期预警';
      case 'reminder': return '效期提醒';
      default: return '正常';
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'severe', label: '紧急' },
    { key: 'warning', label: '临期' },
    { key: 'reminder', label: '提醒' },
    { key: 'expired', label: '过期' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>效期预警中心</Text>
        <Text className={styles.headerDesc}>
          系统自动监测药品效期，提前预警
        </Text>

        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.severe}</Text>
            <Text className={styles.statLabel}>紧急</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.warning}</Text>
            <Text className={styles.statLabel}>临期</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.expired}</Text>
            <Text className={styles.statLabel}>过期</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.tabBar}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
              onClick={() => setActiveTab(tab.key as TabType)}
            >
              {tab.label}
            </View>
          ))}
        </View>

        <ScrollView scrollY enhanced showScrollbar={false}>
          {displayWarnings.length > 0 ? (
            displayWarnings.map(warning => (
              <View
                key={warning.id}
                className={classnames(
                  styles.warningCard,
                  warning.daysRemaining < 0 && styles.severe,
                  warning.warningLevel === 'reminder' && warning.daysRemaining >= 0 && styles.reminder
                )}
                onClick={() => handleWarningClick(warning.drugId)}
              >
                <View className={styles.warningHeader}>
                  <Text className={styles.warningDrug}>{warning.drugName}</Text>
                  <StatusTag
                    text={getLevelText(warning.warningLevel, warning.daysRemaining)}
                    type={getLevelTagType(warning.warningLevel, warning.daysRemaining)}
                    size="small"
                    className={styles.warningLevel}
                  />
                </View>

                <View className={styles.warningInfo}>
                  <View className={styles.infoCol}>
                    <Text className={styles.infoLabel}>规格</Text>
                    <Text className={styles.infoValue}>{warning.spec}</Text>
                  </View>
                  <View className={styles.infoCol}>
                    <Text className={styles.infoLabel}>剩余库存</Text>
                    <Text className={styles.infoValue}>
                      {warning.remainingQuantity} {warning.unit}
                    </Text>
                  </View>
                </View>

                <View className={styles.warningFooter}>
                  <Text className={styles.warningBatch}>
                    批号：{warning.batchNo} · 有效期至 {formatDate(warning.expiryDate)}
                  </Text>
                  <View className={classnames(
                    styles.daysBadge,
                    warning.daysRemaining < 0 && styles.severe,
                    warning.warningLevel === 'reminder' && warning.daysRemaining >= 0 && styles.reminder
                  )}>
                    <Text className={styles.daysNumber}>
                      {warning.daysRemaining < 0 ? Math.abs(warning.daysRemaining) : warning.daysRemaining}
                    </Text>
                    <Text className={styles.daysText}>
                      {warning.daysRemaining < 0 ? '天前过期' : '天后到期'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyWrap}>
              <EmptyState
                title="暂无预警"
                description="所有药品效期正常"
                icon="✅"
              />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default WarningListPage;
