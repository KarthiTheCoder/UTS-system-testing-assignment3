import { Selector } from 'testcafe';

const BASE_URL = 'https://ecommerce-playground.lambdatest.io';
const PASSWORD = 'Test@123';

// safely register the user if not already registered ---
async function safeRegister(t, email, password) {
    await t.navigateTo(`${BASE_URL}/index.php?route=account/register`);

    const firstName       = Selector('#input-firstname');
    const lastName        = Selector('#input-lastname');
    const emailField      = Selector('#input-email');
    const telephone       = Selector('#input-telephone');
    const passwordField   = Selector('#input-password');
    const confirmPassword = Selector('#input-confirm');
    const privacyLabel    = Selector('label[for="input-agree"]');
    const continueBtn     = Selector('input[value="Continue"]');
    const warningMsg      = Selector('.alert-danger').withText('Warning: E-Mail Address is already registered!');

    await t
        .typeText(firstName, 'Karthigeyan', { replace: true })
        .typeText(lastName, 'Sekar', { replace: true })
        .typeText(emailField, email, { replace: true })
        .typeText(telephone, '0400123456', { replace: true })
        .typeText(passwordField, password, { replace: true })
        .typeText(confirmPassword, password, { replace: true })
        .click(privacyLabel)
        .click(continueBtn);

    // If email already registered, ignores and proceed
    if (await warningMsg.exists) {
        console.log('Email already registered — skipping registration.');
    } else {
        const successMessage = Selector('h1').withText('Your Account Has Been Created!');
        await t.expect(successMessage.exists).ok('Registration success message not visible');
        console.log('New test account registered successfully.');
    }
}

fixture`User Login Tests`
    .page`${BASE_URL}/index.php?route=account/login`;

// simple generator to append random numbers to "karthigeyan"
function generateKarthiEmail() {
    const rand = Math.floor(Math.random() * 900000) + 10000; // 5-6 digit random number
    return `karthigeyan${rand}@gmail.com`;
}

test('Login with valid credentials', async t => {
    await t.maximizeWindow();

    // Generate a fresh unique email for this run
    const email = generateKarthiEmail();

    // Ensure the account exists (register if needed)
    await safeRegister(t, email, PASSWORD);

    // Logout to start clean
    await t.navigateTo(`${BASE_URL}/index.php?route=account/logout`);
    const logoutHeader = Selector('h1, h2').withText('Account Logout');
    await t.expect(logoutHeader.exists).ok('Logout page not visible');

    // Navigate to login page
    await t.navigateTo(`${BASE_URL}/index.php?route=account/login`);

    // Perform login
    const emailField    = Selector('#input-email');
    const passwordField = Selector('#input-password');
    const loginButton   = Selector('input[value="Login"]');
    const myAccountHdr  = Selector('h2').withText('My Account');

    await t
        .typeText(emailField, email, { replace: true })
        .typeText(passwordField, PASSWORD, { replace: true })
        .click(loginButton)
        .expect(myAccountHdr.exists)
        .ok('User not redirected to My Account page after login');

    await t.takeScreenshot({ path: 'login-success.png', fullPage: true });
});

test('Login fails with invalid credentials', async t => {
    await t.maximizeWindow();

    await t.navigateTo(`${BASE_URL}/index.php?route=account/login`);

    const emailField    = Selector('#input-email');
    const passwordField = Selector('#input-password');
    const loginButton   = Selector('input[value="Login"]');
    const warningMsg    = Selector('.alert-danger').withText('Warning');

    await t
        .typeText(emailField, 'fakeuser@gmail.com', { replace: true })
        .typeText(passwordField, 'WrongPass123', { replace: true })
        .click(loginButton)
        .expect(warningMsg.exists)
        .ok('No warning displayed for invalid login');

    await t.takeScreenshot({ path: 'login-failure.png', fullPage: true });
});
