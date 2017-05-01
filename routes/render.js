import { shuffle } from 'lodash';
import sha1 from 'sha1';

import { WorkImageStatus } from '../const/const';
import Work from '../models/work';
import { auth } from '../helpers/helpers';

function displayRenderPage(options, res) {
  const chromosome = options.chromosome;
  const hash = sha1(chromosome);
  const toRenderCount = options.toRenderCount;

  res.end(`<!doctype html>
<html>
<head><title>generating ${hash}</title><script>
window.chromosome = '${chromosome}';
window.hash       = '${hash}';
window.layer      = ${options.layer ? "'" + options.layer + "'":null};
window.save       = ${options.save ? 'true':'false'};
window.toRenderCount = ${toRenderCount};
</script><style>
body {background-color:#eee; margin:0px}
#btn-download {position:absolute;top:10px;left:10px;font-size:64px;}
</style></head>
<body>
<canvas id="canvas"></canvas>
<a href='#' id="btn-download">download</a>
<!-- script src="/js/jquery.js"></script -->
<!-- script src="/js/props.js"></script -->
<script src="/js/workCanvas.js"></script>
</body>
</html>
`);
}

function renderWork(req, res)  {
  if (!auth(req, res)) return;

  Work.find({
    // enabled: true,
    imageStatus: WorkImageStatus.IMAGE_NONE
  })
    .lean()
    //.sort({ _id: -1 })
    .limit(1000).exec((err, docs) => {

      if (docs.length > 0) {
        docs = shuffle(docs);
        displayRenderPage({
          chromosome: docs[0].chromosome,
          save: true,
          toRenderCount: docs.length
        }, res);
      } else {
        res.end(`<!doctype html><html><head><meta http-equiv="refresh" content="10"><title>done</title></head><body>completed</body></html>`);
      }
  });
}

function renderLayer(req, res)  {
  if (!auth(req, res)) return;

  const hash = req.params.hash;
  const layer = req.params.layer;

  Work.find({
    hash
  }).limit(1).exec((err, docs) => {

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

export default function (router) {
  router.get('/layer/render/:hash/:layer', renderLayer);
  router.get('/work/render', renderWork);
}
