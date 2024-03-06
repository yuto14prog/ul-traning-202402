const { Contact } = require('../../models');

// test('1 + 5 = 6', () => {
//   expect(1 + 5).toBe(6);
// });

describe('validations', () => {
  test('validであること', async () => {
    const contact = Contact.build({ name: 'test', email: 'test@example.com' });
    await expect(contact.validate()).resolves.toBeTruthy();
    // 非同期が成功して正常である
  });

  test('nameが空文字ならバリデーションエラーになること', async () => {
    const contact = Contact.build({ name: '', email: 'test@example.com' });
    await expect(contact.validate()).rejects.toThrow("Validation error: Validation notEmpty on name failed");
    // 非同期が失敗して""というエラーを吐く
  });

  test('emailが空文字ならバリデーションエラーになること', async () => {
    const contact = Contact.build({ name: 'test', email: '' });
    await expect(contact.validate()).rejects.toThrow("Validation error: Validation notEmpty on email failed");
  });

  test('emailのフォーマットが合わないならバリデーションエラーになること', async () => {
    const contact = Contact.build({ name: 'test', email: 'test' });
    await expect(contact.validate()).rejects.toThrow("Validation error: Validation isEmail on email failed");
  });
});
