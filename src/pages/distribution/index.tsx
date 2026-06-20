import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '../../components/StatusTag';
import EmptyState from '../../components/EmptyState';
import { useAppStore } from '../../store';
import {
  QUALIFICATION_TYPE_MAP,
  RECIPIENT_STATUS_MAP,
  DISTRIBUTION_STATUS_MAP,
  REVIEW_STATUS_MAP
} from '../../types/distribution';
import { formatDate, formatDateTime } from '../../utils/date';

type TabType = 'recipient' | 'record' | 'review';

const DistributionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('recipient');
  const [searchText, setSearchText] = useState('');

  const recipients = useAppStore(state => state.recipients);
  const distributionRecords = useAppStore(state => state.distributionRecords);
  const qualificationReviews = useAppStore(state => state.qualificationReviews);
  const processQualificationReview = useAppStore(state => state.processQualificationReview);

  const stats = useMemo(() => {
    const totalRecipients = recipients.length;
    const qualifiedCount = recipients.filter(r => r.status === 'qualified').length;
    const pendingCount = qualificationReviews.filter(r => r.status === 'pending').length;
    const totalRecords = distributionRecords.length;
    return { totalRecipients, qualifiedCount, pendingCount, totalRecords };
  }, [recipients, qualificationReviews, distributionRecords]);

  const filteredRecipients = useMemo(() => {
    return recipients.filter(r => {
      if (!searchText) return true;
      return r.name.includes(searchText) || r.idCard.includes(searchText) || r.phone.includes(searchText);
    });
  }, [searchText, recipients]);

  const filteredRecords = useMemo(() => {
    return distributionRecords.filter(r => {
      if (!searchText) return true;
      return r.recipientName.includes(searchText) || r.drugName.includes(searchText) || r.recordNo.includes(searchText);
    }).sort((a, b) => new Date(b.distributeTime).getTime() - new Date(a.distributeTime).getTime());
  }, [searchText, distributionRecords]);

  const pendingReviews = useMemo(() => {
    return qualificationReviews.filter(r => r.status === 'pending');
  }, [qualificationReviews]);

  const checkQualificationAndProceed = (recipient: any) => {
    if (recipient.status === 'qualified') {
      Taro.navigateTo({
        url: `/pages/distributionRecord/index?recipientId=${recipient.id}`
      });
    } else {
      let reason = '';
      switch (recipient.status) {
        case 'pending':
          reason = '资格审核中，请等待审核通过后再办理发放';
          break;
        case 'disqualified':
          reason = '资格审核未通过，无法办理药品发放';
          break;
        case 'expired':
          reason = '资格已过期，请重新申请资格审核';
          break;
        default:
          reason = '资格状态异常，请先完成资格审核';
      }
      Taro.showModal({
        title: '资格校验未通过',
        content: reason,
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  };

  const getStatusType = (status: string) => {
    switch (status) {
      case 'qualified':
      case 'approved':
      case 'distributed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'disqualified':
      case 'rejected':
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRecipientClick = (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    if (recipient) {
      checkQualificationAndProceed(recipient);
    }
  };

  const handleRecordClick = (recordId: string) => {
    Taro.navigateTo({
      url: `/pages/distributionRecord/index?id=${recordId}`
    });
  };

  const handleNewDistribution = () => {
    Taro.showToast({ title: '新建发放登记', icon: 'none' });
  };

  const handleQualificationReview = () => {
    Taro.navigateTo({
      url: '/pages/qualificationReview/index'
    });
  };

  const handleRecipientManage = () => {
    Taro.showToast({ title: '受助人管理', icon: 'none' });
  };

  const handleReviewApprove = (reviewId: string) => {
    Taro.showModal({
      title: '审核通过',
      content: '确认通过该受助资格审核？',
      editable: true,
      placeholderText: '请输入审核意见（选填）',
      success: (res) => {
        if (res.confirm) {
          const result = processQualificationReview({
            reviewId,
            action: 'approve',
            remark: res.content || '',
            reviewer: '当前用户'
          });
          if (result.success) {
            Taro.showToast({ title: result.message, icon: 'success' });
            console.log('[Distribution] 审核通过:', reviewId);
          } else {
            Taro.showToast({ title: result.message, icon: 'none' });
          }
        }
      }
    });
  };

  const handleReviewReject = (reviewId: string) => {
    Taro.showModal({
      title: '审核驳回',
      content: '请输入驳回原因',
      editable: true,
      placeholderText: '请输入驳回原因',
      success: (res) => {
        if (res.confirm) {
          if (!res.content) {
            Taro.showToast({ title: '请输入驳回原因', icon: 'none' });
            return;
          }
          const result = processQualificationReview({
            reviewId,
            action: 'reject',
            remark: res.content,
            reviewer: '当前用户'
          });
          if (result.success) {
            Taro.showToast({ title: result.message, icon: 'none' });
            console.log('[Distribution] 审核驳回:', reviewId);
          } else {
            Taro.showToast({ title: result.message, icon: 'none' });
          }
        }
      }
    });
  };

  const handleRefresh = () => {
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  React.useEffect(() => {
    console.log('[DistributionPage] 页面加载，受助人数:', stats.totalRecipients);
  }, [stats.totalRecipients]);

  return (
    <View className={styles.page} onPullDownRefresh={handleRefresh}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>发放登记管理</Text>
        <Text className={styles.headerSubtitle}>受助资格审核 · 药品发放登记</Text>

        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.totalRecipients}</Text>
            <Text className={styles.statLabel}>受助人数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.qualifiedCount}</Text>
            <Text className={styles.statLabel}>资格有效</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.pendingCount}</Text>
            <Text className={styles.statLabel}>待审核</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.totalRecords}</Text>
            <Text className={styles.statLabel}>发放记录</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.actionCard}>
          <View className={styles.actionItem} onClick={handleNewDistribution}>
            <Text className={styles.actionIcon}>📝</Text>
            <Text className={styles.actionText}>发放登记</Text>
          </View>
          <View className={styles.actionItem} onClick={handleQualificationReview}>
            <Text className={styles.actionIcon}>✅</Text>
            <Text className={styles.actionText}>资格审核</Text>
          </View>
          <View className={styles.actionItem} onClick={handleRecipientManage}>
            <Text className={styles.actionIcon}>👥</Text>
            <Text className={styles.actionText}>受助人</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>📊</Text>
            <Text className={styles.actionText}>统计</Text>
          </View>
        </View>

        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, activeTab === 'recipient' && styles.active)}
            onClick={() => setActiveTab('recipient')}
          >
            受助人
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'record' && styles.active)}
            onClick={() => setActiveTab('record')}
          >
            发放记录
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'review' && styles.active)}
            onClick={() => setActiveTab('review')}
          >
            待审核
            {stats.pendingCount > 0 && (
              <Text style={{
                position: 'absolute',
                top: '4rpx',
                right: '20rpx',
                minWidth: '32rpx',
                height: '32rpx',
                lineHeight: '32rpx',
                textAlign: 'center',
                background: '#f53f3f',
                color: '#fff',
                fontSize: '20rpx',
                borderRadius: '999rpx',
                padding: '0 8rpx'
              }}>
                {stats.pendingCount}
              </Text>
            )}
          </View>
        </View>

        {activeTab !== 'review' && (
          <View className={styles.searchBox}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder={activeTab === 'recipient' ? '搜索受助人姓名、身份证、电话' : '搜索药品、受助人、单据号'}
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
            />
          </View>
        )}

        {activeTab === 'recipient' && (
          <ScrollView scrollY enhanced showScrollbar={false}>
            {filteredRecipients.length > 0 ? (
              filteredRecipients.map(recipient => (
                <View
                  key={recipient.id}
                  className={styles.recipientCard}
                  onClick={() => handleRecipientClick(recipient.id)}
                >
                  <View className={styles.recipientAvatar}>
                    <Text className={styles.avatarText}>{recipient.name.charAt(0)}</Text>
                  </View>
                  <View className={styles.recipientInfo}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', marginBottom: '8rpx' }}>
                      <Text className={styles.recipientName}>{recipient.name}</Text>
                      <StatusTag
                        text={RECIPIENT_STATUS_MAP[recipient.status]}
                        type={getStatusType(recipient.status)}
                        size="small"
                      />
                    </View>
                    <Text className={styles.recipientDetail}>
                      {recipient.gender === 'male' ? '男' : '女'} · {recipient.age}岁 · {recipient.phone}
                    </Text>
                    <Text className={styles.recipientType}>
                      {QUALIFICATION_TYPE_MAP[recipient.qualificationType]} · 资格有效期至 {formatDate(recipient.qualificationExpiry)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <EmptyState
                  title="暂无受助人"
                  description="没有找到符合条件的受助人"
                  icon="👥"
                />
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'record' && (
          <ScrollView scrollY enhanced showScrollbar={false}>
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <View
                  key={record.id}
                  className={styles.recordCard}
                  onClick={() => handleRecordClick(record.id)}
                >
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordDrug}>{record.drugName}</Text>
                    <StatusTag
                      text={DISTRIBUTION_STATUS_MAP[record.status]}
                      type={getStatusType(record.status)}
                      size="small"
                    />
                  </View>
                  <View className={styles.recordBody}>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordLabel}>规格</Text>
                      <Text className={styles.recordValue}>{record.spec}</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordLabel}>数量</Text>
                      <Text className={styles.recordValue}>{record.quantity} {record.unit}</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordLabel}>金额</Text>
                      <Text className={styles.recordValue}>¥{record.amount.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View className={styles.recordFooter}>
                    <Text className={styles.recordRecipient}>受助人：{record.recipientName}</Text>
                    <Text className={styles.recordTime}>{formatDateTime(record.distributeTime)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <EmptyState
                  title="暂无发放记录"
                  description="没有找到符合条件的发放记录"
                  icon="📋"
                />
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'review' && (
          <ScrollView scrollY enhanced showScrollbar={false}>
            {pendingReviews.length > 0 ? (
              pendingReviews.map(review => (
                <View key={review.id} className={styles.qualificationItem}>
                  <View className={styles.qualificationHeader}>
                    <Text className={styles.qualificationName}>{review.recipientName}</Text>
                    <StatusTag
                      text={REVIEW_STATUS_MAP[review.status]}
                      type={getStatusType(review.status)}
                      size="small"
                    />
                  </View>
                  <View className={styles.qualificationBody}>
                    <View className={styles.qualificationInfo}>
                      <Text className={styles.qualificationLabel}>资格类型</Text>
                      <Text className={styles.qualificationValue}>
                        {QUALIFICATION_TYPE_MAP[review.qualificationType]}
                      </Text>
                    </View>
                    <View className={styles.qualificationInfo}>
                      <Text className={styles.qualificationLabel}>资格证号</Text>
                      <Text className={styles.qualificationValue}>{review.qualificationNo}</Text>
                    </View>
                  </View>
                  <Text className={styles.qualificationApplyTime}>
                    申请时间：{formatDateTime(review.applyTime)}
                  </Text>
                  <View className={styles.reviewActions} style={{ marginTop: '24rpx' }}>
                    <View
                      className={classnames(styles.reviewBtn, styles.reject)}
                      onClick={() => handleReviewReject(review.id)}
                    >
                      驳回
                    </View>
                    <View
                      className={classnames(styles.reviewBtn, styles.approve)}
                      onClick={() => handleReviewApprove(review.id)}
                    >
                      通过
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <EmptyState
                  title="暂无待审核"
                  description="所有资格审核已处理完毕"
                  icon="✅"
                />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default DistributionPage;
