import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { initializeLocale, locale, t, translate, type Locale } from '../src/lib/i18n';
import { en } from '../src/lib/i18n/locales/en';
import { pt } from '../src/lib/i18n/locales/pt';
import { zhCN } from '../src/lib/i18n/locales/zh-CN';
import { furnitureName } from '../src/lib/i18n/furnitureNames';
import { furnitureCatalog } from '../src/lib/utils/furnitureCatalog';
import { projectServiceMessage } from '../src/lib/i18n/projectServiceMessages';

afterEach(() => { vi.unstubAllGlobals(); locale.set('en'); });

describe('locale preferences', () => {
  it('preserves user content and substitutes numbers without recursively translating values', () => {
    expect(translate('pt', 'floors.elevation', { name: 'My {value} floor' })).toBe('Elevação de My {value} floor (cm)');
    expect(translate('pt', 'floors.default', { value: 125.5 })).toBe('Usar padrão (125.5 cm)');
    expect(translate('en', 'floors.default', { value: 125.5 })).toBe('Use default (125.5 cm)');
  });
  it('keeps dictionary keys and substitution tokens in agreement', () => {
    expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(pt[key].trim()).not.toBe('');
      expect(pt[key].match(/\{\w+\}/g) ?? []).toEqual(en[key].match(/\{\w+\}/g) ?? []);
    }
    for (const key of Object.keys(zhCN) as (keyof typeof zhCN)[]) {
      expect(zhCN[key].trim()).not.toBe('');
      expect((zhCN[key].match(/\{\w+\}/g) ?? []).sort()).toEqual((en[key].match(/\{\w+\}/g) ?? []).sort());
    }
    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(en).sort());
    const unchangedEnglish = Object.keys(en).filter((key) => zhCN[key as keyof typeof en] === en[key as keyof typeof en]);
    expect(unchangedEnglish).toEqual([
      'settings.goToGoogleAiStudio',
      'entourageLabels.item.car-suv',
    ]);
  });
  it('updates subscribed text, persists the choice and sets document language', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });
    vi.stubGlobal('document', { documentElement: { lang: 'en' } });
    const values: string[] = [];
    const unsubscribe = t.subscribe((translate) => values.push(translate('settings.title')));
    locale.set('pt');
    unsubscribe();
    expect(values).toEqual(['Settings', 'Configurações']);
    expect(setItem).toHaveBeenCalledWith('o3d_locale', 'pt');
    expect(document.documentElement.lang).toBe('pt');
  });
  it('restores valid preferences and ignores unknown persisted locales', () => {
    const getItem = vi.fn().mockReturnValue('pt');
    vi.stubGlobal('localStorage', { getItem, setItem: vi.fn() });
    initializeLocale();
    expect(get(locale)).toBe('pt');
    getItem.mockReturnValue('fr');
    initializeLocale();
    expect(get(locale)).toBe('en');
    locale.set('fr' as Locale);
    expect(get(locale)).toBe('en');
  });
  it('works in memory when storage access throws', () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } });
    expect(() => initializeLocale()).not.toThrow();
    expect(() => locale.set('pt')).not.toThrow();
    expect(get(t)('settings.title')).toBe(translate('pt', 'settings.title'));
  });
  it('supports Simplified Chinese across the complete interface dictionary', () => {
    locale.set('zh-CN');
    expect(get(t)('settings.title')).toBe('设置');
    expect(get(t)('library.empty')).toBe('暂无项目');
    expect(get(t)('settings.saved')).toBe('✓ 已保存');
    expect(get(t)('versions.interval')).toBe('每 5 分钟自动保存一次版本。');
  });
  it('localizes all catalog names and service-message suffixes in Simplified Chinese', () => {
    for (const item of furnitureCatalog) {
      expect(furnitureName(item.id, 'zh-CN')).toMatch(/\p{Script=Han}/u);
    }
    expect(furnitureName('sink_k', 'zh-CN')).toBe('厨房水槽');
    expect(furnitureName('sink_b', 'zh-CN')).toBe('洗手池');
    expect(projectServiceMessage(`Import failed. ${translate('en', 'welcome.noImport')}`, 'zh-CN'))
      .toBe(`Import failed. ${translate('zh-CN', 'welcome.noImport')}`);
  });
});
