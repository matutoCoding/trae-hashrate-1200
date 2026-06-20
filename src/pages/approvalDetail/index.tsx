import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import { APPROVAL_TYPE_MAP, APPROVAL_STATUS_MAP } from '../../types/approval';
import { formatDateTime } from '../../utils/date';
import StatusTag from '../../components/StatusTag';

const ApprovalDetailPage: React.FC = () => {
  const [approvalId, setApprovalId] = useState<string>('');
  const [remark, setRemark] = useState('');
  const [showRemarkInput, setShowRemarkInput] = useState(false);

  const approvalOrders = useAppStore(state => state.approvalOrders);
  const processApproval = useAppStore(state => state.processApproval);

  const approval = useMemo(() => {
    return approvalOrders.find(o => o.id === approvalId);
  }, [approvalOrders, approvalId]);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params = (currentPage as any).options || (currentPage as any).$router?.params || {};
    const id = params.id || '';
    setApprovalId(id);
    console.log('[ApprovalDetail] 审批详情:', id);
  }, []);

  const currentLevel = useMemo(() => {
    if (!approval) return 0;
    return approval.currentLevel;
  }, [approval]);

  const handleApprove = () => {
    Taro.showModal({
      title: '审批通过',
      content: '确认通过该审批？可添加审批意见。',
      editable: true,
      placeholderText: '请输入审批意见（选填）',
      success: (res) => {
        if (res.confirm) {
          const result = processApproval({
            approvalId,
            action: 'approve',
            level: currentLevel,
            remark: res.content || '',
            approver: '当前用户'
          });
          if (result.success) {
            Taro.showToast({ title: result.message, icon: 'success' });
            console.log('[ApprovalDetail] 审批通过:', approvalId, res.content);
            setTimeout(() => {
              Taro.navigateBack();
            }, 1500);
          } else {
            Taro.showToast({ title: result.message, icon: 'none' });
          }
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
          const result = processApproval({
            approvalId,
            action: 'reject',
            level: currentLevel,
            remark: res.content,
            approver: '当前用户'
          });
          if (result.success) {
            Taro.showToast({ title: result.message, icon: 'none' });
            console.log('[ApprovalDetail] 审批驳回:', approvalId, res.content);
            setTimeout(() => {
              Taro.navigateBack();
            }, 1500);
          } else {
            Taro.showToast({ title: result.message, icon: 'none' });
          }
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
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>审批级别</Text>
            <Text className={styles.infoValue}>
              共 {approval.totalLevels} 级，当前第 {approval.currentLevel} 级
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

        {approval.content.batchList && approval.content.batchList.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>FIFO 分配批次</Text>
            {approval.content.batchList.map((item, index) => (
              <View key={index} className={styles.infoRow}>
                <Text className={styles.infoLabel}>第{index + 1}批 · {item.batchNo}</Text>
                <Text className={styles.infoValue}>
                  出 {item.quantity} {item.unit} · 有效期至 {item.expiryDate}
                </Text>
              </View>
            ))}
          </View>
        )}

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
