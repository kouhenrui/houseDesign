# JavaScript Plugins

Plugins are user-installed `.js` files. Each file is evaluated in an iframe with
`sandbox="allow-scripts"`, an opaque origin, and a restrictive iframe Content
Security Policy. It has no access to the editor DOM, Svelte stores, browser
storage, project object, or network connections.

The script is evaluated as the body of a function receiving `api`, and must
return a plugin descriptor. Commands are shown in the Build panel.

```js
return {
  id: 'project-summary',
  name: 'Project Summary',
  version: '1.0.0',
  activate(api) {
    api.registerCommand({
      id: 'summarize',
      label: 'Show project summary',
      async run() {
        const project = await api.getProjectSummary();
        api.notify(`${project.name}: ${project.floorCount} floors, ${project.wallCount} walls`);
      },
    });
    api.registerCommand({
      id: 'add-origin-note',
      label: 'Add note at origin',
      async run() {
        await api.addTextAnnotation({ text: 'Added by plugin', x: 0, y: 0 });
        api.notify('Plugin note added');
      },
    });
  },
};
```

## API

- `registerCommand({ id, label, run })` registers a command in the Build panel.
- `getProjectSummary()` returns project ID/name and floor, wall, room, and
  furniture counts.
- `addTextAnnotation({ text, x, y })` creates a text annotation through the
  normal project store and undo history. Text is limited to 300 characters;
  coordinates must be finite centimetre values.
- `notify(message)` displays a short status message in the plugin entry.

Commands and plugin metadata are checked by the host. The plugin list is stored
in this browser only and is limited to 12 scripts of at most 256 KiB each.