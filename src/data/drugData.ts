import type { Drug, DrugBatch, ExpiryWarning } from '../types/drug';
import { daysFromNow, addMonths, addDays } from '../utils/date';

const now = new Date();

export const mockDrugs: Drug[] = [
  {
    id: 'drug001',
    name: '阿莫西林胶囊',
    genericName: 'Amoxicillin',
    spec: '0.25g*24粒/盒',
    manufacturer: '华北制药股份有限公司',
    category: 'antibiotic',
    unit: '盒',
    price: 15.8,
    totalStock: 520,
    batchCount: 3,
    status: 'normal',
    createTime: '2025-01-15'
  },
  {
    id: 'drug002',
    name: '硝苯地平缓释片',
    genericName: 'Nifedipine',
    spec: '10mg*30片/瓶',
    manufacturer: '拜耳医药保健有限公司',
    category: 'cardiovascular',
    unit: '瓶',
    price: 32.5,
    totalStock: 280,
    batchCount: 2,
    status: 'expiring_soon',
    createTime: '2025-02-20'
  },
  {
    id: 'drug003',
    name: '奥美拉唑肠溶胶囊',
    genericName: 'Omeprazole',
    spec: '20mg*14粒/盒',
    manufacturer: '阿斯利康制药有限公司',
    category: 'gastrointestinal',
    unit: '盒',
    price: 48.0,
    totalStock: 150,
    batchCount: 2,
    status: 'normal',
    createTime: '2025-03-10'
  },
  {
    id: 'drug004',
    name: '盐酸氨溴索口服溶液',
    genericName: 'Ambroxol',
    spec: '100ml:0.3g/瓶',
    manufacturer: '勃林格殷格翰药业有限公司',
    category: 'respiratory',
    unit: '瓶',
    price: 25.6,
    totalStock: 80,
    batchCount: 1,
    status: 'low_stock',
    createTime: '2025-04-05'
  },
  {
    id: 'drug005',
    name: '布洛芬缓释胶囊',
    genericName: 'Ibuprofen',
    spec: '0.3g*20粒/盒',
    manufacturer: '中美天津史克制药有限公司',
    category: 'antipyretic',
    unit: '盒',
    price: 18.9,
    totalStock: 0,
    batchCount: 0,
    status: 'expired',
    createTime: '2025-01-20'
  },
  {
    id: 'drug006',
    name: '维生素C片',
    genericName: 'Vitamin C',
    spec: '100mg*100片/瓶',
    manufacturer: '东北制药集团股份有限公司',
    category: 'vitamin',
    unit: '瓶',
    price: 8.5,
    totalStock: 600,
    batchCount: 2,
    status: 'normal',
    createTime: '2025-05-15'
  },
  {
    id: 'drug007',
    name: '头孢克肟分散片',
    genericName: 'Cefixime',
    spec: '0.1g*6片/盒',
    manufacturer: '广州白云山制药股份有限公司',
    category: 'antibiotic',
    unit: '盒',
    price: 28.0,
    totalStock: 200,
    batchCount: 2,
    status: 'normal',
    createTime: '2025-03-25'
  },
  {
    id: 'drug008',
    name: '复方丹参滴丸',
    genericName: 'Compound Danshen',
    spec: '27mg*180丸/瓶',
    manufacturer: '天士力制药集团股份有限公司',
    category: 'cardiovascular',
    unit: '瓶',
    price: 56.8,
    totalStock: 45,
    batchCount: 1,
    status: 'low_stock',
    createTime: '2025-02-28'
  },
  {
    id: 'drug009',
    name: '蒙脱石散',
    genericName: 'Montmorillonite',
    spec: '3g*10袋/盒',
    manufacturer: '博福-益普生(天津)制药有限公司',
    category: 'gastrointestinal',
    unit: '盒',
    price: 22.0,
    totalStock: 320,
    batchCount: 3,
    status: 'normal',
    createTime: '2025-04-18'
  },
  {
    id: 'drug010',
    name: '连花清瘟胶囊',
    genericName: 'Lianhua Qingwen',
    spec: '0.35g*48粒/盒',
    manufacturer: '石家庄以岭药业股份有限公司',
    category: 'respiratory',
    unit: '盒',
    price: 14.8,
    totalStock: 0,
    batchCount: 0,
    status: 'locked',
    createTime: '2025-03-08'
  }
];

