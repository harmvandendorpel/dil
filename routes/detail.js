import Work from '../models/work';
import { oneHit, render, workData } from '../helpers/helpers';

function detailPage(req, res) {
  const hashPart = req.params.hash;

  workData(hashPart).then((results) => {
    oneHit(results.current.hash);
    results.script = 'DetailPage';

    const names = [results.current.title];

    if (results.parents.length > 0) {
      names.push(results.parents[0].title);
      names.push(results.parents[1].title);
    }

    results.title = names.join(' ');
    results.metaDescription = `Born ${results.current.birthday}`;

    Work
      .find({
        frozen: true,
        enabled: true
      })
      .exec((err, frozenWorks) => {
        results.frozenCount = frozenWorks.length;
        render('pages/detail', results, req, res);
      });
  });
}

export default function (router) {
  router.get('/language/:hash', detailPage);
}
