import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const componentPath = resolve(dirname(fileURLToPath(import.meta.url)), '../AppSidebar.vue')
const componentSource = readFileSync(componentPath, 'utf8')
const stylePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../style.css')
const styleSource = readFileSync(stylePath, 'utf8')

describe('AppSidebar custom SVG styles', () => {
  it('does not override uploaded SVG fill or stroke colors', () => {
    expect(componentSource).toContain('.sidebar-svg-icon {')
    expect(componentSource).toContain('color: currentColor;')
    expect(componentSource).toContain('display: block;')
    expect(componentSource).not.toContain('stroke: currentColor;')
    expect(componentSource).not.toContain('fill: none;')
  })
})

describe('AppSidebar header styles', () => {
  it('does not clip the version badge dropdown', () => {
    const sidebarHeaderBlockMatch = styleSource.match(/\.sidebar-header\s*\{[\s\S]*?\n {2}\}/)
    const sidebarBrandBlockMatch = componentSource.match(/\.sidebar-brand\s*\{[\s\S]*?\n\}/)

    expect(sidebarHeaderBlockMatch).not.toBeNull()
    expect(sidebarBrandBlockMatch).not.toBeNull()
    expect(sidebarHeaderBlockMatch?.[0]).not.toContain('@apply overflow-hidden;')
    expect(sidebarBrandBlockMatch?.[0]).not.toContain('overflow: hidden;')
  })
})

describe('AppSidebar self navigation', () => {
  it('loads chat and canvas navigation from the playground feature', () => {
    const apiKeysIndex = componentSource.indexOf("{ path: '/keys', label: t('nav.apiKeys'), icon: KeyIcon }")
    const playgroundIndex = componentSource.indexOf('...buildPlaygroundNavItems()')

    expect(apiKeysIndex).toBeGreaterThan(-1)
    expect(playgroundIndex).toBeGreaterThan(apiKeysIndex)
    expect(componentSource).toContain("from '@/features/playground/navigation'")
    expect(componentSource).not.toContain("{ path: '/chat', label: t('nav.chat'), icon: ChatIcon }")
    expect(componentSource).not.toContain("{ path: '/canvas', label: t('nav.canvas'), icon: CanvasIcon }")
  })
})
