import Async from 'async';
import moment from 'moment';
import path from 'path';
import { each, shuffle } from 'lodash';

import { WorkImageStatus } from '../const/const';
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

      // res.send(fullPath);
      res.sendFile(path.resolve(fullPath));
    });
}

export function stripMongoNoise(o) {
  delete o._id;
  delete o.__v;

  each(o, (el) => {
    delete el._id;
    delete el.__v;
    delete el.chromosome;
  });

  return o;
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

      current.ago = moment(ts).fromNow();

      current.birthday = moment(ts).format('MMMM Do YYYY');

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
        console.log('resolved');
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



