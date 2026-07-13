import { spawn, type ChildProcess } from 'node:child_process'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { createRhythm } from '../features/rhythm/rhythm-helpers'
import { MY_RHYTHMS_STORAGE_KEY } from '../features/rhythm/my-rhythms-storage'
import type { Rhythm } from '../features/rhythm/rhythm.types'

const PORT = 3456
const BASE_URL = `http://127.0.0.1:${PORT}`
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images')
const OUTPUT_GIF = path.join(OUTPUT_DIR, 'bar-drag-demo.gif')
const FRAMES_DIR = path.join(process.cwd(), '.tmp', 'bar-drag-demo-frames')

const demoRhythm = (): Rhythm => {
  const rhythm = createRhythm({
    title: 'bar-drag-demo',
    meter: 4,
    layers: ['djembe'],
    fillDjembe: false,
  })
  rhythm.instruments.djembe.bars = ['s--ss-tt', 'bt--st-', 's-ts--s', 'bts--tt-']
  return rhythm
}

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

const captureFrame = async (page: Page, index: number) => {
  const framePath = path.join(FRAMES_DIR, `frame-${String(index).padStart(3, '0')}.png`)
  await page.screenshot({ path: framePath, type: 'png' })
}

const dragBarOnCanvas = async (page: Page) => {
  const canvas = page.locator('canvas[id^="djembe-editor-canvas"]').first()
  await canvas.waitFor({ state: 'visible' })
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Canvas bounding box unavailable')

  const startX = box.x + box.width * 0.12
  const startY = box.y + box.height * 0.5
  const endX = box.x + box.width * 0.62
  const endY = box.y + box.height * 0.5

  let frame = 0
  await captureFrame(page, frame)
  frame += 1

  await page.mouse.move(startX, startY)
  await page.waitForTimeout(200)
  await captureFrame(page, frame)
  frame += 1

  await page.mouse.down()
  await page.waitForTimeout(100)
  await captureFrame(page, frame)
  frame += 1

  const steps = 18
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps
    await page.mouse.move(startX + (endX - startX) * t, startY + (endY - startY) * t, { steps: 2 })
    await page.waitForTimeout(70)
    await captureFrame(page, frame)
    frame += 1
  }

  await page.waitForTimeout(150)
  await captureFrame(page, frame)
  frame += 1
  await page.mouse.up()
  await page.waitForTimeout(300)
  await captureFrame(page, frame)

  return frame + 1
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
        'scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer',
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
    viewport: { width: 960, height: 720 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  await seedEditor(page)
  await page.goto(`${BASE_URL}/editor/bar-drag-demo`, { waitUntil: 'networkidle' })
  await page.locator('canvas[id^="djembe-editor-canvas"]').first().waitFor({ state: 'visible' })
  await ensureBarMode(page)
  await page.waitForTimeout(400)

  const frameCount = await dragBarOnCanvas(page)
  const savedFrames = (await readdir(FRAMES_DIR)).filter((entry) => entry.endsWith('.png')).length
  if (savedFrames === 0) throw new Error('No frames captured')

  await context.close()
  await browser.close()
  await framesToGif(OUTPUT_GIF)
  console.log(`Captured ${frameCount} frames, wrote ${OUTPUT_GIF}`)
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
