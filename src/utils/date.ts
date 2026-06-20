// 日期工具函数

export const EXPIRY_WARNING_DAYS_SEVERE = 30;
export const EXPIRY_WARNING_DAYS_WARNING = 90;
export const EXPIRY_WARNING_DAYS_REMINDER = 180;

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

export function formatFullDateTime(date: string | Date): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : new Date(date1.getTime());
  const d2 = typeof date2 === 'string' ? new Date(date2) : new Date(date2.getTime());

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function daysFromNow(date: string | Date): number {
  return daysBetween(new Date(), date);
}

export function isExpired(expiryDate: string | Date): boolean {
  return daysFromNow(expiryDate) < 0;
}

export function isExpiringSoon(expiryDate: string | Date, days: number = 90): boolean {
  const daysRemaining = daysFromNow(expiryDate);
  return daysRemaining >= 0 && daysRemaining <= days;
}

export function getExpiryWarningLevel(expiryDate: string | Date): 'severe' | 'warning' | 'reminder' | null {
  const daysRemaining = daysFromNow(expiryDate);

  if (daysRemaining < 0) {
    return 'severe';
  }
  if (daysRemaining <= EXPIRY_WARNING_DAYS_SEVERE) {
    return 'severe';
  }
  if (daysRemaining <= EXPIRY_WARNING_DAYS_WARNING) {
    return 'warning';
  }
  if (daysRemaining <= EXPIRY_WARNING_DAYS_REMINDER) {
    return 'reminder';
  }
  return null;
}

export function getExpiryStatusText(expiryDate: string | Date): string {
  const daysRemaining = daysFromNow(expiryDate);

  if (daysRemaining < 0) {
    return `已过期 ${Math.abs(daysRemaining)} 天`;
  }
  if (daysRemaining === 0) {
    return '今日到期';
  }
  if (daysRemaining <= 30) {
    return `剩余 ${daysRemaining} 天（临期）`;
  }
  return `剩余 ${daysRemaining} 天`;
}

export function getBatchStatus(expiryDate: string | Date, remainingQuantity: number, isLocked: boolean = false): string {
  if (isLocked) {
    return 'locked';
  }
  if (remainingQuantity <= 0) {
    return 'used_up';
  }
  const warningLevel = getExpiryWarningLevel(expiryDate);
  if (warningLevel === 'severe' && daysFromNow(expiryDate) < 0) {
    return 'expired';
  }
  if (warningLevel) {
    return 'expiring_soon';
  }
  return 'normal';
}

export function addDays(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: string | Date, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
