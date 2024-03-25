import { readdir } from 'fs/promises'
import { join } from 'path'
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

function parseHost(url: string): string {
  const urlObj = new URL(url)
  return urlObj.port 
  ? `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}` 
  : `${urlObj.protocol}//${urlObj.hostname}`
}

async function countSlides() {
  const path = join(process.cwd(), 'public/slides')
  const files = await readdir(path)
  return files.length
}

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {
  const slideCount = await countSlides()
  const host = parseHost(c.req.url)
  const { buttonValue, status } = c
  const imgIndex = buttonValue || 0
  const nextIndex = (Number(imgIndex) + 1) % slideCount
  const imgSrc = status === 'response' 
  ? `${host}/slides/${imgIndex}.jpg`
  : `${host}/title.jpg`

  return c.res({
    image: <div tw="w-full h-full flex items-center justify-center bg-red-400 text-white">
        <img tw="w-full h-full" src={imgSrc} width={1200} height={630} />
      </div>,
    intents: [
      <Button value={String(nextIndex)}>Next</Button>,
      <Button.Link href="https://zora.co/collect/eth:0xba7b81717ece26237d400552c27fd172b48cd959/4">Mint</Button.Link>,
    ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
