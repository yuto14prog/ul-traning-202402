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
  const contacts = await models.Contact.findAll();
  res.render('index', { title: '連絡帳', now, contacts, view_counter: req.session.view_counter, flashMessage });
});

router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/contact_form', function (req, res, next) {
  res.render('contact_form', { title: '連絡先の作成', contact: {} });
});

router.get('/contacts/:id/edit', async function (req, res, next) {
  const contact = await models.Contact.findByPk(req.params.id);
  res.render('contact_form', { titile: '連絡先の更新', contact: contact });
});

router.post('/contacts', async function (req, res, next) {
  const fields = ['name', 'email'];
  try {
    console.log('posted', req.body);
    if (req.body.id) {
      // update
      const contact = await models.Contact.findByPk(req.body.id);
      // contact.name = req.body.name;
      // contact.email = req.body.email;
      contact.set(req.body);
      await contact.save({ fields });
      req.session.flashMessage = `「${contact.name}」さんを更新しました`;
    } else {
      // insert
      // const contact = models.Contact.build({ name: req.body.name, email: req.body.email });
      const contact = models.Contact.build(req.body);
      await contact.save({ fields });
      req.session.flashMessage = `新しい連絡先として「${contact.name}」さんを保存しました`;
    }
    res.redirect('/');
  } catch (err) {
    if (err instanceof ValidationError) {
      const title = (req.body.id) ? '連絡先の更新' : '連絡先の作成';
      res.render(`contact_form`, { title, contact: req.body, err: err });
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

module.exports = router;
