const CPF_TOTAL_DIGITS = 11;
const CPF_BASE_DIGITS = 9;
const REPEATED_DIGITS_CPF_PATTERN = /^(\d)\1{10}$/;

function computeCpfVerifierDigit(cpfBaseDigits: string): number {
  const startWeight = cpfBaseDigits.length + 1;
  const weightedSum = cpfBaseDigits
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (startWeight - index), 0);

  const remainder = (weightedSum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function normalizeCpf(input: string): string {
  return input.replace(/\D/g, "").slice(0, CPF_TOTAL_DIGITS);
}

export function formatCpf(input: string): string {
  const normalizedCpf = normalizeCpf(input);
  const firstBlock = normalizedCpf.slice(0, 3);
  const secondBlock = normalizedCpf.slice(3, 6);
  const thirdBlock = normalizedCpf.slice(6, 9);
  const lastBlock = normalizedCpf.slice(9, CPF_TOTAL_DIGITS);

  if (!secondBlock) return firstBlock;
  if (!thirdBlock) return `${firstBlock}.${secondBlock}`;
  if (!lastBlock) return `${firstBlock}.${secondBlock}.${thirdBlock}`;

  return `${firstBlock}.${secondBlock}.${thirdBlock}-${lastBlock}`;
}

export function isValidCpf(input: string): boolean {
  const normalizedCpf = normalizeCpf(input);

  if (normalizedCpf.length !== CPF_TOTAL_DIGITS) return false;
  if (REPEATED_DIGITS_CPF_PATTERN.test(normalizedCpf)) return false;

  const firstNineDigits = normalizedCpf.slice(0, CPF_BASE_DIGITS);
  const firstVerifierDigit = computeCpfVerifierDigit(firstNineDigits);
  const secondVerifierDigit = computeCpfVerifierDigit(`${firstNineDigits}${firstVerifierDigit}`);

  return normalizedCpf === `${firstNineDigits}${firstVerifierDigit}${secondVerifierDigit}`;
}