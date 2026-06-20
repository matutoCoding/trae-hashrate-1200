import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '../StatusTag';
import { APPROVAL_STATUS_MAP, APPROVAL_TYPE_MAP } from '../../types/approval';
import type { ApprovalOrder } from '../../types/approval';
import { formatDateTime } from '../../utils/date';

interface ApprovalCardProps {
  approval: ApprovalOrder;
  onClick?: () => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ approval, onClick }) => {
  const getStatusType = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <View className={styles.approvalCard} onClick={onClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.title}>{approval.title}</Text>
        <StatusTag
          text={APPROVAL_STATUS_MAP[approval.status]}
          type={getStatusType(approval.status)}
          size="small"
        />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>单据号</Text>
          <Text className={styles.value}>{approval.orderNo}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>类型</Text>
          <Text className={styles.value}>{APPROVAL_TYPE_MAP[approval.approvalType]}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>申请人</Text>
          <Text className={styles.value}>{approval.applicant}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>申请时间</Text>
          <Text className={styles.value}>{formatDateTime(approval.applyTime)}</Text>
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressLabel}>审批进度</Text>
          <Text className={styles.progressText}>
            {approval.currentLevel} / {approval.totalLevels} 级
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View
            className={classnames(styles.progressFill, styles[approval.status])}
            style={{ width: `${(approval.currentLevel / approval.totalLevels) * 100}%` }}
          />
        </View>
        <View className={styles.branchList}>
          {approval.branches.map((branch, index) => (
            <View
              key={branch.id}
              className={classnames(styles.branchDot, styles[branch.status])}
            >
              <View className={styles.branchNode} />
              {branch.status !== 'pending' && (
                <Text className={styles.branchCheck}>
                  {branch.status === 'approved' ? '✓' : branch.status === 'rejected' ? '✕' : ''}
                </Text>
              )}
              {index < approval.branches.length - 1 && (
                <View
                  className={classnames(
                    styles.branchLine,
                    branch.status === 'approved' ? styles.approved : styles.pending
                  )}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {approval.content.remark && (
        <View className={styles.remarkSection}>
          <Text className={styles.remarkLabel}>备注</Text>
          <Text className={styles.remarkText}>{approval.content.remark}</Text>
        </View>
      )}
    </View>
  );
};

export default ApprovalCard;
