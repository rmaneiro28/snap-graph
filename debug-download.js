import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('Navigating...');
    await page.goto('http://localhost:5174/');
    
    console.log('Writing URL...');
    await page.fill('.snap-input', 'https://github.com');
    
    console.log('Clicking Snap It...');
    await page.click('button.btn-primary');
    
    console.log('Waiting for Preview to load...');
    await page.waitForTimeout(3000);
    
    console.log('Clicking Download...');
    
    // intercept the download or dialog
    page.on('dialog', async dialog => {
      console.log('DIALOG OPENED: ' + dialog.message());
      await dialog.dismiss();
    });

    await page.click('button:has-text("DESCARGAR PNG")');
    
    console.log('Waiting for download to process...');
    await page.waitForTimeout(5000);
    
    console.log('Test complete.');
  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
