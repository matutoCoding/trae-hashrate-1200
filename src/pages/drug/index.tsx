import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatCard from '../../components/StatCard';
import DrugCard from '../../components/DrugCard';
import EmptyState from '../../components/EmptyState';
import { useAppStore } from '../../store';
import { DRUG_CATEGORY_MAP } from '../../types/drug';
import type { DrugCategory } from '../../types/drug';

const DrugPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const drugs = useAppStore(state => state.drugs);
  const batches = useAppStore(state => state.batches);
  const expiryWarnings = useAppStore(state => state.expiryWarnings);
  const refreshAllDrugStatus = useAppStore(state => state.refreshAllDrugStatus);
  const refreshExpiryWarnings = useAppStore(state => state.refreshExpiryWarnings);

  const categories = [
    { key: 'all', label: '全部' },
    ...Object.entries(DRUG_CATEGORY_MAP).map(([key, value]) => ({ key, label: value }))
  ];

  const stats = useMemo(() => {
    const totalDrugs = drugs.length;
    const totalBatches = batches.length;
    const expiringCount = batches.filter(b => b.status === 'expiring_soon').length;
    const expiredCount = batches.filter(b => b.status === 'expired').length;
    return { totalDrugs, totalBatches, expiringCount, expiredCount };
  }, [drugs, batches]);

  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug => {
      const matchSearch = !searchText ||
        drug.name.includes(searchText) ||
        drug.genericName.toLowerCase().includes(searchText.toLowerCase());

      const matchCategory = activeCategory === 'all' || drug.category === activeCategory;

      return matchSearch && matchCategory;
    });
  }, [drugs, searchText, activeCategory]);

  const handleDrugClick = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/drugDetail/index?id=${drugId}`
    });
  };

  const handleStockIn = () => {
    Taro.navigateTo({
      url: '/pages/stockIn/index'
    });
  };

  const handleWarningList = () => {
    Taro.navigateTo({
      url: '/pages/warningList/index'
    });
  };

  const handleRefresh = () => {
    refreshAllDrugStatus();
    refreshExpiryWarnings();
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  React.useEffect(() => {
    const currentPages = Taro.getCurrentPages();
    console.log('[DrugPage] 页面加载，当前页面数:', currentPages.length);
  }, []);

  return (
    <View className={styles.page} onPullDownRefresh={handleRefresh}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>药品批次管理</Text>
        <Text className={styles.headerSubtitle}>慈善药品发放系统</Text>

        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.totalDrugs}</Text>
            <Text className={styles.statLabel}>药品品种</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.totalBatches}</Text>
            <Text className={styles.statLabel}>药品批次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.expiringCount}</Text>
            <Text className={styles.statLabel}>临期批次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.expiredCount}</Text>
            <Text className={styles.statLabel}>过期批次</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.actionCard}>
          <View className={styles.actionItem} onClick={handleStockIn}>
            <Text className={styles.actionIcon}>📦</Text>
            <Text className={styles.actionText}>到货验收</Text>
          </View>
          <View className={styles.actionItem} onClick={handleWarningList}>
            <Text className={styles.actionIcon}>⚠️</Text>
            <Text className={styles.actionText}>效期预警</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>🔍</Text>
            <Text className={styles.actionText}>批次查询</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>📊</Text>
            <Text className={styles.actionText}>库存统计</Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>药品列表</Text>
          <Text className={styles.sectionMore}>共 {filteredDrugs.length} 种</Text>
        </View>

        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索药品名称、通用名"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>

        <ScrollView
          className={styles.filterBar}
          scrollX
          enhanced
          showScrollbar={false}
        >
          {categories.map(cat => (
            <View
              key={cat.key}
              className={classnames(styles.filterItem, activeCategory === cat.key && styles.active)}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </View>
          ))}
        </ScrollView>

        <View className={styles.drugList}>
          {filteredDrugs.length > 0 ? (
            filteredDrugs.map(drug => (
              <DrugCard
                key={drug.id}
                drug={drug}
                onClick={() => handleDrugClick(drug.id)}
              />
            ))
          ) : (
            <EmptyState
              title="暂无药品"
              description="没有找到符合条件的药品"
              icon="💊"
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default DrugPage;
