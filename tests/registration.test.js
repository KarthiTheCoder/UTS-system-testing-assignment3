import { Selector } from 'testcafe';

fixture`User Registration Test`
    .page`https://ecommerce-playground.lambdatest.io/index.php?route=account/register`;

test('Register a new user successfully', async t => {
    await t.maximizeWindow(); // full screen

    const firstName       = Selector('#input-firstname');
    const lastName        = Selector('#input-lastname');
    const email           = Selector('#input-email');
    const telephone       = Selector('#input-telephone');
    const password        = Selector('#input-password');
    const confirmPassword = Selector('#input-confirm');
    const privacyLabel    = Selector('label[for="input-agree"]');  // ✅ new label selector
    const continueBtn     = Selector('input[value="Continue"]');

    await t
        .typeText(firstName, 'John')
        .typeText(lastName, 'Smith')
        .typeText(email, `johnsmith${Math.floor(Math.random()*10000)}@testmail.com`)
        .typeText(telephone, '0400123456')
        .typeText(password, 'Test@123')
        .typeText(confirmPassword, 'Test@123')
        .click(privacyLabel)   // ✅ fixed variable name here
        .click(continueBtn);

    const successMessage = Selector('h1').withText('Your Account Has Been Created!');
    await t.expect(successMessage.exists).ok('Registration success message is not visible');
});
