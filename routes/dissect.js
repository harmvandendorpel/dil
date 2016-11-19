import Work from '../models/work';
import { render } from '../helpers/helpers';

function dissectPage(req, res) {
  const hash = req.params.hash;
  Work.update(
    { hash },
    { needsDissecting: true },
    {},
    () => {
      Work.find({ hash }).exec((err, doc) => {
        const current = doc[0];
        render('pages/dissect', {
          layers: ['backPrint', 'frontPrint1', 'frontPrint2', 'frontPrint3', 'things'],
          current
        }, req, res);
      });
    }
  );
}

export default function (router) {
  router.get('/dissect/:hash', dissectPage);
}
