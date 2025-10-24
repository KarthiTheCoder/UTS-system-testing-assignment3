import { Selector } from 'testcafe';

fixture('Example form flow')
  .page('https://devexpress.github.io/testcafe/example')
  .beforeEach(async t => {
    await t.typeText('#developer-name', 'Karthigeyan Sekar', { replace: true });
  });

const submitBtn   = Selector('#submit-button');
const header      = Selector('#article-header');
const triedChk    = Selector('label').withText('I have tried TestCafe').find('input');
const remoteChk   = Selector('label').withText('Support for testing on remote devices').find('input');
const osMacRadio  = Selector('label').withText('MacOS').find('input');
const commentsBox = Selector('#comments');

test('Happy path with multiple actions & assertions', async t => {
  await t
    .click(triedChk)
    .click(remoteChk)
    .click(osMacRadio)
    .typeText(commentsBox, 'Running E2E with TestCafe in class.', { replace: true })
    .takeScreenshot()
    .click(submitBtn)
    .expect(header.exists).ok('Header should exist after submit')
    .expect(header.innerText).contains('Thank you, Karthigeyan Sekar!')
    .expect(Selector('body').innerText).notContains('Error');
});
