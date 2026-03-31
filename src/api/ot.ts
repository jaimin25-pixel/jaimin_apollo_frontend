import api from './axios'

export default {
  getDashboard() { return api.get('/ot/dashboard') },
  getSchedules(roomId?: number, status?: string) {
    const params: any = {}
    if (roomId) params.room_id = roomId
    if (status) params.status = status
    return api.get('/ot/schedules', { params })
  },
  createSchedule(data: any) { return api.post('/ot/schedules', data) },
  getSchedule(id: number) { return api.get(`/ot/schedules/${id}`) },
  updateSchedule(id: number, data: any) { return api.put(`/ot/schedules/${id}`, data) },
  advanceStatus(id: number, data: { status: string; actual_start_time?: string; actual_end_time?: string }) { return api.patch(`/ot/schedules/${id}/status`, data) },
  addNotes(id: number, data: { operating_notes: string }) { return api.patch(`/ot/schedules/${id}/notes`, data) },
  cancelSchedule(id: number) { return api.delete(`/ot/schedules/${id}`) },
  getRooms() { return api.get('/ot/rooms') },
  sterilizeRoom(id: number, data: { notes?: string }) { return api.patch(`/ot/rooms/${id}/sterilize`, data) },
}
