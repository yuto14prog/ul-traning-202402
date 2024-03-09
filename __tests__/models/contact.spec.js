const { Contact, sequelize } = require('../../models');
""
// このスコープ（最上位）の処理が終了したら発火 → DBと切断
afterAll(async () => {
  await sequelize.close();
});

test('1 + 5 = 6', () => {
  expect(1 + 5).toBe(6);
});

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

describe('#isExample', () => {
  test('emailのドメインがexample.comなら真を返すこと', () => {
    const contact = Contact.build({
      name: 'test',
      email: 'test@example.com',
    });
    expect(contact.isExample()).toBeTruthy();
  });
  test('emailのドメインがexample.comでないなら偽を返すこと', () => {
    const contact = Contact.build({
      name: 'test',
      email: 'test@notexample.com',
    });
    expect(contact.isExample()).toBeFalsy();
  });
});

describe(".latest", () => {
  // このスコープのテストが始まる直前に発火
  beforeEach(async () => {
    await Contact.bulkCreate([
      { name: 'test1', email: 'test1@example.com' },
      { name: 'test2', email: 'test2@example.com' },
      { name: 'test3', email: 'test3@example.com' },
      { name: 'test4', email: 'test4@example.com' },
      { name: 'test5', email: 'test5@example.com' },
    ]);
  });
  // このスコープのテストが終わった直後に発火
  afterEach(async () => {
    await Contact.destroy({ truncate: true });
  });

  test('引数なしなら新しい順に３件取得できること', async () => {
    const contacts = await Contact.latest();
    expect(contacts.length).toBe(3);
    expect(contacts[0].name).toBe('test5');
    expect(contacts[1].name).toBe('test4');
    expect(contacts[2].name).toBe('test3');
  });
  test('引数を指定したら新しい順に指定件数を取得できること', async () => {
    const contacts = await Contact.latest(2);
    expect(contacts.length).toBe(2);
    expect(contacts[0].name).toBe('test5');
    expect(contacts[1].name).toBe('test4');
  });
});

describe('.search', () => {
  beforeEach(async () => {
    await Contact.bulkCreate([
      {
        name: 'west3',
        email: 'west3-2@example.com',
        createdAt: new Date(2020, 10, 1),
      },
      {
        name: 'test2',
        email: 'test2@example.com',
        createdAt: new Date(2020, 10, 29),
      },
      {
        name: 'test3',
        email: 'test3@example.com',
        createdAt: new Date(2020, 10, 29),
      },
      {
        name: 'test3-2',
        email: 'test3-2@example.com',
        createdAt: new Date(2020, 10, 31),
      },
      {
        name: 'test5',
        email: 'test5@example.com',
        createdAt: new Date(2020, 10, 27),
      },
    ]);
  });
  afterEach(async () => {
    await Contact.destroy({ truncate: true });
  });

  test('nameでlike検索したレコードが取れること', async () => {
    const contacts = await Contact.search({ name: 'est3' });
    expect(contacts.length).toBe(3);
    expect(contacts[0].name).toBe('test3-2');
    expect(contacts[1].name).toBe('test3');
    expect(contacts[2].name).toBe('west3');
  });
  test('emailでlike検索したレコードが取れること', async () => {
    const contacts = await Contact.search({ email: '2@example' });
    expect(contacts.length).toBe(3);
    expect(contacts[0].name).toBe('test3-2');
    expect(contacts[1].name).toBe('test2');
    expect(contacts[2].name).toBe('west3');
  });
  describe('複合的な検索', () => {
    test('name、email の2要素で絞り込まれた結果が取得できること', async () => {
      const contacts = await Contact.search({ name: '3', email: '2@example' });
      expect(contacts.length).toBe(2);
      expect(contacts[0].name).toBe('test3-2');
      expect(contacts[1].name).toBe('west3');
    });
    test('sinceDaysAgoの日数分以前から作成されたレコードが取れること', async () => {
      Contact.getNow = jest.fn(() => new Date(2020, 11, 1));
      const contacts = await Contact.search({ sinceDaysAgo: 3 });
      expect(contacts.length).toBe(3);
      expect(contacts[0].name).toBe('test3-2');
      expect(contacts[1].name).toBe('test3');
      expect(contacts[2].name).toBe('test2');
    });
    test('name、email, sinceDaysAgo の3要素で絞り込まれた結果が取得できること', async () => {
      Contact.getNow = jest.fn(() => new Date(2020, 11, 1));
      const contacts = await Contact.search({
        name: '3',
        email: '2@example',
        sinceDaysAgo: 3,
      });
      expect(contacts.length).toBe(1);
      expect(contacts[0].name).toBe('test3-2');
    });
  });
});

