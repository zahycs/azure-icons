const assert = require('node:assert/strict');
const test = require('node:test');
const AzureIconsUpdater = require('./update-icons');

test('finds the newest Azure icons archive linked from Microsoft Learn', () => {
  const updater = new AzureIconsUpdater();
  const html = `
    <a href="https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V21.zip">Older</a>
    <a href="https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V24.zip">Latest</a>
  `;

  assert.equal(
    updater.extractDownloadUrl(html),
    'https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V24.zip'
  );
});

test('resolves relative archive links from Microsoft Learn', () => {
  const updater = new AzureIconsUpdater();

  assert.equal(
    updater.extractDownloadUrl('<a href="//arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V24.zip">Download</a>'),
    'https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V24.zip'
  );
});

test('fails when Microsoft Learn has no Azure icons archive link', () => {
  const updater = new AzureIconsUpdater();

  assert.throws(
    () => updater.extractDownloadUrl('<a href="https://example.com/icons.zip">Download</a>'),
    /Could not find the Azure Public Service Icons ZIP link/
  );
});
