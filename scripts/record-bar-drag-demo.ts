import { spawn, type ChildProcess } from 'node:child_process'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

import { chromium, type Locator, type Page } from '@playwright/test'

import { createRhythm } from '../features/rhythm/rhythm-helpers'
import { MY_RHYTHMS_STORAGE_KEY } from '../features/rhythm/my-rhythms-storage'
import type { Rhythm } from '../features/rhythm/rhythm.types'

const PORT = 3456
const BASE_URL = `http://127.0.0.1:${PORT}`
const OUTPUT_GIF = path.join(process.cwd(), 'public', 'images', 'bar-drag-demo.gif')
const FRAMES_DIR = path.join(process.cwd(), '.tmp', 'bar-drag-demo-frames')
const GIF_WIDTH = 480
const GIF_HEIGHT = 160

const demoRhythm = (): Rhythm => {
  const rhythm = createRhythm({
    title: 'bar-drag-demo',
    meter: 3,
    layers: ['djembe'],
    fillDjembe: false,
  })
  rhythm.instruments.djembe.bars = ['ssssss', '------']
  return rhythm
}

type Point = { x: number; y: number }

const waitForServer = async (url: string, timeoutMs = 60_000) => {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Dev server did not become ready at ${url}`)
}

const startDevServer = async (): Promise<ChildProcess> => {
  const child = spawn(
    'npm',
    ['run', 'dev', '--', '--port', String(PORT), '--hostname', '127.0.0.1'],
    {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  await waitForServer(BASE_URL)
  return child
}

const stopDevServer = (child: ChildProcess) => {
  if (child.killed) return
  child.kill('SIGTERM')
  setTimeout(() => {
    if (!child.killed) child.kill('SIGKILL')
  }, 2_000).unref()
}

const seedEditor = async (page: Page) => {
  const rhythm = demoRhythm()
  await page.addInitScript(
    ({ storageKey, rhythms }) => {
      localStorage.setItem(storageKey, JSON.stringify(rhythms))
      localStorage.setItem(
        'redunsy-theme',
        JSON.stringify({ state: { theme: 'light' }, version: 0 }),
      )
      localStorage.setItem(
        'redunsy-player',
        JSON.stringify({
          state: {
            desktopBarsPerRow: 2,
            showBarIndex: false,
            showKeyboardHints: false,
          },
          version: 0,
        }),
      )
    },
    { storageKey: MY_RHYTHMS_STORAGE_KEY, rhythms: { [rhythm.slug]: rhythm } },
  )
}

const ensureBarMode = async (page: Page) => {
  const barButton = page.getByRole('button', { name: 'bar', exact: true })
  await barButton.waitFor({ state: 'visible' })
  if ((await barButton.getAttribute('aria-pressed')) !== 'true') {
    await barButton.click()
  }
}

const pagePoint = (
  box: { x: number; y: number; width: number; height: number },
  rx: number,
  ry: number,
) => ({
  x: box.x + box.width * rx,
  y: box.y + box.height * ry,
})

const quadraticBezier = (start: Point, control: Point, end: Point, t: number): Point => {
  const inverse = 1 - t
  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  }
}

const captureCanvasFrame = async (canvas: Locator, index: number) => {
  const framePath = path.join(FRAMES_DIR, `frame-${String(index).padStart(3, '0')}.png`)
  await canvas.screenshot({ path: framePath, type: 'png' })
}

const dragBarOnCanvas = async (page: Page, canvas: Locator) => {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Canvas bounding box unavailable')

  const start = pagePoint(box, 0.25, 0.58)
  const control = pagePoint(box, 0.52, 0.14)
  const end = { x: box.x + box.width - 1, y: box.y + box.height * 0.58 }

  let frame = 0
  const snap = async () => {
    await captureCanvasFrame(canvas, frame)
    frame += 1
  }

  await snap()
  await page.waitForTimeout(180)

  await canvas.hover({ position: { x: box.width * 0.25, y: box.height * 0.58 } })
  await page.waitForTimeout(120)
  await snap()

  await page.mouse.down()
  await page.waitForTimeout(100)
  await snap()

  await page.mouse.move(start.x + 50, start.y)
  await page.waitForTimeout(80)
  await snap()

  const steps = 24
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps
    const point = quadraticBezier(start, control, end, t)
    await page.mouse.move(point.x, point.y, { steps: 2 })
    await page.waitForTimeout(60)
    await snap()
  }

  await page.waitForTimeout(220)
  await snap()
  await page.mouse.up()
  await page.waitForTimeout(500)
  await snap()

  return frame
}

const framesToGif = async (outputPath: string) => {
  await mkdir(path.dirname(outputPath), { recursive: true })
  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-y',
        '-framerate',
        '10',
        '-i',
        path.join(FRAMES_DIR, 'frame-%03d.png'),
        '-vf',
        `scale=${GIF_WIDTH}:${GIF_HEIGHT}:force_original_aspect_ratio=decrease,pad=${GIF_WIDTH}:${GIF_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0xf4f4f5,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer`,
        outputPath,
      ],
      { stdio: 'inherit' },
    )
    ffmpeg.on('error', reject)
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}`))
    })
  })
}

const recordDemo = async () => {
  await rm(FRAMES_DIR, { recursive: true, force: true })
  await mkdir(FRAMES_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 900, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  await seedEditor(page)
  await page.goto(`${BASE_URL}/editor/bar-drag-demo`, { waitUntil: 'networkidle' })
  const canvas = page.locator('canvas[id^="djembe-editor-canvas"]').first()
  await canvas.waitFor({ state: 'visible' })
  await ensureBarMode(page)
  await canvas.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)

  const frameCount = await dragBarOnCanvas(page, canvas)
  const savedFrames = (await readdir(FRAMES_DIR)).filter((entry) => entry.endsWith('.png')).length
  if (savedFrames === 0) throw new Error('No frames captured')

  const barsAfter = await page.evaluate(() => {
    const raw = localStorage.getItem('my-rhythms')
    if (!raw) return null
    return JSON.parse(raw)['bar-drag-demo']?.instruments?.djembe?.bars ?? null
  })
  if (barsAfter?.join('|') !== '------|ssssss') {
    throw new Error(`Expected reordered bars, got ${JSON.stringify(barsAfter)}`)
  }

  await context.close()
  await browser.close()
  await framesToGif(OUTPUT_GIF)
  console.log(`Captured ${frameCount} canvas frames, wrote ${OUTPUT_GIF}`)
}

const main = async () => {
  let devServer: ChildProcess | null = null
  try {
    devServer = await startDevServer()
    await recordDemo()
  } finally {
    if (devServer) stopDevServer(devServer)
    await rm(FRAMES_DIR, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
