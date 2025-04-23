/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next'
import { app } from '@/server/app'
import { pipeline } from 'stream'
import { Readable } from 'stream'
import { promisify } from 'util'

const pump = promisify(pipeline)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  const request = new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
  })

  const response = await app.handle(request)

  if (!response) {
    res.status(404).end('Not Found')
    return
  }

  res.status(response.status)

  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value)
  }

  const body = response.body

  if (body) {
    const nodeReadable = Readable.fromWeb(body as any)
    await pump(nodeReadable, res)
  } else {
    res.end()
  }
}