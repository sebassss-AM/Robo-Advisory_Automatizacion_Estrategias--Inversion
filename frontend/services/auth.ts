const AUTH_KEY = "inversia_advisor_auth"

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "true"
}

export function login(pin: string): boolean {
  if (pin === "1234") {
    localStorage.setItem(AUTH_KEY, "true")
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}
