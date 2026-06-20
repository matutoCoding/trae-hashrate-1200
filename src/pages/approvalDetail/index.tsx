import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { getApprovalById } from '../../data/approvalData';
import { APPROVAL_TYPE_MAP, APPROVAL_STATUS_MAP } from '../../types/approval';
import { formatDateTime } from '../../utils/date';
import StatusTag from '../../components/StatusTag';

const ApprovalDetailPage: React.FC = () => {
  const [approval, setApproval] = useState<any>(null);
  const [remark, setRemark] = useState('');
  const [showRemarkInput, setShowRemarkInput] = useState(false);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params = (currentPage as any).options || (currentPage as any).$router?.params || {};
    const id = params.id || '';

    if (id) {
      const data = getApprovalById(id);
      setApproval(data);
      console.log('[ApprovalDetail] 审批详情:', id, data?.title);
    }
  }, []);

  const handleApprove = () => {
    setShowRemarkInput(true);
    Taro.showModal({
      title: '审批通过',
      content: '确认通过该审批？可添加审批意见。',
      editable: true,
      placeholderText: '请输入审批意见（选填）',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '审批通过', icon: 'success' });
          console.log('[ApprovalDetail] 审批通过:', approval?.id, res.content);
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handleReject = () => {
    Taro.showModal({
      title: '审批驳回',
      content: '确认驳回该审批？请填写驳回原因。',
      editable: true,
      placeholderText: '请输入驳回原因',
      success: (res) => {
        if (res.confirm) {
          if (!res.content) {
            Taro.showToast({ title: '请输入驳回原因', icon: 'none' });
            return;
          }
          Taro.showToast({ title: '已驳回', icon: 'none' });
          console.log('[ApprovalDetail] 审批驳回:', approval?.id, res.content);
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const getStatusType = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'current':
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已驳回';
      case 'current':
        return '审批中';
      case 'pending':
        return '待审批';
      default:
        return status;
    }
  };

  if (!approval) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '60rpx' }}>📋</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909c', marginTop: '24rpx', display: 'block' }}>
            加载中...
          </Text>
        </View>
      </View>
    );
  }

  const isCurrentUserCanApprove = approval.status === 'pending' || approval.status === 'processing';

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>{approval.title}</Text>
        <Text className={styles.headerSubtitle}>
          {APPROVAL_TYPE_MAP[approval.approvalType]} · {approval.orderNo}
        </Text>
        <View className={styles.statusBadge}>
          {APPROVAL_STATUS_MAP[approval.status]}
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>申请信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请人</Text>
            <Text className={styles.infoValue}>{approval.applicant}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(approval.applyTime)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>匹配规则</Text>
            <Text className={classnames(styles.infoValue, styles.infoHighlight)}>
              {approval.routerRuleName}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>申请内容</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>药品名称</Text>
            <Text className={styles.infoValue}>{approval.content.drugName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>药品分类</Text>
            <Text className={styles.infoValue}>{approval.content.drugCategory}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请数量</Text>
            <Text className={styles.infoValue}>
              {approval.content.quantity} {approval.content.unit}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请金额</Text>
            <Text className={classnames(styles.infoValue, styles.infoHighlight)}>
              ¥{approval.content.amount?.toFixed(2)}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>用途</Text>
            <Text className={styles.infoValue}>{approval.content.purpose}</Text>
          </View>
          {approval.content.remark && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{approval.content.remark}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>审批流程</Text>
          <View className={styles.timeline}>
            {approval.branches.map((branch: any, index: number) => (
              <View key={branch.id} className={styles.timelineItem}>
                <View
                  className={classnames(
                    styles.timelineDot,
                    branch.status === 'current' && styles.active,
                    branch.status === 'approved' && styles.approved,
                    branch.status === 'rejected' && styles.rejected
                  )}
                />
                <View className={styles.timelineContent}>
                  <Text className={styles.timelineTitle}>
                    {branch.name} - {branch.approverRole}
                  </Text>
                  <Text className={styles.timelineSubtitle}>
                    {getStatusText(branch.status)}
                    {branch.approver && ` · ${branch.approver}`}
                    {branch.approveTime && ` · ${formatDateTime(branch.approveTime)}`}
                  </Text>
                  {branch.remark && (
                    <View className={styles.timelineRemark}>
                      {branch.remark}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {isCurrentUserCanApprove && (
        <View className={styles.actionBar}>
          <View className={classnames(styles.actionBtn, styles.danger)} onClick={handleReject}>
            驳回
          </View>
          <View className={classnames(styles.actionBtn, styles.primary)} onClick={handleApprove}>
            通过
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ApprovalDetailPage;
