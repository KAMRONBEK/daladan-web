import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { config as loadDotenv } from 'dotenv'
import { defineConfig, type Plugin } from 'vite'
// @ts-expect-error Local Vercel function is plain JavaScript module.
import generateDescriptionHandler from './api/generate-description.js'

const VERCEL_DEV_ENV_PATH = '.vercel/.env.development.local'
if (existsSync(VERCEL_DEV_ENV_PATH)) {
  loadDotenv({ path: VERCEL_DEV_ENV_PATH, override: false })
}

type RequestWithBody = IncomingMessage & {
  body?: unknown
}

type VercelLikeResponse = ServerResponse & {
  status: (code: number) => VercelLikeResponse
  json: (payload: unknown) => VercelLikeResponse
}

const readRequestBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })

const createVercelLikeResponse = (res: ServerResponse): VercelLikeResponse => {
  const response = res as VercelLikeResponse

  response.status = (code: number) => {
    response.statusCode = code
    return response
  }

  response.json = (payload: unknown) => {
    if (!response.headersSent) {
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    response.end(JSON.stringify(payload))
    return response
  }

  return response
}

const localGenerateDescriptionApiPlugin = (): Plugin => ({
  name: 'local-generate-description-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const requestUrl = req.url?.split('?')[0]
      if (requestUrl !== '/api/generate-description') {
        next()
        return
      }

      try {
        const request = req as RequestWithBody
        if (request.body === undefined && request.method === 'POST') {
          request.body = await readRequestBody(req)
        }

        const response = createVercelLikeResponse(res)
        await generateDescriptionHandler(request, response)

        if (!res.writableEnded) {
          res.end()
        }
      } catch (error) {
        next(error as Error)
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localGenerateDescriptionApiPlugin()],
})
