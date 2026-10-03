<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/i18n';
  import PluginSandbox from './PluginSandbox.svelte';
  import { PLUGIN_COUNT_LIMIT, PLUGIN_FILE_LIMIT, PLUGIN_STORAGE_KEY, type InstalledPluginScript } from '$lib/plugins/contracts';

  let plugins = $state<InstalledPluginScript[]>([]);
  let fileInput: HTMLInputElement;
  let error = $state('');
  let busy = $state(false);

  onMount(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(PLUGIN_STORAGE_KEY) ?? '[]');
      if (!Array.isArray(stored) || stored.length > PLUGIN_COUNT_LIMIT || stored.some(item =>
        !item || typeof item.key !== 'string' || typeof item.source !== 'string' || item.source.length > PLUGIN_FILE_LIMIT)) {
        throw new Error($t('plugin.invalidSavedList'));
      }
      plugins = stored;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : $t('plugin.loadFailed');
    }
  });

  function persist(next: InstalledPluginScript[]) {
    try {
      localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(next));
      plugins = next;
      error = '';
    } catch {
      error = $t('plugin.saveFailed');
    }
  }

  async function install(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.js') || file.size > PLUGIN_FILE_LIMIT) {
      error = $t('plugin.fileInvalid');
      return;
    }
    if (plugins.length >= PLUGIN_COUNT_LIMIT) {
      error = $t('plugin.limitReached', { count: PLUGIN_COUNT_LIMIT });
      return;
    }
    busy = true;
    try {
      const source = await file.text();
      if (!source.trim()) throw new Error($t('plugin.fileEmpty'));
      persist([...plugins, { key: `${file.name.replace(/\.js$/i, '')}-${crypto.randomUUID()}`, source }]);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : $t('plugin.readFailed');
    } finally { busy = false; }
  }

  function remove(key: string) {
    persist(plugins.filter(plugin => plugin.key !== key));
  }
</script>

<section class="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
  <div class="flex items-center justify-between gap-2">
    <h3 class="text-xs font-semibold uppercase text-gray-500">{$t('plugin.title')}</h3>
    <button type="button" class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
      disabled={busy || plugins.length >= PLUGIN_COUNT_LIMIT} onclick={() => fileInput.click()}>{$t('plugin.add')}</button>
    <input bind:this={fileInput} class="hidden" type="file" accept=".js,text/javascript,application/javascript" onchange={install} />
  </div>
  <p class="mt-1 text-[10px] leading-4 text-amber-700">{$t('plugin.securityNote')}</p>
  {#if error}<p role="alert" class="mt-2 break-words text-xs text-red-700">{error}</p>{/if}
  {#each plugins as plugin (plugin.key)}
    <PluginSandbox {plugin} onremove={remove} />
  {/each}
</section>