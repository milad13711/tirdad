export const generationStatusLabel = {
  PENDING: "در صف",
  PROCESSING: "در حال پردازش",
  COMPLETED: "تکمیل‌شده",
  FAILED: "ناموفق",
} as const;

export const generationStatusVariant = {
  PENDING: "outline",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
} as const;

export const orderStatusLabel = {
  PENDING: "در انتظار",
  PAID: "موفق",
  FAILED: "ناموفق",
  REFUNDED: "بازپرداخت‌شده",
} as const;

export const orderStatusVariant = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "destructive",
  REFUNDED: "outline",
} as const;

export const ticketStatusLabel = {
  OPEN: "در انتظار پاسخ",
  ANSWERED: "پاسخ داده‌شده",
  CLOSED: "بسته‌شده",
} as const;

export const ticketStatusVariant = {
  OPEN: "warning",
  ANSWERED: "success",
  CLOSED: "outline",
} as const;

export const leadSourceLabel = {
  DIRECT: "دایرکت",
  COMMENT: "کامنت",
  BIO_LINK: "لینک بایو",
  WEBSITE: "فرم سایت",
} as const;

export const leadStageLabel = {
  NEW: "جدید",
  CONTACTED: "تماس گرفته شد",
  OFFERED: "پیشنهاد ارسال شد",
  CONVERTED: "تبدیل شد",
  LOST: "لغو شد",
} as const;

export const aiToolTypeLabel = {
  IMAGE: "تصویر",
  VIDEO: "ویدیو",
  AUDIO: "صدا",
} as const;

export const blogStatusLabel = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشرشده",
} as const;

export const blogStatusVariant = {
  DRAFT: "outline",
  PUBLISHED: "success",
} as const;

export const serviceRequestTypeLabel = {
  TEASER: "تیزر",
  IMAGE: "طراحی تصویر",
  WEBSITE: "طراحی سایت",
} as const;

export const serviceRequestStatusLabel = {
  NEW: "جدید",
  CONTACTED: "تماس گرفته شد",
  IN_PROGRESS: "در حال انجام",
  DONE: "انجام شد",
  CLOSED: "بسته‌شده",
} as const;

export const serviceRequestStatusVariant = {
  NEW: "warning",
  CONTACTED: "secondary",
  IN_PROGRESS: "default",
  DONE: "success",
  CLOSED: "outline",
} as const;