export const mockDrugBatches: DrugBatch[] = [
  {
    id: 'batch001',
    drugId: 'drug001',
    drugName: '阿莫西林胶囊',
    batchNo: '20250115',
    spec: '0.25g*24粒/盒',
    quantity: 200,
    remainingQuantity: 200,
    expiryDate: addMonths(now, 12).toISOString().split('T')[0],
    productionDate: '2025-01-10',
    manufacturer: '华北制药股份有限公司',
    unit: '盒',
    price: 15.8,
    status: 'normal',
    storageLocation: 'A区-01架-03层',
    receiveTime: '2025-01-15 09:30:00',
    receivePerson: '张药师',
    supplier: '华北制药销售公司',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch002',
    drugId: 'drug001',
    drugName: '阿莫西林胶囊',
    batchNo: '20250320',
    spec: '0.25g*24粒/盒',
    quantity: 180,
    remainingQuantity: 180,
    expiryDate: addMonths(now, 15).toISOString().split('T')[0],
    productionDate: '2025-03-15',
    manufacturer: '华北制药股份有限公司',
    unit: '盒',
    price: 15.8,
    status: 'normal',
    storageLocation: 'A区-01架-02层',
    receiveTime: '2025-03-20 14:00:00',
    receivePerson: '张药师',
    supplier: '华北制药销售公司',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch003',
    drugId: 'drug001',
    drugName: '阿莫西林胶囊',
    batchNo: '20240610',
    spec: '0.25g*24粒/盒',
    quantity: 140,
    remainingQuantity: 140,
    expiryDate: addDays(now, 45).toISOString().split('T')[0],
    productionDate: '2024-06-05',
    manufacturer: '华北制药股份有限公司',
    unit: '盒',
    price: 15.8,
    status: 'expiring_soon',
    storageLocation: 'A区-01架-01层',
    receiveTime: '2024-06-10 10:00:00',
    receivePerson: '李药师',
    supplier: '华北制药销售公司',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch004',
    drugId: 'drug002',
    drugName: '硝苯地平缓释片',
    batchNo: '20240820',
    spec: '10mg*30片/瓶',
    quantity: 150,
    remainingQuantity: 150,
    expiryDate: addDays(now, 25).toISOString().split('T')[0],
    productionDate: '2024-08-15',
    manufacturer: '拜耳医药保健有限公司',
    unit: '瓶',
    price: 32.5,
    status: 'expiring_soon',
    storageLocation: 'B区-02架-02层',
    receiveTime: '2024-08-20 16:30:00',
    receivePerson: '王药师',
    supplier: '拜耳医药销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch005',
    drugId: 'drug002',
    drugName: '硝苯地平缓释片',
    batchNo: '20250210',
    spec: '10mg*30片/瓶',
    quantity: 130,
    remainingQuantity: 130,
    expiryDate: addMonths(now, 10).toISOString().split('T')[0],
    productionDate: '2025-02-05',
    manufacturer: '拜耳医药保健有限公司',
    unit: '瓶',
    price: 32.5,
    status: 'normal',
    storageLocation: 'B区-02架-03层',
    receiveTime: '2025-02-10 11:00:00',
    receivePerson: '王药师',
    supplier: '拜耳医药销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch006',
    drugId: 'drug003',
    drugName: '奥美拉唑肠溶胶囊',
    batchNo: '20250105',
    spec: '20mg*14粒/盒',
    quantity: 100,
    remainingQuantity: 100,
    expiryDate: addMonths(now, 8).toISOString().split('T')[0],
    productionDate: '2025-01-01',
    manufacturer: '阿斯利康制药有限公司',
    unit: '盒',
    price: 48.0,
    status: 'normal',
    storageLocation: 'C区-01架-01层',
    receiveTime: '2025-01-05 13:45:00',
    receivePerson: '张药师',
    supplier: '阿斯利康销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch007',
    drugId: 'drug003',
    drugName: '奥美拉唑肠溶胶囊',
    batchNo: '20240918',
    spec: '20mg*14粒/盒',
    quantity: 50,
    remainingQuantity: 50,
    expiryDate: addDays(now, -10).toISOString().split('T')[0],
    productionDate: '2024-09-10',
    manufacturer: '阿斯利康制药有限公司',
    unit: '盒',
    price: 48.0,
    status: 'expired',
    storageLocation: 'C区-01架-01层',
    receiveTime: '2024-09-18 09:00:00',
    receivePerson: '李药师',
    supplier: '阿斯利康销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch008',
    drugId: 'drug004',
    drugName: '盐酸氨溴索口服溶液',
    batchNo: '20241205',
    spec: '100ml:0.3g/瓶',
    quantity: 80,
    remainingQuantity: 80,
    expiryDate: addMonths(now, 6).toISOString().split('T')[0],
    productionDate: '2024-12-01',
    manufacturer: '勃林格殷格翰药业有限公司',
    unit: '瓶',
    price: 25.6,
    status: 'normal',
    storageLocation: 'D区-03架-02层',
    receiveTime: '2024-12-05 15:20:00',
    receivePerson: '王药师',
    supplier: '勃林格殷格翰销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch009',
    drugId: 'drug006',
    drugName: '维生素C片',
    batchNo: '20250301',
    spec: '100mg*100片/瓶',
    quantity: 300,
    remainingQuantity: 300,
    expiryDate: addMonths(now, 18).toISOString().split('T')[0],
    productionDate: '2025-02-25',
    manufacturer: '东北制药集团股份有限公司',
    unit: '瓶',
    price: 8.5,
    status: 'normal',
    storageLocation: 'E区-01架-01层',
    receiveTime: '2025-03-01 10:30:00',
    receivePerson: '张药师',
    supplier: '东北制药销售公司',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch010',
    drugId: 'drug006',
    drugName: '维生素C片',
    batchNo: '20250415',
    spec: '100mg*100片/瓶',
    quantity: 300,
    remainingQuantity: 300,
    expiryDate: addMonths(now, 20).toISOString().split('T')[0],
    productionDate: '2025-04-10',
    manufacturer: '东北制药集团股份有限公司',
    unit: '瓶',
    price: 8.5,
    status: 'normal',
    storageLocation: 'E区-01架-02层',
    receiveTime: '2025-04-15 14:00:00',
    receivePerson: '李药师',
    supplier: '东北制药销售公司',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch011',
    drugId: 'drug007',
    drugName: '头孢克肟分散片',
    batchNo: '20250220',
    spec: '0.1g*6片/盒',
    quantity: 100,
    remainingQuantity: 100,
    expiryDate: addMonths(now, 14).toISOString().split('T')[0],
    productionDate: '2025-02-15',
    manufacturer: '广州白云山制药股份有限公司',
    unit: '盒',
    price: 28.0,
    status: 'normal',
    storageLocation: 'A区-02架-01层',
    receiveTime: '2025-02-20 09:30:00',
    receivePerson: '王药师',
    supplier: '白云山制药销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch012',
    drugId: 'drug007',
    drugName: '头孢克肟分散片',
    batchNo: '20240805',
    spec: '0.1g*6片/盒',
    quantity: 100,
    remainingQuantity: 100,
    expiryDate: addDays(now, 15).toISOString().split('T')[0],
    productionDate: '2024-08-01',
    manufacturer: '广州白云山制药股份有限公司',
    unit: '盒',
    price: 28.0,
    status: 'locked',
    storageLocation: 'A区-02架-02层',
    receiveTime: '2024-08-05 16:00:00',
    receivePerson: '张药师',
    supplier: '白云山制药销售部',
    inspectionStatus: 'pending',
    inspectionRemark: '质量抽检中，暂锁定不可出库'
  },
  {
    id: 'batch013',
    drugId: 'drug008',
    drugName: '复方丹参滴丸',
    batchNo: '20241110',
    spec: '27mg*180丸/瓶',
    quantity: 45,
    remainingQuantity: 45,
    expiryDate: addDays(now, 60).toISOString().split('T')[0],
    productionDate: '2024-11-05',
    manufacturer: '天士力制药集团股份有限公司',
    unit: '瓶',
    price: 56.8,
    status: 'expiring_soon',
    storageLocation: 'B区-03架-01层',
    receiveTime: '2024-11-10 10:00:00',
    receivePerson: '李药师',
    supplier: '天士力销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch014',
    drugId: 'drug009',
    drugName: '蒙脱石散',
    batchNo: '20250315',
    spec: '3g*10袋/盒',
    quantity: 120,
    remainingQuantity: 120,
    expiryDate: addMonths(now, 11).toISOString().split('T')[0],
    productionDate: '2025-03-10',
    manufacturer: '博福-益普生(天津)制药有限公司',
    unit: '盒',
    price: 22.0,
    status: 'normal',
    storageLocation: 'C区-02架-01层',
    receiveTime: '2025-03-15 14:30:00',
    receivePerson: '张药师',
    supplier: '博福益普生销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch015',
    drugId: 'drug009',
    drugName: '蒙脱石散',
    batchNo: '20250108',
    spec: '3g*10袋/盒',
    quantity: 100,
    remainingQuantity: 100,
    expiryDate: addMonths(now, 9).toISOString().split('T')[0],
    productionDate: '2025-01-03',
    manufacturer: '博福-益普生(天津)制药有限公司',
    unit: '盒',
    price: 22.0,
    status: 'normal',
    storageLocation: 'C区-02架-02层',
    receiveTime: '2025-01-08 11:00:00',
    receivePerson: '王药师',
    supplier: '博福益普生销售部',
    inspectionStatus: 'passed'
  },
  {
    id: 'batch016',
    drugId: 'drug009',
    drugName: '蒙脱石散',
    batchNo: '20241020',
    spec: '3g*10袋/盒',
    quantity: 100,
    remainingQuantity: 100,
    expiryDate: addDays(now, 20).toISOString().split('T')[0],
    productionDate: '2024-10-15',
    manufacturer: '博福-益普生(天津)制药有限公司',
    unit: '盒',
    price: 22.0,
    status: 'expiring_soon',
    storageLocation: 'C区-02架-03层',
    receiveTime: '2024-10-20 09:30:00',
    receivePerson: '李药师',
    supplier: '博福益普生销售部',
    inspectionStatus: 'passed'
  }
];

