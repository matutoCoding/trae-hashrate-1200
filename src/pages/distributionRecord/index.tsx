import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '../../components/StatusTag';
import { useAppStore } from '../../store';
import {
  DISTRIBUTION_STATUS_MAP,
  QUALIFICATION_TYPE_MAP,
  PICKUP_METHOD_MAP
} from '../../types/distribution';
import { formatDateTime } from '../../utils/date';

const DistributionRecordPage: React.FC = () => {
  const [recordId, setRecordId] = useState<string>('');
  const [recipientId, setRecipientId] = useState<string>('');
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pickUpMethod, setPickUpMethod] = useState<'self' | 'family' | 'delivery'>('self');
  const [pickUpPerson, setPickUpPerson] = useState('');
  const [pickUpPersonIdCard, setPickUpPersonIdCard] = useState('');
  const [remark, setRemark] = useState('');
  const [showDrugPicker, setShowDrugPicker] = useState(false);

  const distributionRecords = useAppStore(state => state.distributionRecords);
  const recipients = useAppStore(state => state.recipients);
  const drugs = useAppStore(state => state.drugs);
  const batches = useAppStore(state => state.batches);
  const reservedQuantities = useAppStore(state => state.reservedQuantities);
  const createDistribution = useAppStore(state => state.createDistribution);

  const record = useMemo(() => {
    return distributionRecords.find(r => r.id === recordId);
  }, [distributionRecords, recordId]);

  const recipient = useMemo(() => {
    const targetId = record?.recipientId || recipientId;
    return recipients.find(r => r.id === targetId);
  }, [record, recipient, recipients]);

  const availableDrugs = useMemo(() => {
    return drugs.map(drug => {
      const drugBatches = batches.filter(b => b.drugId === drug.id && b.status === 'normal');
      const totalAvailable = drugBatches.reduce((sum, b) => {
        const reserved = reservedQuantities[b.id] || 0;
        return sum + (b.remainingQuantity - reserved);
      }, 0);
      return { ...drug, totalAvailable };
    }).filter(d => d.totalAvailable > 0);
  }, [drugs, batches, reservedQuantities]);

  const selectedDrug = useMemo(() => {
    return drugs.find(d => d.id === selectedDrugId);
  }, [drugs, selectedDrugId]);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params = (currentPage as any).options || (currentPage as any).$router?.params || {};
    const id = params.id || '';
    const recId = params.recipientId || '';

    if (recId) {
      setIsNewRecord(true);
      setRecipientId(recId);
      console.log('[DistributionRecord] 新建发放登记，受助人:', recId);
    } else if (id) {
      setRecordId(id);
      console.log('[DistributionRecord] 发放记录详情:', id);
    }
  }, []);

  const handleSubmit = () => {
    if (!selectedDrugId) {
      Taro.showToast({ title: '请选择药品', icon: 'none' });
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      Taro.showToast({ title: '请输入正确的数量', icon: 'none' });
      return;
    }
    if (pickUpMethod === 'family' && (!pickUpPerson || !pickUpPersonIdCard)) {
      Taro.showToast({ title: '请填写代领人信息', icon: 'none' });
      return;
    }

    const result = createDistribution({
      recipientId: recipientId || recipient?.id || '',
      drugId: selectedDrugId,
      quantity: parseInt(quantity),
      distributor: '当前用户',
      pickUpMethod,
      pickUpPerson,
      pickUpPersonIdCard,
      remark
    });

    if (result.success) {
      Taro.showToast({ title: '发放登记成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } else {
      Taro.showToast({ title: result.message, icon: 'none' });
    }
  };

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

  if (isNewRecord && recipient) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>新建发放登记</Text>
          <Text className={styles.headerSubtitle}>受助人：{recipient.name}</Text>
        </View>

        <View className={styles.content}>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>受助人信息</Text>
            <View className={styles.recipientCard}>
              <View className={styles.avatar}>
                <Text className={styles.avatarText}>{recipient.name.charAt(0)}</Text>
              </View>
              <View className={styles.recipientInfo}>
                <Text className={styles.recipientName}>{recipient.name}</Text>
                <Text className={styles.recipientDetail}>
                  {recipient.phone} · {recipient.idCard}
                </Text>
                <Text className={styles.recipientDetail} style={{ marginTop: '4rpx' }}>
                  {QUALIFICATION_TYPE_MAP[recipient.qualificationType]}
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>选择药品</Text>
            <View className={styles.drugPicker} onClick={() => setShowDrugPicker(true)}>
              {selectedDrug ? (
                <>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '30rpx', color: '#1d2129', fontWeight: '500' }}>
                      {selectedDrug.name}
                    </Text>
                    <Text style={{ fontSize: '24rpx', color: '#86909c', marginTop: '4rpx', display: 'block' }}>
                      {selectedDrug.spec} · 可用库存 {availableDrugs.find(d => d.id === selectedDrugId)?.totalAvailable || 0} {selectedDrug.unit}
                    </Text>
                  </View>
                  <Text style={{ color: '#165dff', fontSize: '28rpx' }}>更换</Text>
                </>
              ) : (
                <Text style={{ color: '#86909c' }}>点击选择药品</Text>
              )}
            </View>

            {selectedDrugId && (
              <>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>发放数量</Text>
                  <Input
                    className={styles.formInput}
                    type="number"
                    placeholder="请输入发放数量"
                    value={quantity}
                    onInput={(e) => setQuantity(e.detail.value)}
                  />
                </View>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>领取方式</Text>
                  <View className={styles.formOptions}>
                    {[
                      { key: 'self', label: '本人领取' },
                      { key: 'family', label: '家属代领' },
                      { key: 'delivery', label: '邮寄' }
                    ].map(opt => (
                      <View
                        key={opt.key}
                        className={classnames(styles.formOption, pickUpMethod === opt.key && styles.formOptionActive)}
                        onClick={() => setPickUpMethod(opt.key as any)}
                      >
                        <Text>{opt.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {pickUpMethod === 'family' && (
                  <>
                    <View className={styles.formItem}>
                      <Text className={styles.formLabel}>代领人姓名</Text>
                      <Input
                        className={styles.formInput}
                        placeholder="请输入代领人姓名"
                        value={pickUpPerson}
                        onInput={(e) => setPickUpPerson(e.detail.value)}
                      />
                    </View>
                    <View className={styles.formItem}>
                      <Text className={styles.formLabel}>代领人身份证</Text>
                      <Input
                        className={styles.formInput}
                        placeholder="请输入代领人身份证号"
                        value={pickUpPersonIdCard}
                        onInput={(e) => setPickUpPersonIdCard(e.detail.value)}
                      />
                    </View>
                  </>
                )}

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>备注</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="选填"
                    value={remark}
                    onInput={(e) => setRemark(e.detail.value)}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {selectedDrugId && (
          <View className={styles.actionBar}>
            <View className={styles.submitBtn} onClick={handleSubmit}>
              <Text style={{ color: '#fff' }}>确认发放</Text>
            </View>
          </View>
        )}

        {showDrugPicker && (
          <View className={styles.modalOverlay} onClick={() => setShowDrugPicker(false)}>
            <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <View className={styles.modalHeader}>
                <Text className={styles.modalTitle}>选择药品</Text>
                <Text className={styles.modalClose} onClick={() => setShowDrugPicker(false)}>×</Text>
              </View>
              <ScrollView scrollY style={{ maxHeight: '600rpx' }}>
                {availableDrugs.length > 0 ? (
                  availableDrugs.map(drug => (
                    <View
                      key={drug.id}
                      className={styles.drugOption}
                      onClick={() => {
                        setSelectedDrugId(drug.id);
                        setShowDrugPicker(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: '30rpx', color: '#1d2129', fontWeight: '500' }}>
                          {drug.name}
                        </Text>
                        <Text style={{ fontSize: '24rpx', color: '#86909c', marginTop: '4rpx', display: 'block' }}>
                          {drug.spec} · 可用 {drug.totalAvailable} {drug.unit}
                        </Text>
                      </View>
                      <Text style={{ color: '#165dff' }}>{selectedDrugId === drug.id ? '✓' : ''}</Text>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: '80rpx 0', textAlign: 'center' }}>
                    <Text style={{ color: '#86909c' }}>暂无可用库存药品</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

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
