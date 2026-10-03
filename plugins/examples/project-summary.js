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