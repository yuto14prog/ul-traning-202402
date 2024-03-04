var express = require('express');
var router = express.Router();
const models = require('../models');
const { ValidationError } = require('sequelize');

/* GET home page. */
router.get('/', async function (req, res, next) {
  req.session.view_counter = (req.session.view_counter || 0) + 1;
  const flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;

  const now = new Date();
  const contacts = await models.Contact.findAll({ include: 'category' });
  const categories = await models.Category.findAll();
  res.render('index', { title: '連絡帳', now, contacts, categories, view_counter: req.session.view_counter, flashMessage });
});

router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/contact_form', async function (req, res, next) {
  const categories = await models.Category.findAll();
  res.render('contact_form', { title: '連絡先の作成', contact: {}, categories });
});

router.get('/contacts/:id/edit', async function (req, res, next) {
  const contact = await models.Contact.findByPk(req.params.id);
  const categories = await models.Category.findAll();
  res.render('contact_form', { titile: '連絡先の更新', contact: contact, categories });
});

router.post('/contacts', async function (req, res, next) {
  const fields = ['name', 'email', 'categoryId'];
  try {
    console.log('posted', req.body);
    if (req.body.id) {
      // update
      const contact = await models.Contact.findByPk(req.body.id);
      // contact.name = req.body.name;
      // contact.email = req.body.email;
      contact.set(req.body);
      if (contact.categoryId == '') {
        contact.categoryId = null;
      }
      await contact.save({ fields });
      req.session.flashMessage = `「${contact.name}」さんを更新しました`;
    } else {
      // insert
      // const contact = models.Contact.build({ name: req.body.name, email: req.body.email });
      const contact = models.Contact.build(req.body);
      if (contact.categoryId == '') {
        contact.categoryId = null;
      }
      await contact.save({ fields });
      req.session.flashMessage = `新しい連絡先として「${contact.name}」さんを保存しました`;
    }
    res.redirect('/');
  } catch (err) {
    if (err instanceof ValidationError) {
      const title = (req.body.id) ? '連絡先の更新' : '連絡先の作成';
      const categories = await models.Category.findAll();
      res.render(`contact_form`, { title, contact: req.body, err: err, categories });
    } else {
      throw err;
    }
  }
});

router.post('/contacts/:id/delete', async function (req, res, next) {
  console.log(req.params);
  const contact = await models.Contact.findByPk(req.params.id);
  await contact.destroy();
  req.session.flashMessage = `「${contact.name}」さんを削除しました`;
  res.redirect('/');
});

router.get('/categories/:id', async function (req, res, next) {
  const category = await models.Category.findByPk(req.params.id);
  const contacts = await category.getContacts({ include: 'category' });
  res.render('category', { title: `カテゴリ ${category.name}`, category, contacts });
});

router.get('/category_form', async function (req, res, next) {
  res.render('category_form', { title: 'カテゴリの作成', category: {} });
});

router.post('/categories', async function (req, res, next) {
  try {
    if (req.body.id) {
      const category = await models.Category.findByPk(req.body.id);
      category.name = req.body.name;
      await category.save();
      req.session.flashMessage = `カテゴリ「${category.name}」を更新しました`;
      res.redirect('/');
    } else {
      const category = models.Category.build({ name: req.body.name });
      await category.save();
      req.session.flashMessage = `新しいカテゴリ「${category.name}」を保存しました`;
      res.redirect('/');
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      const title = (req.body.id) ? '連絡先の更新' : '連絡先の作成';
      res.render(`category_form`, { title, contact: req.body, err, category: {} });
    }
    res.redirect('/');
  }
});

router.post('/category/:id/delete', async function (req, res, next) {
  const category = await models.Category.findByPk(req.params.id);
  await category.destroy();
  req.session.flashMessage = `カテゴリ「${category.name}」を削除しました`;
  res.redirect('/');
});

router.get('/category/:id/edit', async function (req, res, next) {
  const category = await models.Category.findByPk(req.params.id);
  res.render('category_form', { title: 'カテゴリの更新', category });
});

module.exports = router;
