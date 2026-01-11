export function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, "") // remove tudo que não for número
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export function formatPhone(value: string) {
  // Remove tudo que não for número
  let cleaned = value.replace(/\D/g, "");

  // Remove o código de país (55) se existir
  if (cleaned.length > 11 && cleaned.startsWith("55")) {
    cleaned = cleaned.slice(2);
  }

  // Pega apenas os 11 primeiros dígitos
  cleaned = cleaned.slice(0, 11);

  if (cleaned.length < 3) return cleaned;

  if (cleaned.length <= 10) {
    // Fixo: (XX)XXXX-XXXX
    return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
  } else {
    // Celular: (XX)9XXXX-XXXX
    return cleaned.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3").trim();
  }
}

// Formata para exibição: (XX)9XXXX-XXXX
export function formatPhoneDisplay(value: string) {
  let cleaned = value.replace(/\D/g, "");

  if (cleaned.length > 11 && cleaned.startsWith("55")) {
    cleaned = cleaned.slice(2);
  }

  cleaned = cleaned.slice(0, 11);

  if (cleaned.length < 3) return cleaned;

  if (cleaned.length <= 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
  } else {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3").trim();
  }
}

// Formata para link do WhatsApp: 55XXXXXXXXXXX
export function formatPhoneForWhatsApp(value: string): string {
  let cleaned = value.replace(/\D/g, "");

  // Remove o código de país se existir
  if (cleaned.startsWith("55")) {
    cleaned = cleaned.slice(2);
  }

  // Pega apenas os 11 primeiros dígitos
  cleaned = cleaned.slice(0, 11);

  // Adiciona o código de país
  return `55${cleaned}`;
}

// Retorna a URL completa do WhatsApp
export function getWhatsAppLink(phoneNumber: string): string {
  const phone = formatPhoneForWhatsApp(phoneNumber);
  return `https://api.whatsapp.com/send?phone=${phone}`;
}

export function formatContaAws(value: string) {
  return value.replace(/\D/g, "").slice(0, 12);
}
