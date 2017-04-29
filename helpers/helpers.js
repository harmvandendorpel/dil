import Async from 'async';
import moment from 'moment';
import path from 'path';

import Work from '../models/work';

export function randomWork(size, req, res) {
  Work
    .find({
      frozen: true,
      enabled: true
    })
    .sort({ _id: -1 })
    .exec((err, works) => {
      const work = works[Math.floor(works.length * Math.random())];
      const fullPath = [__dirname, '../public/works', size, work.filename].join('/');

      res.sendFile(path.resolve(fullPath));
    });
}

export function render(page, data, req, res) {
  data = data || {};
  data.authenticated = req.session.authenticated;
  res.render(page, data);
}

export function auth(req, res) {
  if (!req.session.authenticated) {
    res.status(500).send({
      status: 'access denied'
    });
    return false;
  }
  return true;
}

export function workData(hashPart) {
  return new Promise((resolve) => {
    Work.find({
      hash: new RegExp('^' + hashPart, 'i')
    }).lean().exec((err, doc) => {
      const current = doc[0];
      const ts = current._id.getTimestamp();
      const m = moment(ts);

      current.ago = m.fromNow();
      current.year = m.year();

      current.birthday = m.format('MMMM Do YYYY');

      if (!current) {
        res.status(404).send('not found');
        return;
      }

      const parents = current.parents;

      Async.parallel({
        current: (callback) => {
          callback(null, current);
        },
        parents: (callback) => {
          Work.find({
            hash: {
              $in: parents
            }
          }).lean().exec((err, doc) => {
            callback(null, doc);
          });
        },
        siblings: (callback) => {
          parents.sort();
          Work.find({
            $and: [
              {
                hash: {
                  $ne: current.hash
                }
              },
              { enabled: true },
              { parents }
            ]
          }).limit(10).lean().exec((err, docs) => {
            callback(null, docs);
          });
        },
        children: (callback) => {
          Work.find({
            $and: [
              {
                parents: current.hash
              },
              {
                enabled: true
              }
            ]
          }).limit(10).lean().exec((err, docs) => {
            callback(null, docs);
          });
        }
      }, (err, results) => {
        resolve(results);
      });
    });
  });
}

export function oneHit(hash) {
  Work.update(
    { hash },
    {
      $inc: {
        hits: 1
      }
    },
    {},
    () => { }
  );
}

export function theWorks() {
  return new Promise((resolve) => {
    Work.find({
      imageStatus: 2
    }, {
      __v: false,
      _id: false,
      chromosome: false,
      hits: false,
      imageStatus: false,
      frozen: false,
      ts: false
    })
      .sort({ _id: -1 })
      .lean().exec((err, docs) => {
      resolve(docs);
    });
  });
}

export function bookData() {
  return new Promise((resolve) => {
    Work
      .find({
        imageStatus: 2
      }, {
        __v: false,
        _id: false,
      })
      .sort({ _id: -1 })
      .limit(25)
      .lean().exec((err, docs) => {
        const injectFamilyInfoList = docs.map((work) => {
          return (callback) => {
            console.log(work.hash);
            workData(work.hash).then((result) => {
              callback(null, result);
            });
          }
        });

        Async.parallel(injectFamilyInfoList, (error, results) => {
          console.log(results);
          resolve(results);
        });
      });
  });
}