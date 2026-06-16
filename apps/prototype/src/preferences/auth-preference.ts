export const AUTH_STORAGE_KEY = 'dify-prototype-authenticated'

export function readAuthenticated() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  }
  catch {
  }
  return false
}

export function writeAuthenticated(value: boolean) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, value ? 'true' : 'false')
  }
  catch {
  }
}
