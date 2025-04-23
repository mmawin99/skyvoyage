import { NextApiRequest, NextApiResponse } from 'next'
import { app } from '@/server/app'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create a valid URL by adding a base
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  
  // Convert NextApiRequest to a native Request (Fetch API-like)
  const request = new Request(url, {
    method: req.method,
    headers: Object.entries(req.headers as Record<string, string>), // Convert headers to a compatible format
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
  })

  // Handle the request using Elysia
  const response = await app.handle(request)

  if (!response) {
    res.status(404).end('Not Found')
    return
  }

  // Convert Elysia's Response back to NextApiResponse
  res.status(response.status)

  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value)
  }

  // Handle text/html or other content types properly
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('text') || contentType.includes('json') || contentType.includes('html')) {
    const body = await response.text()
    res.end(body)
  } else {
    const body = Buffer.from(await response.arrayBuffer())
    res.end(body)
  }
}