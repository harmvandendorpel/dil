var express = require('express');
var router = express.Router();
import { WorkImageStatus } from '../const/const';
import Work from '../models/work';
import saveWorkImage from '../saveWorkImage';
import { saveOrganism, breed } from '../organisms';
import sha1 from 'sha1';
import Async from 'async';

router.get('/', function(req, res, next) {
  Work
    .find({enabled: true})
    .sort({_id:-1})
    .limit(100)
    .exec((err, works) => {
    res.render('pages/index', { title: 'death imitates language', works });
  });

});

router.get('/work/render', renderWork);
router.post('/api/delete/:hash', deleteWork);

router.get('/language/:hash', detailPage);

function deleteWork(req, res) {
  const hash = req.params.hash;
  Work.update(
    { hash },
    { enabled: false },
    {},
    () => {
      res.send({
        status: 'disabled'
      })
    }
  );
}

function detailPage(req, res) {
  const hash = req.params.hash;

  Work.find({hash}).exec((err, doc) => {
    const current = doc[0];
    const parents = current.parents;

    Async.parallel({
      parents: (callback) => {
        Work.find({
          hash: {
            $in: parents
          }
        }).exec((err, doc) => {
          callback(null, doc);
        });
      },
      siblings: (callback) => {
        parents.sort();
        Work.find({
          $and: [
            {
              hash: {
                $ne: hash
              }
            },
            {
              enabled: true
            },
            { parents }
          ]
        }).exec((err, docs) => {
          callback(null, docs);
        });
      }

    }, (err, results) => {
      res.render('pages/detail', {
        current,
        parents: results.parents,
        siblings: results.siblings
      });
    });
  });
}

router.get('/api/forceregenerate', (req, res) => {
  Work.update(
    {  },
    { imageStatus: WorkImageStatus.IMAGE_NONE },
    { multi:true },
    () => {
      res.send({
        result: {'status':'done'}
      });
    });
});

router.post('/api/saveimage', (req, res) => {
  saveWorkImage(req).then((data) => {

    Work.update(
      { hash:data.hash },
      { imageStatus: WorkImageStatus.IMAGE_READY },
      { multi:false },
      () => {
        res.send({
          result: 'done'
        });
      });
  });
});

router.post('/work/new', (req, res) => {
  const chromosome = req.body.chromosome;
  const title = req.body.title;
  const parents = req.body.parents || [];

  saveOrganism(title, chromosome, parents).then(
    (err) => res.send({
      status: 'ok',
      chromosome,
      title,
      err
    }),
    (err) => res.send(err)
  );
});

router.post('/work/breed', (req, res) => {
  const parents = req.body.parents;
  const count = req.body.count;

  parents.sort();

  breed(parents, count).then((result) => res.send(result));
});

router.get('/pages/breed/:p1/:p2', (req, res) =>{
  const p1 = req.params.p1;
  const p2 = req.params.p2;
  const count = 6;
  const parents = [p1,p2].sort();

  breed([p1, p2], count).then((result) => {
    Work.find({
      parents
    }).exec(function (err, docs) {
      res.render('breed', {p1, p2, works:docs});
    });
  });
});

router.get('/children/:p1/:p2', (req, res) =>{
  const p1 = req.params.p1;
  const p2 = req.params.p2;
  const parents = [p1,p2].sort();

  Work.find({
    parents
  }).exec(function (err, docs) {
    res.render('breed', {p1, p2, works:docs});
  });
});

function renderWork (req, res)  {
  const debugMode = false;

  Work.find({
    enabled: true,
    imageStatus: WorkImageStatus.IMAGE_NONE
  }).sort({_id:-1}).limit(1).exec(function (err, docs) {

    if (docs.length > 0 || debugMode) {
      let chromosome = null;
      let refreshHTML = '';
      if (debugMode) {
        chromosome = '';
        while (chromosome.length < 1024) {
          chromosome += Math.random() > 0.5 ? '0' : '1';
        }
      } else {
        const doc = docs[0];
        chromosome = doc.chromosome;
        refreshHTML = '<meta http-equiv="refresh" content="10">';
      }
      const hash = sha1(chromosome);

      res.end(`<!doctype html>
<html>
<head><title>generating ${hash}</title>${refreshHTML}<script>
window.chromosome = '${chromosome}';
window.hash = '${hash}';
</script><style>body {background-color:#eee; margin:100px}</style></head>
<body>
<canvas id="canvas"></canvas>
<script src="/js/jquery.js"></script>
<script src="/js/props.js"></script>
<script src="/js/workCanvas.js"></script>
</body>
</html>
`);
    } else {
      res.end(`<!doctype html>
<html><head><title>done</title><meta http-equiv="refresh" content="5"></head><body>completed</body></html>`);
    }
  });
}



module.exports = router;
