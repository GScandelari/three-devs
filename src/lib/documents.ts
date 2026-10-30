function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, i) => acc + Number(digits[i]) * weight, 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

// CPF (11 dígitos) ou CNPJ (14 dígitos) com dígitos verificadores corretos.
// Sequências repetidas (000.000.000-00, 11.111.111/1111-11) são inválidas.
export function isValidCpfCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (/^(\d)\1+$/.test(digits)) return false;

  if (digits.length === 11) {
    const first = checkDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    const second = checkDigit(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    return first === Number(digits[9]) && second === Number(digits[10]);
  }

  if (digits.length === 14) {
    const first = checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const second = checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return first === Number(digits[12]) && second === Number(digits[13]);
  }

  return false;
}

// Máscara de CPF (até 11 dígitos) ou CNPJ (12 a 14 dígitos), aplicada enquanto
// o usuário digita. Ignora qualquer caractere que não seja dígito.
export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
