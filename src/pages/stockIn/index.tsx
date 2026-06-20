import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '../../store';

const StockInPage: React.FC = () => {
  const drugs = useAppStore(state => state.drugs);
  const addStockIn = useAppStore(state => state.addStockIn);

  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(-1);
  const [formData, setFormData] = useState({
    drugId: '',
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

  const drugOptions = useMemo(() => {
    return drugs.map(d => `${d.name} (${d.spec})`);
  }, [drugs]);

  const handleDrugSelect = (e: any) => {
    const index = Number(e.detail.value);
    setSelectedDrugIndex(index);
    const drug = drugs[index];
    if (drug) {
      setFormData(prev => ({
        ...prev,
        drugId: drug.id,
        drugName: drug.name,
        spec: drug.spec,
        unit: drug.unit,
        manufacturer: drug.manufacturer
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.drugId || !formData.batchNo || !formData.quantity || !formData.expiryDate) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }

    const quantity = Number(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      Taro.showToast({ title: '请输入有效数量', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认入库',
      content: `确认将 ${formData.drugName} (批号: ${formData.batchNo}, 数量: ${quantity} ${formData.unit}) 验收入库？`,
      success: (res) => {
        if (res.confirm) {
          addStockIn({
            drugId: formData.drugId,
            drugName: formData.drugName,
            batchNo: formData.batchNo,
            spec: formData.spec,
            quantity,
            unit: formData.unit,
            expiryDate: formData.expiryDate,
            productionDate: formData.productionDate,
            manufacturer: formData.manufacturer,
            supplier: formData.supplier,
            receivePerson: formData.receivePerson || '当前用户',
            inspectionStatus: 'passed',
            inspectionRemark: formData.remark,
            remark: formData.remark
          });
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
          <Text className={styles.formLabel}>选择药品 *</Text>
          <Picker
            mode="selector"
            range={drugOptions}
            value={selectedDrugIndex >= 0 ? selectedDrugIndex : 0}
            onChange={handleDrugSelect}
          >
            <View className={styles.formInput}>
              <Text style={{ color: selectedDrugIndex >= 0 ? '#1d2129' : '#c9cdd4' }}>
                {selectedDrugIndex >= 0 ? drugOptions[selectedDrugIndex] : '请选择入库药品'}
              </Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>药品名称</Text>
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
