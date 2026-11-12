import axios from 'axios'

function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv.endsWith('/api') ? fromEnv : `${fromEnv}/api`

  // Browser production must never silently use localhost
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      console.error(
        '[CRM] VITE_API_URL is not set. Set it in Vercel to your Railway API URL, e.g. https://xxx.up.railway.app/api',
      )
    }
  }
  return 'http://127.0.0.1:8000/api'
}

export const API_BASE = resolveApiBase()

const ACCESS_KEY = 'dg_access'
const REFRESH_KEY = 'dg_refresh'
const USER_KEY = 'dg_user'

export const session = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  },
  save({ access, refresh, user }) {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = session.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      const refresh = session.refresh
      if (refresh) {
        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_BASE}/auth/refresh/`, { refresh })
              .finally(() => {
                refreshPromise = null
              })
          }
          const { data } = await refreshPromise
          session.save({ access: data.access, refresh: data.refresh })
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          // fall through to logout
        }
      }
      session.clear()
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  },
)

const MAX_PAGES = 30

/** Fetch every page of a DRF paginated endpoint. */
export async function listAll(path, params = {}) {
  let res = await api.get(path, { params })
  if (Array.isArray(res.data)) return res.data
  const out = [...(res.data.results || [])]
  let next = res.data.next
  let pages = 1
  while (next && pages < MAX_PAGES) {
    res = await api.get(next)
    out.push(...(res.data.results || []))
    next = res.data.next
    pages += 1
  }
  return out
}

/** Normalise a list response into { results, count }. */
export function normalizeList(data) {
  if (Array.isArray(data)) return { results: data, count: data.length }
  return { results: data?.results || [], count: data?.count ?? (data?.results || []).length }
}

const labelize = (k) => k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

/** Human-readable message from an axios error. */
export function errorMessage(err) {
  if (!err) return 'Something went wrong'
  if (!err.response) {
    const usingLocal =
      typeof API_BASE === 'string' &&
      (API_BASE.includes('127.0.0.1') || API_BASE.includes('localhost'))
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      return usingLocal
        ? 'API URL is still localhost. Set VITE_API_URL in Vercel to your Railway backend URL (https://….up.railway.app/api), then redeploy.'
        : `Cannot reach the API at ${API_BASE}. Check Railway domain, CORS, and that the backend is online.`
    }
    return err.message || 'Something went wrong'
  }
  const d = err.response.data
  if (!d) return `Request failed (${err.response.status})`
  if (typeof d === 'string') return d.length > 200 ? `Server error (${err.response.status})` : d
  if (d.detail) return typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail)
  if (Array.isArray(d)) return d.join(' ')
  return Object.entries(d)
    .map(([k, v]) => {
      const text = Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : String(v)
      return k === 'non_field_errors' ? text : `${labelize(k)}: ${text}`
    })
    .join(' · ')
}

/** Per-field validation errors from DRF ({ field: [msg] }). */
export function fieldErrors(err) {
  const d = err?.response?.data
  if (!d || typeof d !== 'object' || Array.isArray(d)) return {}
  const out = {}
  Object.entries(d).forEach(([k, v]) => {
    out[k] = Array.isArray(v) ? v.join(' ') : typeof v === 'string' ? v : ''
  })
  return out
}

export const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

export const listResults = (data) => (Array.isArray(data) ? data : data?.results || [])

export default api
