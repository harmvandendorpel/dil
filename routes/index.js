var express = require('express');
var router = express.Router();
import { WorkImageStatus } from '../const/const';
import Work from '../models/work';
import saveWorkImage from '../saveWorkImage';
import { saveOrganism, breed } from '../organisms';
import sha1 from 'sha1';

router.get('/', function(req, res, next) {
  Work.find({}).sort({_id:-1}).exec((err, works) => {
    res.render('index', { title: 'index', works });
  });

});

router.get('/work/render', renderWork);

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
    () => res.send('done'),
    (err) => res.send(err)
  );
});

router.post('/work/breed', (req, res) => {
  const parents = req.body.parents;
  const count = req.body.count;

  parents.sort();

  breed(parents, count).then((result) => res.send(result));
});

function renderWork (req, res)  {

  Work.find({
    imageStatus: WorkImageStatus.IMAGE_NONE
  }).limit(1).exec(function (err, docs) {

    if (docs.length) {
      const doc = docs[0];
      const chromosome = doc.chromosome;
      res.end(`<!doctype html>
<html>
<head><script>
window.chromosome = '${chromosome}';
window.hash = '${sha1(chromosome)}';
</script></head>
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
<html><head><meta http-equiv="refresh" content="5"></head><body>completed</body></html>`);
    }
  });
}



module.exports = router;
