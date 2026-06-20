import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '../../components/StatusTag';
import { useAppStore } from '../../store';
import {
  QUALIFICATION_TYPE_MAP,
  RECIPIENT_STATUS_MAP,
  REVIEW_STATUS_MAP
} from '../../types/distribution';
import { formatDate, formatDateTime } from '../../utils/date';

const QualificationReviewPage: React.FC = () => {
  const [reviewId, setReviewId] = useState<string>('');
  const [isListMode, setIsListMode] = useState(true);
  const [remark, setRemark] = useState('');

  const qualificationReviews = useAppStore(state => state.qualificationReviews);
  const recipients = useAppStore(state => state.recipients);
  const processQualificationReview = useAppStore(state => state.processQualificationReview);

  const pendingList = useMemo(() => {
    return qualificationReviews.filter(r => r.status === 'pending');
  }, [qualificationReviews]);

  const review = useMemo(() => {
    return qualificationReviews.find(r => r.id === reviewId);
  }, [qualificationReviews, reviewId]);

  const recipient = useMemo(() => {
    if (review) {
      return recipients.find(r => r.id === review.recipientId);
    }
    return null;
  }, [review, recipients]);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params = (currentPage as any).options || (currentPage as any).$router?.params || {};
    const id = params.id || '';

    if (id) {
      setIsListMode(false);
      setReviewId(id);
      console.log('[QualificationReview] 审核详情:', id);
    } else {
      setIsListMode(true);
      console.log('[QualificationReview] 待审核列表:', pendingList.length);
    }
  }, []);

  const handleApprove = () => {
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
            remark: res.content || remark || '',
            reviewer: '当前用户'
          });
          if (result.success) {
            Taro.showToast({ title: result.message, icon: 'success' });
            console.log('[QualificationReview] 审核通过:', reviewId, res.content);
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
            console.log('[QualificationReview] 审核驳回:', reviewId, res.content);
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

  const handleReviewClick = (reviewId: string) => {
    Taro.navigateTo({
      url: `/pages/qualificationReview/index?id=${reviewId}`
    });
  };

  const getStatusType = (status: string) => {
    switch (status) {
      case 'approved':
      case 'qualified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'disqualified':
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isListMode) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>受助资格审核</Text>
          <Text className={styles.headerSubtitle}>
            待审核 {pendingList.length} 条
          </Text>
        </View>

        <View className={styles.content}>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>待审核列表</Text>
            {pendingList.length > 0 ? (
              pendingList.map(item => (
                <View
                  key={item.id}
                  className={styles.reviewItem}
                  onClick={() => handleReviewClick(item.id)}
                  style={{
                    padding: '24rpx 0',
                    borderBottom: '1rpx solid #f2f3f5'
                  }}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12rpx' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500', color: '#1d2129' }}>
                      {item.recipientName}
                    </Text>
                    <StatusTag
                      text={REVIEW_STATUS_MAP[item.status]}
                      type={getStatusType(item.status)}
                      size="small"
                    />
                  </View>
                  <Text style={{ fontSize: '24rpx', color: '#86909c', marginBottom: '8rpx', display: 'block' }}>
                    {QUALIFICATION_TYPE_MAP[item.qualificationType]} · {item.qualificationNo}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#86909c' }}>
                    申请时间：{formatDateTime(item.applyTime)}
                  </Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyWrap}>
                <Text className={styles.emptyIcon}>✅</Text>
                <Text className={styles.emptyText}>暂无待审核记录</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (!review) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    );
  }

  const canReview = review.status === 'pending';

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>资格审核详情</Text>
        <Text className={styles.headerSubtitle}>
          {REVIEW_STATUS_MAP[review.status]}
        </Text>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>申请人信息</Text>
          <View className={styles.recipientCard}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>{review.recipientName.charAt(0)}</Text>
            </View>
            <View className={styles.recipientInfo}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className={styles.recipientName}>{review.recipientName}</Text>
                <StatusTag
                  text={QUALIFICATION_TYPE_MAP[review.qualificationType]}
                  type="info"
                  size="small"
                />
              </View>
              <Text className={styles.recipientDetail}>身份证：{review.idCard}</Text>
              <Text className={styles.recipientDetail}>资格证号：{review.qualificationNo}</Text>
            </View>
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(review.applyTime)}</Text>
          </View>

          {review.reviewer && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>审核人</Text>
              <Text className={styles.infoValue}>{review.reviewer}</Text>
            </View>
          )}

          {review.reviewTime && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>审核时间</Text>
              <Text className={styles.infoValue}>{formatDateTime(review.reviewTime)}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>申请材料</Text>
          <View className={styles.materialList}>
            {review.materials.map((material: string, index: number) => (
              <View key={index} className={styles.materialItem}>
                <Text className={styles.materialIcon}>📄</Text>
                <Text className={styles.materialName}>{material}</Text>
              </View>
            ))}
          </View>
        </View>

        {review.reviewRemark && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>审核意见</Text>
            <View className={styles.reviewHistory}>
              <Text
                className={styles.reviewResult}
                style={{ color: review.status === 'approved' ? '#00b42a' : '#f53f3f' }}
              >
                {REVIEW_STATUS_MAP[review.status]}
              </Text>
              <Text className={styles.reviewRemark}>{review.reviewRemark}</Text>
            </View>
          </View>
        )}

        {canReview && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>审核意见</Text>
            <Textarea
              className={styles.remarkInput}
              placeholder="请输入审核意见（选填）"
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
          </View>
        )}
      </View>

      {canReview && (
        <View className={styles.actionBar}>
          <View className={styles.actionBtn} style={{ background: '#ffece8', color: '#f53f3f' }} onClick={handleReject}>
            驳回
          </View>
          <View className={styles.actionBtn} style={{ background: 'linear-gradient(135deg, #00b42a 0%, #33c255 100%)', color: '#fff' }} onClick={handleApprove}>
            通过
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default QualificationReviewPage;
