import React, { useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const StockInPage: React.FC = () => {
  const [formData, setFormData] = useState({
    drugName: '',
    batchNo: '',
    spec: '',
    quantity: '',
    unit: '盒',
    manufacturer: '',
    supplier: '',
    productionDate: '',
    expiryDate: '',
    storageLocation: '',
    receivePerson: '',
    remark: ''
  });

  const inspectionItems = [
    '包装完好，无破损',
    '标签清晰，信息完整',
    '药品性状正常',
    '随货同行单据齐全'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.drugName || !formData.batchNo || !formData.quantity) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认入库',
      content: `确认将 ${formData.drugName} (批号: ${formData.batchNo}) 验收入库？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '入库成功', icon: 'success' });
          console.log('[StockIn] 入库提交:', formData);
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.formCard}>
        <Text className={styles.formTitle}>药品信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>药品名称 *</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入药品名称"
            value={formData.drugName}
            onInput={(e) => handleInputChange('drugName', e.detail.value)}
          />
        </View>

        <View className={styles.formRow}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>批号 *</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入批号"
              value={formData.batchNo}
              onInput={(e) => handleInputChange('batchNo', e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>规格</Text>
            <Input
              className={styles.formInput}
              placeholder="如：0.25g*24粒"
              value={formData.spec}
              onInput={(e) => handleInputChange('spec', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formRow}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>数量 *</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="请输入数量"
              value={formData.quantity}
              onInput={(e) => handleInputChange('quantity', e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>单位</Text>
            <Input
              className={styles.formInput}
              placeholder="盒/瓶/支"
              value={formData.unit}
              onInput={(e) => handleInputChange('unit', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>生产厂家</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入生产厂家"
            value={formData.manufacturer}
            onInput={(e) => handleInputChange('manufacturer', e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>供应商</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入供应商"
            value={formData.supplier}
            onInput={(e) => handleInputChange('supplier', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>效期信息</Text>

        <View className={styles.formRow}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>生产日期</Text>
            <Input
              className={styles.formInput}
              placeholder="YYYY-MM-DD"
              value={formData.productionDate}
              onInput={(e) => handleInputChange('productionDate', e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>有效期至</Text>
            <Input
              className={styles.formInput}
              placeholder="YYYY-MM-DD"
              value={formData.expiryDate}
              onInput={(e) => handleInputChange('expiryDate', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>存放位置</Text>
          <Input
            className={styles.formInput}
            placeholder="如：A区-01架-02层"
            value={formData.storageLocation}
            onInput={(e) => handleInputChange('storageLocation', e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>验收人</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入验收人姓名"
            value={formData.receivePerson}
            onInput={(e) => handleInputChange('receivePerson', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>到货验收</Text>

        <View className={styles.inspectionSection}>
          <Text className={styles.inspectionTitle}>✓ 验收项目</Text>
          {inspectionItems.map((item, index) => (
            <View key={index} className={styles.inspectionItem}>
              <View className={styles.inspectionDot} />
              <Text className={styles.inspectionText}>{item}</Text>
            </View>
          ))}
        </View>

        <View className={styles.formItem} style={{ marginTop: '24rpx' }}>
          <Text className={styles.formLabel}>验收备注</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入验收备注..."
            value={formData.remark}
            onInput={(e) => handleInputChange('remark', e.detail.value)}
          />
        </View>
      </View>

      <View style={{ height: '160rpx' }} />

      <View className={styles.submitBtn} onClick={handleSubmit}>
        <Text className={styles.submitBtnText}>确认入库</Text>
      </View>
    </ScrollView>
  );
};

export default StockInPage;
