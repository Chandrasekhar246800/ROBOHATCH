// Example: Protected API route that forwards authenticated requests to backend

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' })
    }

    const token = authHeader.split(' ')[1]

    // Example: Get user profile from backend
    const backendUrl = `${process.env.BACKEND_BASE_URL}/api/v1/user/profile`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error || data?.message || 'Request failed' })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Profile API error:', err)
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}
