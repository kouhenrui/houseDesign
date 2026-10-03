<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { t } from '$lib/i18n';
  import { addTextAnnotation, currentProject } from '$lib/stores/project';
  import { connectPluginSandbox, pluginSandboxDocument, type InstalledPluginScript, type PluginCommandContribution, type PluginDescriptor } from '$lib/plugins/contracts';

  let { plugin, onremove }: { plugin: InstalledPluginScript; onremove: (key: string) => void } = $props();
  let frame: HTMLIFrameElement;
  let bridge: ReturnType<typeof connectPluginSandbox> | undefined;
  let descriptor = $state<PluginDescriptor | null>(null);
  let commands = $state<PluginCommandContribution[]>([]);
  let status = $state('plugin.statusStarting');
  let error = $state('');

  onMount(() => {
    bridge = connectPluginSandbox(frame, plugin, {
      onDescriptor(value) { descriptor = value; status = 'plugin.statusReady'; error = ''; },
      onCommand(value) {
        if (!commands.some(command => command.id === value.id)) commands = [...commands, value];
      },
      onNotification(value) { status = value; },
      onError(value) { error = value; status = 'plugin.statusError'; },
      getProjectSummary() {
        const project = get(currentProject);
        if (!project) return null;
        return {
          id: project.id,
          name: project.name,
          floorCount: project.floors.length,
          wallCount: project.floors.reduce((count, floor) => count + floor.walls.length, 0),
          roomCount: project.floors.reduce((count, floor) => count + floor.rooms.length, 0),
          furnitureCount: project.floors.reduce((count, floor) => count + floor.furniture.length, 0),
        };
      },
      addTextAnnotation(value) {
        if (!value || typeof value !== 'object') throw new Error('Annotation data must be an object.');
        const annotation = value as { text?: unknown; x?: unknown; y?: unknown };
        if (typeof annotation.text !== 'string' || !annotation.text.trim() || annotation.text.length > 300 ||
            typeof annotation.x !== 'number' || !Number.isFinite(annotation.x) ||
            typeof annotation.y !== 'number' || !Number.isFinite(annotation.y)) {
          throw new Error('Provide short text and finite x/y coordinates.');
        }
        return addTextAnnotation(annotation.x, annotation.y, annotation.text.trim());
      },
    });
    return () => bridge?.dispose();
  });
</script>

  <iframe bind:this={frame} title={descriptor?.name ?? $t('plugin.sandboxTitle')} sandbox="allow-scripts"
  srcdoc={pluginSandboxDocument} class="hidden" aria-hidden="true"></iframe>
<div class="border-b border-gray-200 py-2 dark:border-gray-700">
  <div class="flex items-center justify-between gap-2">
    <div class="min-w-0">
      <div class="truncate text-xs font-semibold text-gray-700 dark:text-gray-200">{descriptor?.name ?? plugin.key}</div>
      <div class="truncate text-[10px] text-gray-500">{status.startsWith('plugin.') ? $t(status as 'plugin.statusStarting' | 'plugin.statusReady' | 'plugin.statusError') : status}{descriptor?.version ? ` · ${descriptor.version}` : ''}</div>
    </div>
    <button type="button" aria-label={$t('plugin.remove', { name: descriptor?.name ?? plugin.key })} title={$t('plugin.removeTitle')}
      class="px-2 py-1 text-xs text-gray-500 hover:text-red-700" onclick={() => onremove(plugin.key)}>{$t('plugin.removeShort')}</button>
  </div>
  {#if error}<p role="alert" class="mt-1 break-words text-xs text-red-700">{error}</p>{/if}
  {#each commands as command (command.id)}
    <button type="button" class="mt-2 w-full truncate rounded border border-gray-200 px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
      onclick={() => bridge?.runCommand(command.id)}>{command.label}</button>
  {/each}
</div>