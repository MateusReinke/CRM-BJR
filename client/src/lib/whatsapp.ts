export function toWhatsAppDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = toWhatsAppDigits(phone);
  const text = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}
