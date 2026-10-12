<template>
  <div
    v-if="outbounds.length"
    class="base-container w-full backdrop-blur-none!"
    data-easytier-card
  >
    <div class="surface flex items-center justify-between gap-3 p-4">
      <span class="text-base-content/60 text-xs font-semibold tracking-wider uppercase"
        >EasyTier</span
      >
      <button
        class="btn btn-ghost btn-sm"
        :disabled="loading"
        @click="refresh"
      >
        {{ t('refresh') }}
      </button>
    </div>
    <section
      v-for="proxy in outbounds"
      :key="proxy.name"
      class="surface px-4 pb-4"
    >
      <div class="flex flex-wrap items-center gap-2 py-2">
        <span class="min-w-0 font-semibold [overflow-wrap:anywhere]">{{ proxy.name }}</span>
        <span
          v-if="statuses[proxy.name]"
          class="badge badge-ghost badge-sm"
        >
          {{ t(`easyTierState_${statuses[proxy.name].state}`) }}
        </span>
      </div>
      <div
        v-if="errors[proxy.name]"
        role="alert"
        class="text-error text-sm break-words"
      >
        {{ errors[proxy.name] }}
      </div>
      <div
        v-else-if="!statuses[proxy.name]"
        class="text-base-content/60 text-sm"
      >
        <span class="loading loading-spinner loading-sm" />
      </div>
      <div
        v-else-if="!statuses[proxy.name].nodes.length"
        class="text-base-content/60 text-sm"
      >
        {{ t('noData') }}
      </div>
      <div
        v-else-if="isMiddleScreen"
        class="flex min-w-0 flex-col gap-3"
        data-easytier-mobile
      >
        <article
          v-for="device in statuses[proxy.name].nodes"
          :key="device.peerId"
          class="bg-base-200/50 min-w-0 rounded-xl p-3 text-sm [overflow-wrap:anywhere]"
          data-easytier-device
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold">{{ device.hostname || t('easyTierUnnamed') }}</div>
              <div class="text-base-content/50 mt-1 text-xs">{{ device.peerId }}</div>
            </div>
            <span
              class="badge badge-sm shrink-0 whitespace-nowrap"
              :class="connectionClass[device.connection]"
            >
              {{ t(`easyTierConnection_${device.connection}`) }}
            </span>
          </div>
          <div
            v-if="device.connection === 'relay'"
            class="text-base-content/60 mt-2 text-xs"
          >
            {{ t('easyTierVia', { peer: peerName(proxy.name, device.nextHopPeerId) }) }}
          </div>
          <dl class="mt-3 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-2">
            <dt class="text-base-content/60">IP</dt>
            <dd class="font-mono">{{ device.ipv4 || '—' }}</dd>
            <dt class="text-base-content/60">UDP NAT</dt>
            <dd>{{ natName(device.udpNat) }}</dd>
            <dt class="text-base-content/60">TCP NAT</dt>
            <dd>{{ natName(device.tcpNat) }}</dd>
            <dt class="text-base-content/60">{{ t('easyTierPublicIP') }}</dt>
            <dd class="font-mono">{{ device.publicIPs?.join(', ') || '—' }}</dd>
          </dl>
        </article>
      </div>
      <div
        v-else
        class="overflow-x-auto"
      >
        <table
          class="table-sm table min-w-[760px]"
          data-easytier-devices
        >
          <thead>
            <tr>
              <th>{{ t('easyTierDeviceName') }}</th>
              <th>{{ t('easyTierConnection') }}</th>
              <th>IP</th>
              <th>UDP NAT</th>
              <th>TCP NAT</th>
              <th>{{ t('easyTierPublicIP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="device in statuses[proxy.name].nodes"
              :key="device.peerId"
            >
              <td>
                <div>{{ device.hostname || t('easyTierUnnamed') }}</div>
                <div class="text-base-content/50 text-xs">{{ device.peerId }}</div>
              </td>
              <td>
                <span
                  class="badge badge-sm whitespace-nowrap"
                  :class="connectionClass[device.connection]"
                >
                  {{ t(`easyTierConnection_${device.connection}`) }}
                </span>
                <div
                  v-if="device.connection === 'relay'"
                  class="text-base-content/50 mt-1 text-xs"
                >
                  {{ t('easyTierVia', { peer: peerName(proxy.name, device.nextHopPeerId) }) }}
                </div>
              </td>
              <td class="font-mono whitespace-nowrap">{{ device.ipv4 || '—' }}</td>
              <td>{{ natName(device.udpNat) }}</td>
              <td>{{ natName(device.tcpNat) }}</td>
              <td class="font-mono">{{ device.publicIPs?.join(', ') || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useEasyTierStatus } from '@/assembly/easytier'
import { isMiddleScreen } from '@/helper/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { outbounds, statuses, errors, loading, refresh } = useEasyTierStatus()
const connectionClass = {
  local: 'badge-ghost',
  p2p: 'badge-success',
  relay: 'badge-warning',
  disconnected: 'badge-error',
}
const natName = (nat: string) => (nat === 'Unknown' ? t('easyTierUnknown') : nat)
const peerName = (name: string, id?: number) =>
  statuses.value[name]?.nodes.find((node) => node.peerId === id)?.hostname || String(id ?? '—')
</script>
