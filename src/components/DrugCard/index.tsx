import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import StatusTag from '../StatusTag';
import { BATCH_STATUS_MAP } from '../../types/drug';
import type { Drug } from '../../types/drug';
import { DRUG_CATEGORY_MAP } from '../../types/drug';

interface DrugCardProps {
  drug: Drug;
  onClick?: () => void;
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'normal':
      return 'success';
    case 'low_stock':
      return 'warning';
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

const DrugCard: React.FC<DrugCardProps> = ({ drug, onClick }) => {
  return (
    <View className={styles.drugCard} onClick={onClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.drugName}>{drug.name}</Text>
        <StatusTag
          text={BATCH_STATUS_MAP[drug.status as keyof typeof BATCH_STATUS_MAP] || drug.status}
          type={getStatusType(drug.status)}
          size="small"
        />
      </View>

      <Text className={styles.drugSpec}>{drug.spec}</Text>

      <View className={styles.cardInfo}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>分类</Text>
          <Text className={styles.infoValue}>{DRUG_CATEGORY_MAP[drug.category]}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>库存</Text>
          <Text className={styles.infoValue}>{drug.totalStock} {drug.unit}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>批次</Text>
          <Text className={styles.infoValue}>{drug.batchCount} 个</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <Text className={styles.manufacturer}>{drug.manufacturer}</Text>
        <Text className={styles.price}>¥{drug.price.toFixed(2)}/{drug.unit}</Text>
      </View>
    </View>
  );
};

export default DrugCard;
