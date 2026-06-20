import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '../../components/StatusTag';
import { getDistributionById, getRecipientById } from '../../data/distributionData';
import {
  DISTRIBUTION_STATUS_MAP,
  QUALIFICATION_TYPE_MAP,
  PICKUP_METHOD_MAP
} from '../../types/distribution';
import { formatDateTime } from '../../utils/date';

const DistributionRecordPage: React.FC = () => {
  const [record, setRecord] = useState<any>(null);
  const [recipient, setRecipient] = useState<any>(null);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params = (currentPage as any).options || (currentPage as any).$router?.params || {};
    const id = params.id || '';

    if (id) {
      const data = getDistributionById(id);
      setRecord(data);

      if (data) {
        const recipientData = getRecipientById(data.recipientId);
        setRecipient(recipientData);
      }

      console.log('[DistributionRecord] 发放记录详情:', id);
    }
  }, []);

  const getStatusType = (status: string) => {
    switch (status) {
      case 'distributed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'returned':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>发放记录详情</Text>
        <Text className={styles.headerSubtitle}>{record.recordNo}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.statusSection}>
            <Text className={styles.statusIcon}>
              {record.status === 'distributed' ? '✅' : record.status === 'pending' ? '⏳' : '📦'}
            </Text>
            <StatusTag
              text={DISTRIBUTION_STATUS_MAP[record.status]}
              type={getStatusType(record.status)}
              size="medium"
            />
            <Text className={styles.statusDesc} style={{ marginTop: '16rpx' }}>
              {record.distributeTime ? `发放时间：${formatDateTime(record.distributeTime)}` : '待领取'}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>受助人信息</Text>
          <View className={styles.recipientCard}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>{recipient?.name?.charAt(0) || '?'}</Text>
            </View>
            <View className={styles.recipientInfo}>
              <Text className={styles.recipientName}>
                {recipient?.name || record.recipientName}
              </Text>
              <Text className={styles.recipientDetail}>
                {recipient?.phone || ''} · {recipient?.idCard || record.idCard}
              </Text>
              <Text className={styles.recipientDetail} style={{ marginTop: '4rpx' }}>
                {recipient ? QUALIFICATION_TYPE_MAP[recipient.qualificationType] : ''}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>药品信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>药品名称</Text>
            <Text className={styles.infoValue}>{record.drugName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>规格</Text>
            <Text className={styles.infoValue}>{record.spec}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>批号</Text>
            <Text className={styles.infoValue}>{record.batchNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发放数量</Text>
            <Text className={styles.infoValue}>{record.quantity} {record.unit}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>金额</Text>
            <Text className={styles.infoValue} style={{ color: '#f53f3f', fontWeight: '600' }}>
              ¥{record.amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>发放信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发放人</Text>
            <Text className={styles.infoValue}>{record.distributor || '-'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>领取方式</Text>
            <Text className={styles.infoValue}>{PICKUP_METHOD_MAP[record.pickUpMethod]}</Text>
          </View>
          {record.pickUpPerson && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>代领人</Text>
              <Text className={styles.infoValue}>{record.pickUpPerson}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>关联审批</Text>
            <Text className={styles.infoValue}>{record.approvalNo}</Text>
          </View>
          {record.remark && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{record.remark}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default DistributionRecordPage;
