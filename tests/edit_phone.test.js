import { Selector } from 'testcafe';

const BASE = 'https://ecommerce-playground.lambdatest.io';
const PASSWORD = 'Test@123';

// --- helpers ---
function uniqueEmail(base = 'karthigeyan', domain = 'example.com') {
  return `${base}.${Date.now()}@${domain}`;
}

function randomAuMobile() {
  // AU mobile format like +614XXXXXXXX
  const eightDigits = Math.floor(10_000_000 + Math.random() * 89_999_999).toString();
  return `+614${eightDigits}`;
}

async function registerNewUser(t, email, password) {
  await t.navigateTo(`${BASE}/index.php?route=account/register`);

  await t
    .typeText('#input-firstname', 'Karthigeyan', { replace: true })
    .typeText('#input-lastname',  'Sekar',       { replace: true })
    .typeText('#input-email',     email,         { replace: true })
    .typeText('#input-telephone', '+61412345678', { replace: true })
    .typeText('#input-password',  password,      { replace: true })
    .typeText('#input-confirm',   password,      { replace: true })
    .click('label[for="input-agree"]')
    .click('input[value="Continue"]');

  const success = Selector('h1').withText('Your Account Has Been Created!');
  await t.expect(success.exists).ok('Registration did not succeed');
}

fixture`Edit Account - Change Telephone`
  .page`${BASE}/index.php?route=account/login`;

test('Change telephone number only on Edit Account', async t => {
  await t.maximizeWindow();

  // 1) Create a fresh test account so we don’t touch any real data
  const email = uniqueEmail();
  await registerNewUser(t, email, PASSWORD);

  // 2) Go to Edit Account page
  await t.navigateTo(`${BASE}/index.php?route=account/edit`);

  const telephoneField = Selector('#input-telephone');
  const continueBtn    = Selector('input[value="Continue"]');
  const successAlert   = Selector('.alert-success');

  // capture existing value to optionally revert later
  const originalPhone  = await telephoneField.value;
  const newPhone       = randomAuMobile();

  // 3) Change only the telephone field
  await t
    .selectText(telephoneField).pressKey('delete')     // clear safely
    .typeText(telephoneField, newPhone)
    .click(continueBtn);

  // 4) Verify success message
  await t
    .expect(successAlert.exists)
    .ok('Success message not shown after updating telephone');

  await t.takeScreenshot({ path: 'edit-phone-success.png', fullPage: true });

  // --- Optional cleanup: revert phone number back
  await t
    .navigateTo(`${BASE}/index.php?route=account/edit`)
    .selectText(telephoneField).pressKey('delete')
    .typeText(telephoneField, originalPhone || '+61412345678')
    .click(continueBtn)
    .expect(successAlert.exists).ok();

  await t.takeScreenshot({ path: 'edit-phone-reverted.png', fullPage: true });
});

// Optional negative case (extra marks): blank phone should trigger validation
test('Edit Account shows validation when telephone is empty', async t => {
  await t.maximizeWindow();

  // fresh account again
  const email = uniqueEmail();
  await registerNewUser(t, email, PASSWORD);

  await t.navigateTo(`${BASE}/index.php?route=account/edit`);

  const telephoneField = Selector('#input-telephone');
  const continueBtn    = Selector('input[value="Continue"]');
  const anyError       = Selector('.text-danger, .alert-danger').filterVisible();

  await t
    .selectText(telephoneField).pressKey('delete')
  // some sites need at least one blur before showing error; clicking Continue is fine
    .click(continueBtn)
    .expect(anyError.exists)
    .ok('Expected validation error not shown for empty telephone');

  await t.takeScreenshot({ path: 'edit-phone-validation.png', fullPage: true });
});
