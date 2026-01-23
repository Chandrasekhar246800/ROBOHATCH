export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const backendUrl = `${process.env.BACKEND_BASE_URL}/api/v1/auth/login`
    console.log('Login request to:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({}))
    console.log('Login response status:', response.status)

    if (!response.ok) {
      console.log('Login failed:', data)
      return res.status(response.status).json({ error: data?.error || data?.message || 'Login failed' })
    }

    // Extract token from response
    const token = data?.accessToken || data?.token || data?.data?.token || data?.access_token
    console.log('Token found:', token ? 'Yes' : 'No')

    return res.status(200).json(data)
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Unexpected server error: ' + err.message })
  }
}
