export const passwordChecks = (password = "") => ({
  length: password.length >= 8,
  lower: /[a-z]/.test(password),
  upper: /[A-Z]/.test(password),
  number: /\d/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
});

export function scorePassword(password = "") {
  if (!password) return 0;

  const checks = passwordChecks(password);
  let score = Object.values(checks).filter(Boolean).length; // 0 - 5

  if (password.length < 6) score = Math.min(score, 1);
  if (password.length >= 12 && score >= 4) score = 5;

  return score;
}

const META = [
  { label: "Very Weak", color: "#c0392b" },
  { label: "Weak", color: "#e67e22" },
  { label: "Fair", color: "#f1c40f" },
  { label: "Good", color: "#2ecc71" },
  { label: "Strong", color: "#27ae60" },
  { label: "Very Strong", color: "#16a085" },
];

export const strengthMeta = (score) =>
  META[Math.max(0, Math.min(META.length - 1, score))];

export function isStrongPassword(password = "") {
  const checks = passwordChecks(password);
  return (
    checks.length &&
    checks.lower &&
    checks.upper &&
    checks.number &&
    checks.symbol &&
    scorePassword(password) >= 4
  );
}

export const passwordRequirements = [
  { key: "length", label: "At least 8 characters" },
  { key: "lower", label: "One lowercase letter" },
  { key: "upper", label: "One uppercase letter" },
  { key: "number", label: "One number" },
  { key: "symbol", label: "One special character" },
];