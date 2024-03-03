const models = require('../models');

async function listContacts() {
  // const contacts = await models.Contact.findAll();
  // ↓↓association
  const contacts = await models.Contact.findAll({ include: 'category' });
  console.log(contacts.map((contact) => { return contact.name; }));

  for (const contact of contacts) {
    // const category = await contact.getCategory();
    // ↑↑getCategory()はcontact.jsで定義したアソシエーション
    // contactsテーブルの外部キーを辿ってcategoriesテーブルからnameを取得している

    // ↓↓EagerLoading（include...）で取得しているから.categoryできる
    const category = contact.category;
    if (category) {
      console.log('カテゴリのある連絡先');
      console.log(category.name, contact.name);
    }
  }

  const category = await models.Category.findOne();
  const categoryContacts = await category.getContacts();
  console.log(`カテゴリ: ${category.name}に属する連絡先`);
  console.log(categoryContacts.map((contact) => { return contact.name }));
}

listContacts();