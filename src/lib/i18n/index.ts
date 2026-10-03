import { derived, writable } from 'svelte/store';
import { en } from './locales/en';
import { pt } from './locales/pt';
import { zhCN } from './locales/zh-CN';

export type Locale = 'en' | 'pt' | 'zh-CN';
export type TranslationKey = keyof typeof en;
const dictionaries: Record<Locale, Partial<Record<TranslationKey, string>>> = { en, pt, 'zh-CN': zhCN };
const preference = writable<Locale>('en');
const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'pt' || value === 'zh-CN';
export const intlLocale = (language: Locale) => language === 'pt' ? 'pt-BR' : language;

export function translate(language: Locale, key: TranslationKey, variables: Record<string, string | number> = {}): string {
  // Single-pass substitution preserves literal braces in user-provided values.
  return (dictionaries[language][key] ?? en[key]).replace(/\{(\w+)\}/g, (token, name) =>
    Object.hasOwn(variables, name) ? String(variables[name]) : token);
}

export const locale = {
  subscribe: preference.subscribe,
  set(value: Locale) {
    if (!isLocale(value)) return;
    preference.set(value);
    if (typeof document !== 'undefined') document.documentElement.lang = value;
    try { localStorage.setItem('o3d_locale', value); } catch { /* In-memory choice still works. */ }
  },
};

/** Run after hydration; SSR and the first client render always agree on English. */
export function initializeLocale() {
  let saved: unknown;
  try { saved = localStorage.getItem('o3d_locale'); } catch { /* Storage can be disabled. */ }
  // Keep English until users opt in to another language.
  locale.set(isLocale(saved) ? saved : 'en');
}

/** Svelte's $t subscription updates labels without remounting dialogs or inputs. */
export const t = derived(preference, (language) =>
  (key: TranslationKey, variables?: Record<string, string | number>) => translate(language, key, variables));
