// Encerra a sessão após 15 minutos sem atividade. O horário da última atividade
// fica no localStorage: é compartilhado entre abas (atividade em uma mantém as
// outras ativas) e sobrevive ao fechamento do navegador (voltar depois de 15
// minutos exige novo login).
export const SESSION_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const LAST_ACTIVITY_KEY = "threeDevs:lastActivityAt";
const EXPIRED_FLAG_KEY = "threeDevs:sessionExpired";

export function markActivity(now = Date.now()) {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  } catch {
    // Armazenamento bloqueado (modo privado etc.): o timer da aba continua valendo.
  }
}

export function getLastActivity(): number | null {
  try {
    const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function isSessionIdleExpired(now = Date.now()): boolean {
  const last = getLastActivity();
  return last !== null && now - last >= SESSION_IDLE_TIMEOUT_MS;
}

export function clearActivity() {
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {}
}

// Aviso exibido uma única vez na tela de login.
export function flagSessionExpired() {
  try {
    sessionStorage.setItem(EXPIRED_FLAG_KEY, "1");
  } catch {}
}

export function wasSessionExpired(): boolean {
  try {
    return sessionStorage.getItem(EXPIRED_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSessionExpiredFlag() {
  try {
    sessionStorage.removeItem(EXPIRED_FLAG_KEY);
  } catch {}
}
