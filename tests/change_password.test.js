import { Selector } from 'testcafe';

const BASE = 'https://ecommerce-playground.lambdatest.io';
const LOGIN_URL = `${BASE}/index.php?route=account/login`;
const PASSWORD_URL = `${BASE}/index.php?route=account/password`;

// Use your dummy account
const EMAIL             = 'karthigeyan@gmail.com';
const ORIGINAL_PASSWORD = 'Test@123';
const NEW_PASSWORD      = 'NewTest@123';  // keep simple and valid; we’ll revert in same test

// ------- page models -------
const LoginPage = {
  email: Selector('#input-email'),
  password: Selector('#input-password'),
  loginBtn: Selector('input[value="Login"]'),
  myAccountHeader: Selector('h2').withText('My Account')
};

const PasswordPage = {
  url: PASSWORD_URL,
  password: Selector('#input-password'),
  confirm: Selector('#input-confirm'),
  continueBtn: Selector('input[value="Continue"]'),
  success: Selector('.alert-success').withText('Success: Your password has been successfully updated.'),
  anyError: Selector('.text-danger, .alert-danger').filterVisible()
};

const AccountPages = {
  logoutUrl: `${BASE}/index.php?route=account/logout`,
  logoutHeader: Selector('h1, h2').withText('Account Logout')
};

// ------- helpers -------
async function login(t, email, password) {
  await t
    .navigateTo(LOGIN_URL)
    .typeText(LoginPage.email, email, { replace: true })
    .typeText(LoginPage.password, password, { replace: true })
    .click(LoginPage.loginBtn)
    .expect(LoginPage.myAccountHeader.exists)
    .ok('Login did not reach My Account');
}

async function changePassword(t, newPass) {
  await t.navigateTo(PasswordPage.url);
  await t
    .typeText(PasswordPage.password, newPass, { replace: true })
    .typeText(PasswordPage.confirm, newPass, { replace: true })
    .click(PasswordPage.continueBtn)
    .expect(PasswordPage.success.exists)
    .ok('No success alert after changing password', { timeout: 7000 });
}

async function logout(t) {
  await t.navigateTo(AccountPages.logoutUrl);
  await t.expect(AccountPages.logoutHeader.exists).ok('Logout page not shown');
}

// ------- tests -------
fixture`Change Password`.page(LOGIN_URL);

test('Change password, verify by re-login, then revert', async t => {
  await t.maximizeWindow();

  // 1) Login with original password
  await login(t, EMAIL, ORIGINAL_PASSWORD);

  // 2) Change to NEW password
  await changePassword(t, NEW_PASSWORD);
  await t.takeScreenshot({ path: 'password-change-success.png', fullPage: true });

  // 3) Logout and re-login with NEW password to verify
  await logout(t);
  await login(t, EMAIL, NEW_PASSWORD);
  await t.takeScreenshot({ path: 'password-login-with-new.png', fullPage: true });

  // 4) Revert back to ORIGINAL so other tests still pass
  await changePassword(t, ORIGINAL_PASSWORD);
  await t.takeScreenshot({ path: 'password-reverted-success.png', fullPage: true });

  // 5) Final proof: logout and login again with ORIGINAL
  await logout(t);
  await login(t, EMAIL, ORIGINAL_PASSWORD);
  await t.takeScreenshot({ path: 'password-final-login-original.png', fullPage: true });
});

test('Password change validation: mismatch confirm shows error', async t => {
  await t.maximizeWindow();

  // Login first
  await login(t, EMAIL, ORIGINAL_PASSWORD);

  // Try to set mismatched confirmation
  await t.navigateTo(PasswordPage.url);
  await t
    .typeText(PasswordPage.password, 'Mismatch@123', { replace: true })
    .typeText(PasswordPage.confirm, 'Mismatch@1234', { replace: true })
    .click(PasswordPage.continueBtn)
    .expect(PasswordPage.anyError.exists)
    .ok('Expected a validation error for mismatched confirmation');

  await t.takeScreenshot({ path: 'password-mismatch-validation.png', fullPage: true });
});
