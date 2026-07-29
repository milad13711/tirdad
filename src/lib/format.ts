export function formatToman(amount: number) {
  return amount.toLocaleString("fa-IR");
}

export function formatJalali(date: Date) {
  return date.toLocaleDateString("fa-IR");
}

export function formatJalaliDateTime(date: Date) {
  return `${date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })} - ${formatJalali(date)}`;
}
