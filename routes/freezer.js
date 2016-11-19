import Work from '../models/work';
import { render, workData } from '../helpers/helpers';

export default function (router) {
  router.get('/freezer', (req, res) => {
    Work
      .find({
        frozen: true,
        enabled: true
      })
      .sort({ _id: -1 })
      .exec((err, works) => {
        const hydratedWorks = [];

        const promises = works.map((work) => {
          return workData(work.hash).then((more) => {
            hydratedWorks.push(more);
          });
        });

        Promise.all(promises).then(() => {
          render('pages/freezer', {
            title: 'Freezer',
            script: 'FreezerPage',
            works: hydratedWorks
          }, req, res);
        });
      });
  });
}
