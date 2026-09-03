import { test, expect, Page } from '@playwright/test';

function mockSerial(page: Page, { devicePresent, cancel }: { devicePresent: boolean; cancel?: boolean }) {
  return page.addInitScript(
    ({ devicePresent, cancel }) => {
      const writer = new WritableStream<Uint8Array>({ write() {} });
      const fakePort = {
        open: async () => {},
        close: async () => {},
        getInfo: () => ({ usbVendorId: 0xcafe, usbProductId: 0x4002 }),
        writable: writer,
        readable: null,
      };

      const fakeSerial = {
        getPorts: async () => (devicePresent ? [fakePort] : []),
        requestPort: async () => {
          if (cancel) {
            throw new DOMException('User canceled the request', 'NotFoundError');
          }
          return fakePort;
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      };

      Object.defineProperty(navigator, 'serial', {
        value: fakeSerial,
        configurable: true,
      });
    },
    { devicePresent, cancel },
  );
}

test('connecting with a device flips the toolbar to Disconnect and enables Send', async ({ page }) => {
  await mockSerial(page, { devicePresent: true });
  await page.goto('/');

  await page.getByRole('button', { name: 'Connect' }).click();

  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send to Hardware' })).toBeEnabled();
});

test('canceling the port picker keeps the button on Connect', async ({ page }) => {
  await mockSerial(page, { devicePresent: false, cancel: true });
  await page.goto('/');

  await page.getByRole('button', { name: 'Connect' }).click();

  await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Disconnect' })).toHaveCount(0);
});

test('disconnecting returns the toolbar to Connect', async ({ page }) => {
  await mockSerial(page, { devicePresent: true });
  await page.goto('/');

  await page.getByRole('button', { name: 'Connect' }).click();
  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible();

  await page.getByRole('button', { name: 'Disconnect' }).click();

  await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
});
