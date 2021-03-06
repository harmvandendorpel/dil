import RSS from 'rss';
import moment from 'moment';

import { WorkImageStatus } from '../const/const';
import Work from '../models/work';
import {
  auth,
  workData,
  theWorks,
  frozenWorkData
} from '../helpers/helpers';
import { breed, getNames, generateName } from '../organisms';
import saveWorkImage from '../saveWorkImage';

function login(req, res) {
  const session = req.session;
  let result = null;

  if (session.authenticated) {
    result = 'already authenticated';
  } else {
    result = 'newly authenticated';
    session.authenticated = true;
  }

  res.send({ result });
}

function logout(req, res) {
  const session = req.session;
  let result = null;

  if (session.authenticated) {
    session.authenticated = false;
    result = 'logged out now';
  } else {
    result = 'not logged in yet';
  }

  res.send({ result });
}

function deleteWork(req, res) {
  if (!auth(req, res)) return;

  const hash = req.params.hash;

  Work.update(
    { hash, frozen: { $ne: true } },
    { enabled: false },
    {},
    () => {
      res.send({
        status: 'disabled'
      });
    }
  );
}

function createOffspring(req, res) {
  if (!auth(req, res)) return;

  const parents = req.body.parents;
  const count = req.body.count;

  parents.sort();

  breed(parents, count).then(result => res.send(result));
}

function freezeWork(req, res, frozen) {
  if (!auth(req, res)) return;

  const hash = req.params.hash;

  Work.update(
    { hash },
    { frozen },
    {},
    () => {
      res.send({
        status: 'done',
        frozen
      });
    }
  );
}

function rerenderWork(req, res) {
  if (!auth(req, res)) return;

  const hash = req.params.hash;

  Work.update(
    { hash },
    { imageStatus: WorkImageStatus.IMAGE_NONE },
    {},
    () => {
      res.send({
        status: 'done'
      });
    }
  );
}

export default function (router) {
  router.get('/api/login/303', login);
  router.get('/api/logout', logout);
  router.post('/api/delete/:hash', deleteWork);
  router.post('/api/freeze/:hash', (req, res) => freezeWork(req, res, true));
  router.post('/api/rerender/:hash', (req, res) => rerenderWork(req, res));
  router.delete('/api/freeze/:hash', (req, res) => freezeWork(req, res, false));
  router.post('/api/breed', createOffspring);

  router.get('/api/works', (req, res) => {
    theWorks().then((results) => {
      res.send(results);
    });
  });

  router.get('/api/work/:hash', (req, res) => {
    const hash = req.params.hash;
    workData(hash).then((results) => {
      res.send(results);
    });
  });

  router.get('/feed', (req, res) => {
    frozenWorkData().then((results) => {
      const rss = new RSS({
        title: 'Death Imitates Language',
        feed_url: 'https://deathimitateslanguage.harmvandendorpel.com/feed',
        image_url: `https://deathimitateslanguage.harmvandendorpel.com/works/full/${results[0].current.filename}`,
        site_url: 'http://death.imitates.org'
      });

      const reversed = results.reverse();

      reversed.forEach((item) => {
        rss.item({
          date: moment(item.current.ts),
          description: `<img src="https://deathimitateslanguage.harmvandendorpel.com/works/medium/${item.current.filename}">`,
          url: `https://deathimitateslanguage.harmvandendorpel.com/language/${item.current.hash}`,
          title: [item.current.title, item.parents[0].title, item.parents[1].title].join(' '),
          author: 'Harm van den Dorpel',
          enclosure: {
            url: `https://deathimitateslanguage.harmvandendorpel.com/works/full/${item.current.filename}`,
            type: 'image/jpeg'
          }
        });
      });
      res.set('Content-Type', 'text/xml');
      res.send(rss.xml());
    });
  });

  router.get('/api/frozen', (req, res) => {
    frozenWorkData().then(works =>
      res.send(works)
    );
  });

  router.get('/api/forceregenerate', (req, res) => {
    if (!auth(req, res)) return;

    Work.update(
      { enabled: true, frozen: false },
      { imageStatus: WorkImageStatus.IMAGE_NONE },
      { multi: true },
      () => {
        res.send({
          result: { status: 'done' }
        });
      });
  });

  router.get('/api/forceregenerate/:hash', (req, res) => {
    if (!auth(req, res)) return;
    const hash = req.params.hash;

    Work.update(
      { enabled: true, frozen: false, hash },
      { imageStatus: WorkImageStatus.IMAGE_NONE },
      { multi: false },
      () => {
        res.send({
          result: { status: 'done' }
        });
      });
  });

  router.get('/api/forcerename', (req, res) => {
    if (!auth(req, res)) return;

    getNames((contents) => {
      Work.find({}).exec((err, docs) => {
        docs.forEach((doc) => {
          if (doc.title && doc.title.toLowerCase() !== 'adam' && doc.title.toLowerCase() !== 'eve') {
            Work.update(
              { hash: doc.hash },
              { title: generateName(contents, doc.chromosome) },
              {},
              () => {
                console.log(doc.title);
              }
            );
          }
        });

        res.send({
          result: { status: 'done' }
        });
      });
    });
  });

  router.post('/api/saveimage', (req, res) => {
    if (!auth(req, res)) return;

    saveWorkImage(req).then((data) => {
      Work.update(
        { hash: data.hash },
        { imageStatus: WorkImageStatus.IMAGE_READY },
        { multi: false },
        () => {
          res.send({
            result: 'done'
          });
        });
    });
  });
}
