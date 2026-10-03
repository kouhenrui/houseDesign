export interface InstalledPluginScript {
  key: string;
  source: string;
}

export interface PluginCommandContribution {
  id: string;
  label: string;
}

export interface PluginDescriptor {
  id: string;
  name: string;
  version?: string;
  commands: PluginCommandContribution[];
}

export interface PluginProjectSummary {
  id: string;
  name: string;
  floorCount: number;
  wallCount: number;
  roomCount: number;
  furnitureCount: number;
}

export const PLUGIN_STORAGE_KEY = 'openplan3d_plugins_v1';
export const PLUGIN_FILE_LIMIT = 256 * 1024;
export const PLUGIN_COUNT_LIMIT = 12;

export const pluginSandboxDocument = `<!doctype html>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'">
<script>
(() => {
  const namespace = 'openplan3d-plugin';
  const callbacks = new Map();
  const pending = new Map();
  let token = '';
  let nextRequest = 0;
  let helloTimer;
  const send = (type, payload = {}) => parent.postMessage({ namespace, type, token, ...payload }, '*');
  const request = (capability, args = {}) => new Promise((resolve, reject) => {
    const requestId = String(++nextRequest);
    pending.set(requestId, { resolve, reject });
    send('capability', { requestId, capability, args });
  });
  const api = Object.freeze({
    registerCommand(command) {
      if (!command || !/^[a-zA-Z0-9._-]{1,64}$/.test(command.id) || typeof command.label !== 'string' ||
          !command.label.trim() || command.label.length > 80 || typeof command.run !== 'function' || callbacks.has(command.id)) {
        throw new Error('Invalid or duplicate plugin command.');
      }
      callbacks.set(command.id, command.run);
      send('command', { command: { id: command.id, label: command.label.trim() } });
    },
    getProjectSummary() { return request('getProjectSummary'); },
    addTextAnnotation(annotation) { return request('addTextAnnotation', annotation); },
    notify(message) {
      if (typeof message !== 'string' || !message.trim() || message.length > 300) throw new Error('Plugin notifications must be short text.');
      send('notification', { message: message.trim() });
    },
  });

  addEventListener('message', async event => {
    const message = event.data;
    if (!message || message.namespace !== namespace) return;
    if (message.type === 'initialize') {
      if (token) return;
      token = message.token;
      clearInterval(helloTimer);
      try {
        const plugin = new Function('api', '"use strict";\\n' + message.source)(api);
        if (!plugin || !/^[a-zA-Z0-9._-]{1,64}$/.test(plugin.id) || typeof plugin.name !== 'string' ||
            !plugin.name.trim() || plugin.name.length > 80 || typeof plugin.activate !== 'function') {
          throw new Error('The script must return a plugin with id, name, and activate(api).');
        }
        plugin.activate(api);
        send('ready', { descriptor: { id: plugin.id, name: plugin.name.trim(), version: typeof plugin.version === 'string' ? plugin.version.slice(0, 32) : undefined } });
      } catch (error) {
        send('error', { message: error instanceof Error ? error.message.slice(0, 300) : 'Plugin initialization failed.' });
      }
      return;
    }
    if (message.token !== token) return;
    if (message.type === 'runCommand') {
      const run = callbacks.get(message.commandId);
      if (!run) return;
      try { await run(api); send('commandResult', { commandId: message.commandId }); }
      catch (error) { send('error', { message: error instanceof Error ? error.message.slice(0, 300) : 'Plugin command failed.' }); }
      return;
    }
    if (message.type === 'capabilityResult') {
      const call = pending.get(message.requestId);
      if (!call) return;
      pending.delete(message.requestId);
      if (message.error) call.reject(new Error(message.error)); else call.resolve(message.value);
    }
  });
  helloTimer = setInterval(() => parent.postMessage({ namespace, type: 'hello' }, '*'), 100);
  parent.postMessage({ namespace, type: 'hello' }, '*');
})();
</script>`;

export interface PluginSandboxHandlers {
  onDescriptor(descriptor: PluginDescriptor): void;
  onCommand(command: PluginCommandContribution): void;
  onNotification(message: string): void;
  onError(message: string): void;
  getProjectSummary(): PluginProjectSummary | null;
  addTextAnnotation(value: unknown): string | null;
}

export function connectPluginSandbox(frame: HTMLIFrameElement, plugin: InstalledPluginScript, handlers: PluginSandboxHandlers) {
  const token = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  function initialize() {
    frame.contentWindow?.postMessage({ namespace: 'openplan3d-plugin', type: 'initialize', token, source: plugin.source }, '*');
  }
  function receive(event: MessageEvent) {
    if (event.source !== frame.contentWindow) return;
    const message = event.data;
    if (!message || message.namespace !== 'openplan3d-plugin') return;
    if (message.type === 'hello') {
      initialize();
      return;
    }
    if (message.token !== token) return;
    if (message.type === 'ready' && message.descriptor && typeof message.descriptor.id === 'string' && typeof message.descriptor.name === 'string') {
      handlers.onDescriptor({ ...message.descriptor, commands: [] });
    } else if (message.type === 'command' && typeof message.command?.id === 'string' && typeof message.command?.label === 'string') {
      handlers.onCommand(message.command);
    } else if (message.type === 'notification' && typeof message.message === 'string') {
      handlers.onNotification(message.message);
    } else if (message.type === 'error' && typeof message.message === 'string') {
      handlers.onError(message.message);
    } else if (message.type === 'capability') {
      void answerCapability(message);
    }
  }
  async function answerCapability(message: any) {
    let value: unknown, error: string | undefined;
    try {
      if (message.capability === 'getProjectSummary') value = handlers.getProjectSummary();
      else if (message.capability === 'addTextAnnotation') value = handlers.addTextAnnotation(message.args);
      else error = 'This plugin capability is unavailable.';
    } catch (cause) { error = cause instanceof Error ? cause.message : 'The plugin request was rejected.'; }
    frame.contentWindow?.postMessage({ namespace: 'openplan3d-plugin', type: 'capabilityResult', token,
      requestId: message.requestId, value, error }, '*');
  }
  window.addEventListener('message', receive);
  return {
    runCommand(commandId: string) {
      frame.contentWindow?.postMessage({ namespace: 'openplan3d-plugin', type: 'runCommand', token, commandId }, '*');
    },
    dispose() { window.removeEventListener('message', receive); },
  };
}