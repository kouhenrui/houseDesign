import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('loads a sandboxed JavaScript plugin and applies its declared project capability', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/editor');

  const fileChooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Add .js', exact: true }).click();
  await (await fileChooser).setFiles(resolve('plugins/examples/project-summary.js'));

  await page.getByRole('button', { name: 'Show project summary', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Add note at origin', exact: true }).click();
  await expect(page.getByText(/Plugin note added/)).toBeVisible();

  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON', exact: true }).click();
  const project = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(project.floors[0].textAnnotations).toContainEqual(expect.objectContaining({ text: 'Added by plugin', x: 0, y: 0 }));
});