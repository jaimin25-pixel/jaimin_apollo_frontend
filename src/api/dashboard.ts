import api from './axios'
import type { DashboardData } from '@/types'

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>('/dashboard')
  return res.data
}
