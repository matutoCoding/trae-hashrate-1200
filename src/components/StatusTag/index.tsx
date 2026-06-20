import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type TagType = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusTagProps {
  text: string;
  type?: TagType;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({
  text,
  type = 'default',
  size = 'small',
  className
}) => {
  return (
    <View
      className={classnames(
        styles.statusTag,
        styles[type],
        styles[size],
        className
      )}
    >
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default StatusTag;