export function generateExpiryWarnings(batchesInput?: DrugBatch[]): ExpiryWarning[] {
  const warnings: ExpiryWarning[] = [];
  const targetBatches = batchesInput && batchesInput.length > 0 ? batchesInput : mockDrugBatches;

  targetBatches.forEach(batch => {
    const daysRemaining = daysFromNow(batch.expiryDate);
    let warningLevel: 'severe' | 'warning' | 'reminder' | null = null;

    if (daysRemaining < 0) {
      warningLevel = 'severe';
    } else if (daysRemaining <= 30) {
      warningLevel = 'severe';
    } else if (daysRemaining <= 90) {
      warningLevel = 'warning';
    } else if (daysRemaining <= 180) {
      warningLevel = 'reminder';
    }

    if (warningLevel) {
      warnings.push({
        id: `warn_${batch.id}`,
        drugId: batch.drugId,
        drugName: batch.drugName,
        batchId: batch.id,
        batchNo: batch.batchNo,
        spec: batch.spec,
        remainingQuantity: batch.remainingQuantity,
        unit: batch.unit,
        expiryDate: batch.expiryDate,
        daysRemaining,
        warningLevel
      });
    }
  });

  return warnings.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getBatchesByDrugId(drugId: string): DrugBatch[] {
  return mockDrugBatches.filter(batch => batch.drugId === drugId);
}

export function getDrugById(drugId: string): Drug | undefined {
  return mockDrugs.find(drug => drug.id === drugId);
}

export function getBatchById(batchId: string): DrugBatch | undefined {
  return mockDrugBatches.find(batch => batch.id === batchId);
}
