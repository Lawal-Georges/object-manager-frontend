import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://object-manager-backend.vercel.app/'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export interface ObjectItem {
  id: string
  title: string
  description: string
  image_url: string
  created_at: string
}

export const objectsApi = {
  // Récupérer tous les objets
  getAll: async (): Promise<ObjectItem[]> => {
    try {
      console.log('📡 Fetching objects from:', `${API_URL}/api/objects`)
      const response = await api.get('/api/objects')
      console.log('✅ API Response:', {
        status: response.status,
        data: response.data
      })
      return response.data.data || []
    } catch (error: any) {
      console.error('❌ Error fetching objects:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      return []
    }
  },

  // Créer un objet
  create: async (formData: FormData): Promise<ObjectItem> => {
    console.log('🔄 Creating object...')
    const response = await api.post('/api/objects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log('✅ Object created:', response.data)
    return response.data.data
  },

  // Supprimer un objet - CORRIGÉ
  delete: async (id: string): Promise<void> => {
    console.log(`🗑️ Deleting object ${id}...`)
    try {
      const response = await api.delete(`/api/objects/${id}`)
      console.log('✅ Delete response:', response.data)
    } catch (error: any) {
      console.error('❌ Delete error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  },

  // Vérifier la santé de l'API - AMÉLIORÉ
  healthCheck: async (): Promise<{ status: boolean; message: string }> => {
    try {
      console.log('🔍 Health checking...')
      const response = await api.get('/health', { timeout: 3000 })
      console.log('✅ Health check response:', response.data)
      return {
        status: response.data.status === 'OK',
        message: 'API connectée'
      }
    } catch (error: any) {
      console.error('❌ Health check failed:', {
        message: error.message,
        code: error.code
      })
      return {
        status: false,
        message: error.message || 'API non disponible'
      }
    }
  },
}