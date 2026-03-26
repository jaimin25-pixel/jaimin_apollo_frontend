export const validators = {
  email(value: string): string | null {
    if (!value.trim()) return 'Email address is required'
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Please enter a valid email address'
    if (value.length > 255) return 'Email must be under 255 characters'
    return null
  },

  password(value: string): string | null {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (value.length > 128) return 'Password must be under 128 characters'
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter'
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter'
    if (!/[0-9]/.test(value)) return 'Password must contain a number'
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Password must contain a special character'
    return null
  },

  // Simpler password check for login (don't enforce complexity on login, only on register)
  loginPassword(value: string): string | null {
    if (!value) return 'Password is required'
    if (value.length < 4) return 'Password must be at least 4 characters'
    return null
  },

  fullName(value: string): string | null {
    if (!value.trim()) return 'Full name is required'
    if (value.trim().length < 2) return 'Name must be at least 2 characters'
    if (value.trim().length > 100) return 'Name must be under 100 characters'
    if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, dots, hyphens'
    return null
  },

  licenseNumber(value: string): string | null {
    if (!value.trim()) return 'License number is required'
    if (value.trim().length < 4) return 'License number must be at least 4 characters'
    if (!/^[A-Za-z0-9\-]+$/.test(value.trim())) return 'License number can only contain letters, numbers, and hyphens'
    return null
  },

  employeeId(value: string): string | null {
    if (!value.trim()) return 'Employee ID is required'
    if (!/^[A-Za-z0-9\-]+$/.test(value.trim())) return 'Employee ID can only contain letters, numbers, and hyphens'
    return null
  },

  phone(value: string): string | null {
    if (!value) return null // optional
    if (!/^[\+]?[0-9\-\s\(\)]{7,20}$/.test(value)) return 'Please enter a valid phone number'
    return null
  },

  required(value: string, fieldName: string): string | null {
    if (!value.trim()) return `${fieldName} is required`
    return null
  },

  insuranceId(value: string): string | null {
    if (!value) return null // optional
    if (!/^[A-Za-z0-9\-]+$/.test(value.trim())) return 'Insurance ID can only contain letters, numbers, and hyphens'
    return null
  },

  dateOfBirth(value: string): string | null {
    if (!value) return null // optional
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'Please enter a valid date'
    const now = new Date()
    if (date > now) return 'Date of birth cannot be in the future'
    const age = (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (age > 150) return 'Please enter a valid date of birth'
    return null
  },

  adminPassword(value: string): string | null {
    if (!value) return 'Password is required'
    if (value.length < 12) return 'Admin password must be at least 12 characters'
    if (!/[A-Z]/.test(value)) return 'Must contain an uppercase letter'
    if (!/[a-z]/.test(value)) return 'Must contain a lowercase letter'
    if (!/[0-9]/.test(value)) return 'Must contain a number'
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Must contain a special character (!@#$)'
    return null
  },

  accessKey(value: string): string | null {
    if (!value.trim()) return 'Access key is required'
    if (value.trim().length < 8) return 'Access key must be at least 8 characters'
    return null
  },
}

// Password strength meter (0-4)
export function passwordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  // Cap at 4
  score = Math.min(score, 4)

  const levels = [
    { label: 'Very Weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
    { label: 'Very Strong', color: '#16a34a' },
  ]
  return { score, ...levels[score] }
}
