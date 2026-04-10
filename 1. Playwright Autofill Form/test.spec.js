    const { test, expect } = require('@playwright/test');

const formUrl = 'https://demoqa.com/automation-practice-form';

const students = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    gender: 'Male',
    mobile: '1234567890',
    subject: 'Maths',
    hobbies: ['Sports'],
    address: '12 Maple Street',
    state: 'NCR',
    city: 'Delhi',
  },
  {
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@example.com',
    gender: 'Female',
    mobile: '2345678901',
    subject: 'English',
    hobbies: ['Reading'],
    address: '45 Green Avenue',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
  },
  {
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'ravi.kumar@example.com',
    gender: 'Other',
    mobile: '3456789012',
    subject: 'Computer Science',
    hobbies: ['Music'],
    address: '78 Sunrise Road',
    state: 'Haryana',
    city: 'Panipat',
  },
  {
    firstName: 'Sophia',
    lastName: 'Garcia',
    email: 'sophia.garcia@example.com',
    gender: 'Female',
    mobile: '4567890123',
    subject: 'Physics',
    hobbies: ['Sports', 'Music'],
    address: '91 Ocean Drive',
    state: 'Rajasthan',
    city: 'Jaipur',
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    gender: 'Male',
    mobile: '5678901234',
    subject: 'Chemistry',
    hobbies: ['Sports', 'Reading'],
    address: '23 Pine Lane',
    state: 'NCR',
    city: 'Noida',
  },
];

const genderLabels = {
  Male: 'gender-radio-1',
  Female: 'gender-radio-2',
  Other: 'gender-radio-3',
};

const hobbyLabels = {
  Sports: 'hobbies-checkbox-1',
  Reading: 'hobbies-checkbox-2',
  Music: 'hobbies-checkbox-3',
};

async function removeBlockingAds(page) {
  await page.evaluate(() => {
    document.querySelectorAll('iframe, #fixedban, [id^="google_ads"], .adsbygoogle').forEach((element) => {
      element.remove();
    });
  });
}

async function chooseReactSelectOption(page, dropdownId, option) {
  await page.locator(dropdownId).click();
  await page.getByText(option, { exact: true }).click();
}

async function chooseSubject(page, subject) {
  await page.locator('#subjectsInput').fill(subject);
  await page.locator('#react-select-2-option-0').click();
}

async function submitPracticeForm(page, student) {
  await page.goto(formUrl);
  await removeBlockingAds(page);

  await page.locator('#firstName').fill(student.firstName);
  await page.locator('#lastName').fill(student.lastName);
  await page.locator('#userEmail').fill(student.email);
  await page.locator(`label[for="${genderLabels[student.gender]}"]`).click();
  await page.locator('#userNumber').fill(student.mobile);

  await chooseSubject(page, student.subject);

  for (const hobby of student.hobbies) {
    await page.locator(`label[for="${hobbyLabels[hobby]}"]`).click({ force: true });
  }

  await page.locator('#currentAddress').fill(student.address);
  await chooseReactSelectOption(page, '#state', student.state);
  await chooseReactSelectOption(page, '#city', student.city);

  await removeBlockingAds(page);
  await page.locator('#submit').click({ force: true });
}

async function expectConfirmationModal(page, student) {
  const modal = page.locator('.modal-content');
  const table = modal.locator('tbody');

  await expect(modal).toBeVisible();
  await expect(modal.locator('#example-modal-sizes-title-lg')).toHaveText('Thanks for submitting the form');
  await expect(table).toContainText(`${student.firstName} ${student.lastName}`);
  await expect(table).toContainText(student.email);
  await expect(table).toContainText(student.gender);
  await expect(table).toContainText(student.mobile);
  await expect(table).toContainText(student.subject);
  await expect(table).toContainText(student.hobbies.join(', '));
  await expect(table).toContainText(student.address);
  await expect(table).toContainText(`${student.state} ${student.city}`);
}

test.describe('DemoQA Practice Form positive scenarios', () => {
  for (const student of students) {
    test(`submits valid form for ${student.firstName} ${student.lastName}`, async ({ page }) => {
      await submitPracticeForm(page, student);
      await expectConfirmationModal(page, student);
    });
  }
});
