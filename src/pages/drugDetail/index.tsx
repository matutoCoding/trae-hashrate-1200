import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { getDrugById, getBatchesByDrugId } from '../../data/drugData';
import { DRUG_CATEGORY_MAP, BATCH_STATUS_MAP } from '../../types/drug';
import { formatDate, daysFromNow } from '../../utils/date';
import { calculateFifo, getTotalAvailableQuantity } from '../../utils/fifo';
import StatusTag from '../../components/StatusTag';
import classnames from 'classnames';

const DrugDetailPage: React.FC = () => {
  const [drug, setDrug] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [fifoResult, setFifoResult] = useState<any>(null);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params = (currentPage as any).options || (currentPage as any).$router?.params || {};
    const id = params.id || '';

    if (id) {
      const drugData = getDrugById(id);
      const batchData = getBatchesByDrugId(id);
      setDrug(drugData);
      setBatches(batchData);

      if (batchData.length > 0) {
        const available = getTotalAvailableQuantity(batchData);
        const result = calculateFifo(batchData, Math.min(available, 50));
        setFifoResult(result);
      }

      console.log('[DrugDetail] 药品详情:', id, drugData?.name);
    }
  }, []);

  const getBatchStatusType = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'error';
      case 'locked':
        return 'default';
      default:
        return 'default';
    }
  };

  if (!drug) {
    return (
      <View className={styles.page}>
        <Text className={styles.icon}>💊</Text>
        <Text className={styles.title}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.page} style={{ padding: 0 }}>
      <View style={{ padding: '32rpx', background: 'linear-gradient(135deg, #00b42a 0%, #33c255 100%)', color: '#fff' }}>
        <Text style={{ fontSize: '40rpx', fontWeight: '600', display: 'block', marginBottom: '16rpx' }}>{drug.name}</Text>
        <Text style={{ fontSize: '28rpx', opacity: 0.9, display: 'block', marginBottom: '8rpx' }}>{drug.genericName}</Text>
        <Text style={{ fontSize: '24rpx', opacity: 0.8 }}>{drug.spec}</Text>
      </View>

      <View style={{ padding: '32rpx' }}>
        <View style={{ background: '#fff', borderRadius: '16rpx', padding: '32rpx', marginBottom: '24rpx', boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)' }}>
          <Text style={{ fontSize: '32rpx', fontWeight: '600', marginBottom: '24rpx', display: 'block' }}>基本信息</Text>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#86909c' }}>药品分类</Text>
            <Text style={{ fontSize: '28rpx', color: '#1d2129' }}>{DRUG_CATEGORY_MAP[drug.category]}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#86909c' }}>生产厂家</Text>
            <Text style={{ fontSize: '28rpx', color: '#1d2129' }}>{drug.manufacturer}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#86909c' }}>单价</Text>
            <Text style={{ fontSize: '28rpx', color: '#f53f3f', fontWeight: '600' }}>¥{drug.price.toFixed(2)}/{drug.unit}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '28rpx', color: '#86909c' }}>总库存</Text>
            <Text style={{ fontSize: '28rpx', color: '#1d2129' }}>{drug.totalStock} {drug.unit}</Text>
          </View>
        </View>

        <View style={{ background: '#fff', borderRadius: '16rpx', padding: '32rpx', marginBottom: '24rpx', boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)' }}>
          <Text style={{ fontSize: '32rpx', fontWeight: '600', marginBottom: '24rpx', display: 'block' }}>
            批次列表 <Text style={{ fontSize: '24rpx', color: '#86909c', fontWeight: '400' }}>(共 {batches.length} 个批次)</Text>
          </Text>

          {batches.map((batch, index) => {
            const days = daysFromNow(batch.expiryDate);
            return (
              <View
                key={batch.id}
                style={{
                  padding: '24rpx 0',
                  borderTop: index === 0 ? 'none' : '1rpx solid #f2f3f5'
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12rpx' }}>
                  <Text style={{ fontSize: '28rpx', fontWeight: '500', color: '#1d2129' }}>
                    批号：{batch.batchNo}
                  </Text>
                  <StatusTag
                    text={BATCH_STATUS_MAP[batch.status]}
                    type={getBatchStatusType(batch.status)}
                    size="small"
                  />
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#86909c' }}>生产日期</Text>
                  <Text style={{ fontSize: '24rpx', color: '#4e5969' }}>{formatDate(batch.productionDate)}</Text>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#86909c' }}>有效期至</Text>
                  <Text style={{
                    fontSize: '24rpx',
                    color: batch.status === 'expired' ? '#f53f3f' : batch.status === 'expiring_soon' ? '#ff7d00' : '#4e5969'
                  }}>
                    {formatDate(batch.expiryDate)}
                    {days >= 0 ? ` (剩余${days}天)` : ` (已过期${Math.abs(days)}天)`}
                  </Text>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '24rpx', color: '#86909c' }}>剩余数量</Text>
                  <Text style={{ fontSize: '24rpx', color: '#1d2129', fontWeight: '500' }}>
                    {batch.remainingQuantity} {batch.unit}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {fifoResult && (
          <View style={{ background: '#fff', borderRadius: '16rpx', padding: '32rpx', boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: '600', marginBottom: '24rpx', display: 'block' }}>
              FIFO 出库示例 (申请50单位)
            </Text>
            <View style={{ background: '#e8ffed', borderRadius: '12rpx', padding: '24rpx', marginBottom: '24rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#00b42a', fontWeight: '500' }}>
                {fifoResult.canFulfill ? '✓ 库存充足，可满足需求' : `✗ 库存不足，缺 ${fifoResult.shortfall} 单位`}
              </Text>
            </View>
            {fifoResult.batchList.map((item: any, index: number) => (
              <View
                key={item.batchId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16rpx 0',
                  borderBottom: index < fifoResult.batchList.length - 1 ? '1rpx solid #f2f3f5' : 'none'
                }}
              >
                <View>
                  <Text style={{ fontSize: '28rpx', color: '#1d2129', display: 'block' }}>
                    第{index + 1}批 · {item.batchNo}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#86909c' }}>
                    有效期至 {formatDate(item.expiryDate)}
                  </Text>
                </View>
                <Text style={{ fontSize: '28rpx', color: '#00b42a', fontWeight: '600' }}>
                  出 {item.quantity} {item.unit}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DrugDetailPage;
