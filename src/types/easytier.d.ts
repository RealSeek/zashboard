export type EasyTierDevice = {
  peerId: number
  hostname: string
  ipv4: string
  connection: 'local' | 'p2p' | 'relay' | 'disconnected'
  nextHopPeerId?: number
  udpNat: string
  tcpNat: string
  publicIPs: string[] | null
}

export type EasyTierStatus = {
  state: 'stopped' | 'created' | 'starting' | 'running' | 'stopping'
  nodes: EasyTierDevice[]
}
