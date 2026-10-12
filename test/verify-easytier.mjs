import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { connectBrowser, waitFor } from './lib/cdp.mjs'
import { launchChrome } from './lib/chrome.mjs'
import { findFreePort } from './lib/ports.mjs'
import { serveDirectory } from './lib/static-server.mjs'
import { createMockServer } from './mock-server.mjs'

// An optional snapshot lets the browser render data captured from a live controller.
const status = process.argv[2]
  ? JSON.parse(await readFile(process.argv[2], 'utf8'))
  : {
      state: 'running',
      nodes: [
        {
          peerId: 1,
          hostname: 'dashboard-local',
          ipv4: '10.144.0.1/24',
          connection: 'local',
          udpNat: 'Unknown',
          tcpNat: 'Unknown',
          publicIPs: null,
        },
        {
          peerId: 2,
          hostname: 'relay-server',
          ipv4: '10.144.0.2/24',
          connection: 'p2p',
          udpNat: 'FullCone',
          tcpNat: 'Unknown',
          publicIPs: null,
        },
        {
          peerId: 3,
          hostname: 'remote-device',
          ipv4: '10.144.0.3/24',
          connection: 'relay',
          nextHopPeerId: 2,
          udpNat: 'Symmetric',
          tcpNat: 'OpenInternet',
          publicIPs: ['203.0.113.3'],
        },
      ],
    }
const mock = await createMockServer({ groups: 1, nodes: 1, connections: 0, easyTierStatus: status })
const app = await serveDirectory(join(import.meta.dirname, '..', 'dist'))
const port = await findFreePort()
const chrome = await launchChrome({ port })
const browser = await connectBrowser(port)
try {
  const page = await browser.newPage()
  await page.goto(app.url)
  assert.notEqual(
    await waitFor(async () => (await page.evaluate('location.origin')) === app.url),
    null,
  )
  const backend = [
    {
      uuid: 'easytier-test',
      type: 'clash',
      protocol: 'http',
      host: '127.0.0.1',
      port: String(mock.port),
      password: '',
      secondaryPath: '',
    },
  ]
  await page.evaluate(
    `localStorage.setItem('setup/api-list', ${JSON.stringify(JSON.stringify(backend))}); localStorage.setItem('setup/active-uuid', 'easytier-test'); localStorage.setItem('config/language', 'zh-CN'); localStorage.setItem('config/overview-card-order', ${JSON.stringify(JSON.stringify([{ card: 'EasyTierCard', visible: true }]))})`,
  )
  await page.goto(`${app.url}/#/overview`)
  await page.reload()
  assert.notEqual(
    await waitFor(
      async () =>
        (await page.evaluate(
          'document.querySelectorAll("[data-easytier-devices] tbody tr").length',
        )) === status.nodes.length,
    ),
    null,
  )
  const text = await page.evaluate('document.querySelector("[data-easytier-card]").innerText')
  for (const node of status.nodes) {
    assert.ok(text.includes(node.hostname), `device name: ${node.hostname}`)
    assert.ok(text.includes(node.ipv4), `device IP: ${node.ipv4}`)
    if (node.udpNat !== 'Unknown') assert.ok(text.includes(node.udpNat), `UDP NAT: ${node.udpNat}`)
    if (node.tcpNat !== 'Unknown') assert.ok(text.includes(node.tcpNat), `TCP NAT: ${node.tcpNat}`)
  }
  for (const label of ['本机', 'P2P 直连', '转发', '经由 relay-server', 'UDP NAT', 'TCP NAT'])
    assert.ok(text.includes(label), label)
  console.log('PASS: controller device names, connection modes, IP and NAT render in Chinese')
  for (const width of [390, 320]) {
    await page.call('Emulation.setDeviceMetricsOverride', {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    })
    assert.notEqual(
      await waitFor(
        async () =>
          (await page.evaluate('document.querySelectorAll("[data-easytier-device]").length')) ===
          status.nodes.length,
      ),
      null,
    )
    const mobileText = await page.evaluate(
      'document.querySelector("[data-easytier-mobile]").innerText',
    )
    for (const node of status.nodes) {
      for (const value of [
        node.hostname,
        node.ipv4,
        String(node.peerId),
        ...(node.publicIPs ?? []),
      ]) {
        assert.ok(mobileText.includes(value), `mobile field: ${value}`)
      }
    }
    assert.ok(mobileText.includes('经由 relay-server'), 'mobile relay next hop')
    assert.ok(
      await page.evaluate(`(() => {
        const card = document.querySelector('[data-easytier-card]')
        return document.documentElement.scrollWidth <= ${width}
          && [card, ...card.querySelectorAll('*')].every(el => el.scrollWidth <= el.clientWidth + 1)
      })()`),
      `all device fields fit without horizontal scrolling at ${width}px`,
    )
  }
  const shot = join(import.meta.dirname, '..', '.codex', 'easytier-mobile.png')
  await page.screenshot(shot)
  console.log(`PASS: all mobile device fields fit at 390px and 320px; screenshot ${shot}`)
  const remote = status.nodes.find((node) => node.connection === 'relay')
  remote.connection = 'p2p'
  remote.nextHopPeerId = remote.peerId
  remote.udpNat = 'PortRestricted'
  assert.notEqual(
    await waitFor(
      async () =>
        await page.evaluate(
          'document.querySelector("[data-easytier-card]").innerText.includes("PortRestricted")',
        ),
      { timeout: 10000 },
    ),
    null,
  )
  assert.ok(
    !(await page.evaluate('document.querySelector("[data-easytier-card]").innerText')).includes(
      '经由 relay-server',
    ),
  )
  console.log('PASS: automatic refresh updates connection mode and NAT')
} finally {
  browser.close()
  await chrome.close()
  await app.close()
  await mock.close()
}
