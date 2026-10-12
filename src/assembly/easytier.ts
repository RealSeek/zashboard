import { fetchEasyTierStatusAPI } from '@/api/clash'
import { proxyMap } from '@/assembly/proxies'
import { getRequestErrorMessage } from '@/helper/request-error'
import { i18n } from '@/i18n'
import { activeBackend } from '@/store/setup'
import type { EasyTierStatus } from '@/types/easytier'
import axios from 'axios'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export const useEasyTierStatus = () => {
  const t = i18n.global.t
  const outbounds = computed(() =>
    activeBackend.value?.type === 'clash'
      ? Object.values(proxyMap.value).filter((proxy) => proxy.type.toLowerCase() === 'easytier')
      : [],
  )
  const statuses = ref<Record<string, EasyTierStatus>>({})
  const errors = ref<Record<string, string>>({})
  const loading = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined
  const refresh = async () => {
    clearTimeout(timer)
    controller?.abort()
    const request = new AbortController()
    controller = request
    loading.value = true
    await Promise.all(
      outbounds.value.map(async (proxy) => {
        try {
          const { data } = await fetchEasyTierStatusAPI(proxy, request.signal)
          if (request.signal.aborted) return
          statuses.value[proxy.name] = data
          delete errors.value[proxy.name]
        } catch (error) {
          if (request.signal.aborted) return
          delete statuses.value[proxy.name]
          errors.value[proxy.name] =
            axios.isAxiosError(error) && error.response?.status === 404
              ? t('easyTierUpgradeCore')
              : getRequestErrorMessage(error)
        }
      }),
    )
    if (request.signal.aborted) return
    loading.value = false
    if (outbounds.value.length) timer = setTimeout(refresh, 5000)
  }

  watch(
    () =>
      JSON.stringify([
        activeBackend.value?.uuid,
        outbounds.value.map((proxy) => [proxy.name, proxy['provider-name']]),
      ]),
    () => {
      statuses.value = {}
      errors.value = {}
      void refresh()
    },
    { immediate: true },
  )
  onBeforeUnmount(() => {
    clearTimeout(timer)
    controller?.abort()
  })

  return { outbounds, statuses, errors, loading, refresh }
}
