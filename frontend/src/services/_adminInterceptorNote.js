// adminApi request interceptor — reads VisaAI Pro token from Zustand persist storage
adminApi.interceptors.request.use((config) => {
  try {
    const raw    = localStorage.getItem('visaai-auth')
    const parsed = raw ? JSON.parse(raw) : null
    const token  = parsed?.state?.accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})
