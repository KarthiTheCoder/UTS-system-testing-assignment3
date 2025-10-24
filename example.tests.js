// tests/example.test.js
import { Selector } from 'testcafe';

// --- Fixture + Hook (organising tests + common setup)
fixture('Example form flow')
  .page('https://devexpress.github.io/testcafe/example')
  .beforeEach(async t => {
    // runs before every test: prefill the name
    await t.typeText('#developer-name', 'Karthigeyan Sekar', { replace: true });
  });

// Reusable selectors (CSS + chaining by text)
const submitBtn   = Selector('#submit-button');
const header      = Selector('#article-header');
const triedChk    = Selector('label').withText('I have tried TestCafe').find('input');
const remoteChk   = Selector('label').withText('Support for testing on remote devices').find('input');
const osMacRadio  = Selector('label').withText('MacOS').find('input');
const commentsBox = Selector('#comments');

test('Happy path with multiple actions & assertions', async t => {
  await t
    // click a few options
    .click(triedChk)
    .click(remoteChk)
    .click(osMacRadio)
    // type a longer comment, using chaining
    .typeText(commentsBox, 'Running E2E with TestCafe in class.', { replace: true })
    // take a screenshot (saved under ./screenshots by default)
    .takeScreenshot()
    // submit
    .click(submitBtn)
    // --- Assertions (check expected outcomes)
    .expect(header.exists).ok('Header should exist after submit')
    .expect(header.innerText).contains('Thank you, Karthigeyan Sekar!')
    .expect(Selector('body').innerText).notContains('Error');
});
