// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { useIntl } from 'react-intl';
import { I18nProvider, useLocale } from '../I18nProvider';
import { MESSAGES } from '../messages';

function LocaleTestHarness() {
  const intl = useIntl();
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="nav-label">{intl.formatMessage({ id: 'header.nav.obra' })}</span>
      <button onClick={() => setLocale('en')}>Switch EN</button>
    </div>
  );
}

describe('i18n (react-intl ES/EN)', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('mantiene paridad completa de claves entre diccionarios ES y EN', () => {
    const esKeys = Object.keys(MESSAGES.es).sort();
    const enKeys = Object.keys(MESSAGES.en).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('inicia en español por defecto, cambia a inglés y persiste en localStorage', () => {
    const { getByTestId, getByText } = render(
      <I18nProvider>
        <LocaleTestHarness />
      </I18nProvider>
    );

    expect(getByTestId('locale').textContent).toBe('es');
    expect(getByTestId('nav-label').textContent).toBe('EL PROYECTO');
    expect(document.documentElement.lang).toBe('es');

    fireEvent.click(getByText('Switch EN'));

    expect(getByTestId('locale').textContent).toBe('en');
    expect(getByTestId('nav-label').textContent).toBe('THE PROJECT');
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('caroni_locale')).toBe('en');
  });
});
