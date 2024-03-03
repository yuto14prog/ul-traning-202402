const models = require('../models');

async function createContact() {
  const num = (new Date()).getTime();
  const contact = models.Contact.build({
    name: `test${num}`,
    email: `${num}@example.com`,
    categoryId: 3
  });
  console.log(contact);
  await contact.save();
}

createContact();