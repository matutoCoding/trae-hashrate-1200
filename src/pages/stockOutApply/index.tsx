import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockDrugs, getBatchesByDrugId } from '../../data/drugData';
import { mockRouterRules, getRouterRulesByType } from '../../data/approvalData';
import { calculateFifo } from '../../utils/fifo';
import { matchRouterRule } from '../../utils/approvalRouter';
import { formatDate } from '../../utils/date';
import { DRUG_CATEGORY_MAP } from '../../types/drug';

const StockOutApplyPage: React.FC = () => {
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [showDrugPicker, setShowDrugPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const selectedDrug = useMemo(() => {
    return mockDrugs.find(d => d.id === selectedDrugId);
  }, [selectedDrugId]);

  const batches = useMemo(() => {
    if (!selectedDrugId) return [];
    return getBatchesByDrugId(selectedDrugId);
  }, [selectedDrugId]);

  const fifoResult = useMemo(() => {
    if (!selectedDrugId || !quantity || parseInt(quantity) <= 0) return null;
    return calculateFifo(batches, parseInt(quantity));
  }, [selectedDrugId, quantity, batches]);

  const routerMatch = useMemo(() => {
    if (!selectedDrug || !quantity || parseInt(quantity) <= 0) return null;
    const rules = getRouterRulesByType('stock_out');
    const content = {
      drugId: selectedDrug.id,
      drugName: selectedDrug.name,
      drugCategory: selectedDrug.category,
      quantity: parseInt(quantity) || 0,
      unit: selectedDrug.unit,
      amount: (parseFloat(quantity) || 0) * selectedDrug.price,
      purpose
    };
    return matchRouterRule(rules, content);
  }, [selectedDrug, quantity, purpose]);

  const filteredDrugs = useMemo(() => {
    if (selectedCategory === 'all') return mockDrugs.filter(d => d.status !== 'expired');
    return mockDrugs.filter(d => d.category === selectedCategory && d.status !== 'expired');
  }, [selectedCategory]);

  const handleDrugSelect = (drugId: string) => {
    setSelectedDrugId(drugId);
    setQuantity('');
    setShowDrugPicker(false);
    console.log('[StockOutApply] 选择药品:', drugId);
  };

  const handleSubmit = () => {
    if (!selectedDrugId) {
      Taro.showToast({ title: '请选择药品', icon: 'none' });
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      Taro.showToast({ title: '请输入出库数量', icon: 'none' });
      return;
    }
    if (!fifoResult?.canFulfill) {
      Taro.showToast({ title: '库存不足', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '提交出库申请',
      content: `确认申请出库 ${selectedDrug?.name} ${quantity} ${selectedDrug?.unit}？
系统将自动按 FIFO 规则分配批次。`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '申请已提交', icon: 'success' });
          console.log('[StockOutApply] 提交申请:', {
            drugId: selectedDrugId,
            quantity: parseInt(quantity),
            purpose,
            remark,
            fifoResult,
            routerMatch
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const categories = [
    { key: 'all', label: '全部' },
    ...Object.entries(DRUG_CATEGORY_MAP).map(([key, value]) => ({ key, label: value }))
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择药品</Text>

        <View className={styles.tagList} style={{ marginBottom: '24rpx' }}>
          {categories.map(cat => (
            <View
              key={cat.key}
              className={classnames(styles.categoryTag, selectedCategory === cat.key && styles.active)}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.label}
            </View>
          ))}
        </View>

        <ScrollView scrollY style={{ maxHeight: '600rpx' }}>
          {filteredDrugs.map(drug => (
            <View
              key={drug.id}
              className={styles.batchItem}
              onClick={() => handleDrugSelect(drug.id)}
              style={{
                background: selectedDrugId === drug.id ? 'rgba(0, 180, 42, 0.05)' : '#fff',
                borderLeft: selectedDrugId === drug.id ? '6rpx solid #00b42a' : 'none',
                borderRadius: selectedDrugId === drug.id ? '8rpx' : 0
              }}
            >
              <View className={styles.batchInfo}>
                <Text className={styles.batchNo}>{drug.name}</Text>
                <Text className={styles.batchDate}>
                  {drug.spec} · {DRUG_CATEGORY_MAP[drug.category]} · 库存{drug.totalStock}{drug.unit}
                </Text>
              </View>
              <Text style={{ fontSize: '28rpx', color: selectedDrugId === drug.id ? '#00b42a' : '#86909c' }}>
                {selectedDrugId === drug.id ? '✓ 已选' : '选择'}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {selectedDrug && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>出库信息</Text>

          <View className={styles.formRow}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>出库数量</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入数量"
                value={quantity}
                onInput={(e) => setQuantity(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>单位</Text>
              <View className={styles.drugSelector}>
                <Text className={styles.drugSelectorText}>{selectedDrug.unit}</Text>
              </View>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>出库用途</Text>
            <Input
              className={styles.formInput}
              placeholder="如：社区义诊、受助发放等"
              value={purpose}
              onInput={(e) => setPurpose(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>备注</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="请输入备注信息..."
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
          </View>
        </View>
      )}

      {fifoResult && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>FIFO 分配结果</Text>

          <View className={styles.fifoSection}>
            <Text className={styles.fifoTitle}>
              <Text className={styles.fifoIcon}>📋</Text>
              {fifoResult.canFulfill ? '✓ 库存充足，可满足需求' : `✗ 库存不足，缺 ${fifoResult.shortfall} 单位`}
            </Text>
            <Text className={styles.fifoDesc}>
              系统已按效期从近到远自动分配批次，确保先进先出
            </Text>
          </View>

          <View className={styles.batchList} style={{ marginTop: '24rpx' }}>
            {fifoResult.batchList.map((item, index) => (
              <View key={item.batchId} className={styles.batchItem}>
                <View className={styles.batchInfo}>
                  <Text className={styles.batchNo}>第{index + 1}批 · {item.batchNo}</Text>
                  <Text className={styles.batchDate}>
                    有效期至 {formatDate(item.expiryDate)} · 库存{item.remainingQuantity}{item.unit}
                  </Text>
                </View>
                <View className={styles.batchQty}>
                  <Text className={styles.qtyNumber}>出 {item.quantity}</Text>
                  <Text className={styles.qtyUnit}>{item.unit}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>合计出库</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryHighlight)}>
              {fifoResult.totalQuantity} {selectedDrug?.unit}
            </Text>
          </View>
        </View>
      )}

      {routerMatch && routerMatch.matched && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>审批流程</Text>

          <View className={styles.routerInfo}>
            <Text className={styles.routerTitle}>匹配规则：{routerMatch.rule?.name}</Text>
            <View className={styles.routerBranches}>
              {routerMatch.branches.map((branch, index) => (
                <React.Fragment key={branch.id}>
                  <View className={styles.routerBranch}>
                    <Text className={styles.branchName}>{branch.name}</Text>
                    <Text className={styles.branchRole}>{branch.approverRole}</Text>
                  </View>
                  {index < routerMatch.branches.length - 1 && (
                    <Text className={styles.branchArrow}>→</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={{ height: '40rpx' }} />

      <View className={styles.submitBtn} onClick={handleSubmit}>
        <Text className={styles.submitBtnText}>提交申请</Text>
      </View>
    </ScrollView>
  );
};

export default StockOutApplyPage;
