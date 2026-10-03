import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('draws a foundation footprint and sloped utility route from a blank project', async ({ page }) => {
  await page.goto('/editor');
  const canvas = page.getByLabel('Floor plan editor canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Floor plan canvas is not visible');
  const point = (x: number, y: number) => ({ x: bounds.x + bounds.width / 2 + x, y: bounds.y + bounds.height / 2 + y });

  await page.getByRole('button', { name: 'Draw foundation', exact: true }).click();
  for (const [x, y] of [[-140, -100], [140, -100], [140, 100], [-140, 100]]) {
    const p = point(x, y);
    await page.mouse.click(p.x, p.y);
  }
  await canvas.press('Enter');

  await page.getByLabel('Utility system').selectOption('drain');
  await page.getByLabel('Size (mm)').fill('100');
  await page.getByLabel('Slope (%)').fill('2');
  await page.getByRole('button', { name: 'Draw route', exact: true }).click();
  for (const [x, y] of [[-100, -40], [0, -40], [0, 60]]) {
    const p = point(x, y);
    await page.mouse.click(p.x, p.y);
  }
  await canvas.press('Enter');

  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON', exact: true }).click();
  const download = await downloadPromise;
  const project = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(project.foundationOutline).toHaveLength(4);
  expect(project.floors[0].utilityRoutes).toHaveLength(1);
  expect(project.floors[0].utilityRoutes[0]).toMatchObject({ kind: 'drain', sizeMm: 100, slopePercent: 2 });
  expect(project.floors[0].utilityRoutes[0].points).toHaveLength(3);
});
