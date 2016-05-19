var express = require('express');
var router = express.Router();
import { WorkImageStatus } from '../const/const';
import Work from '../models/work';
import saveWorkImage from '../saveWorkImage';
import { saveOrganism, breed } from '../organisms';
import sha1 from 'sha1';
import Async from 'async';

router.get('/', function(req, res) {
  Work
    .find({enabled: true})
    .sort({_id:-1})
    //.limit(250)
    .exec((err, works) => {
    render('pages/index', { title: 'entire population', works }, req, res);
  });
});

router.get('/about', (req, res) => {
  render('pages/about', { title: 'about' }, req, res);
});

router.get('/freezer', function(req, res) {
  Work
    .find({
      frozen: true,
      enabled: true
    })
    .sort({_id:-1})
    .exec((err, works) => {
      render('pages/freezer', { title: 'freezer', works }, req, res);
    });
});

router.get('/layer/render/:hash/:layer', renderLayer);
router.get('/language/:hash', detailPage);
router.get('/dissect/:hash', dissectPage);

router.get('/work/render', renderWork);

router.get('/api/login', login);
router.get('/api/logout', logout);
router.post('/api/delete/:hash', deleteWork);

router.post('/api/freeze/:hash', (req, res) => {
  freezeWork(req,res, true)
});

router.post('/api/rerender/:hash', (req, res) => {
  rerenderWork(req, res)
});

router.delete('/api/freeze/:hash', (req, res) => {
  freezeWork(req,res, false);
});

router.post('/api/breed', createOffspring);

function login(req, res) {
  const session = req.session;
  let result = null;

  if (session.authenticated) {
    result = 'already authenticated';
  } else {
    result = 'newly authenticated';
    session.authenticated = true;
  }

  res.send({
    result
  });
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

  res.send({
    result
  });
}

function render(page, data, req, res) {
  data = data || {};
  data.authenticated = req.session.authenticated;
  res.render(page, data);
}

function auth(req, res) {
  if (!req.session.authenticated) {
    res.status(500).send({
      status: 'access denied'
    });
    return false;
  }
  return true;
}

function deleteWork(req, res) {
  if (!auth(req, res)) return;

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
      })
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
        }).limit(10).exec((err, docs) => {
          callback(null, docs);
        });
      }

    }, (err, results) => {
      render('pages/detail', {
        script: 'DetailPage',
        title: hash.substring(0,8),
        current,
        parents: results.parents,
        siblings: results.siblings
      }, req, res);
    });
  });
}


// backPrint : ['back-print','organ-00'],
// foil :['foil'],
// frontPrint1: ['organ-01'],
// frontPrint2: ['organ-02'],
// frontPrint3: ['organ-03'],
// things:['things'],
// CNC: ['cuts']


function dissectPage(req, res) {
  const hash = req.params.hash;
  Work.update(
    { hash },
    { needsDissecting: true },
    {},
    () => {
      Work.find({hash}).exec((err, doc) => {
        const current = doc[0]
        render('pages/dissect', {
          layers:['backPrint','frontPrint1','frontPrint2','frontPrint3','things'],
          current
        }, req, res);
      });
    }
  );
}

router.get('/api/forceregenerate', (req, res) => {
  if (!auth(req, res)) return;

  Work.update(
    { enabled: true },
    { imageStatus: WorkImageStatus.IMAGE_NONE },
    { multi:true },
    () => {
      res.send({
        result: {'status':'done'}
      });
    });
});

router.post('/api/saveimage', (req, res) => {
  if (!auth(req, res)) return;

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
  if (!auth(req, res)) return;

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

function createOffspring(req, res)  {
  if (!auth(req, res)) return;

  const parents = req.body.parents;
  const count = req.body.count;

  parents.sort();

  breed(parents, count).then((result) => res.send(result));
}

function displayRenderPage(options, res) {
  const chromosome = options.chromosome;
  const hash = sha1(chromosome);

  res.end(`<!doctype html>
<html>
<head><title>generating ${hash}</title><script>
window.chromosome = '${chromosome}';
window.hash       = '${hash}';
window.layer      = ${options.layer ? "'" + options.layer + "'":null};
window.save       = ${options.save ? 'true':'false'};
</script><style>
body {background-color:#eee; margin:0px}
#btn-download {position:absolute;top:10px;left:10px;font-size:64px;}
</style></head>
<body>
<canvas id="canvas"></canvas>
<a href='#' id="btn-download">download</a>
<script src="/js/jquery.js"></script>
<script src="/js/props.js"></script>
<script src="/js/workCanvas.js"></script>
</body>
</html>
`);
}

function renderWork (req, res)  {
  if (!auth(req, res)) return;

  Work.find({
    enabled: true,
    imageStatus: WorkImageStatus.IMAGE_NONE
  }).sort({_id:-1}).limit(1).exec(function (err, docs) {

    if (docs.length > 0) {
      displayRenderPage({
        chromosome: docs[0].chromosome,
        save: true
      }, res);
    } else {
      res.end(`<!doctype html><html><head><meta http-equiv="refresh" content="10"><title>done</title><meta http-equiv="refresh" content="5"></head><body>completed</body></html>`);
    }
  });
}


function renderLayer(req, res)  {
  if (!auth(req, res)) return;

  const hash  = req.params.hash;
  const layer = req.params.layer;

  Work.find({
    hash
  }).limit(1).exec(function (err, docs) {

    if (docs.length > 0) {
      displayRenderPage({
        chromosome: docs[0].chromosome,
        save: false,
        layer
      }, res);
    } else {
      res.end(`<!doctype html><html><head><meta http-equiv="refresh" content="10"><title>done</title><meta http-equiv="refresh" content="5"></head><body>work or layer not found</body></html>`);
    }
  });
}



module.exports = router;
