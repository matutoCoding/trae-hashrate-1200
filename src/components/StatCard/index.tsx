import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'none';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  color = 'primary',
  onClick,
  className
}) => {
  return (
    <View
      className={classnames(styles.statCard, styles[color], className)}
      onClick={onClick}
    >
      <View className={styles.cardContent}>
        <Text className={styles.title}>{title}</Text>
        <View className={styles.valueRow}>
          <Text className={styles.value}>{value}</Text>
          {unit && <Text className={styles.unit}>{unit}</Text>}
        </View>
        {trend && trendValue && (
          <View className={classnames(styles.trend, styles[trend])}>
            <Text className={styles.trendText}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StatCard;
