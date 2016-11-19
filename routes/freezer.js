import Work from '../models/work';
import { render, workData } from '../helpers/helpers';

export default function (router) {
  router.get('/freezer', (req, res) => {
    Work
      .find({
        frozen: true,
        enabled: true
      })
      .exec((err, works) => {
        const hydratedWorks = [];

        const promises = works.map((work) => {
          return workData(work.hash).then((more) => {
            hydratedWorks.push(more);
          });
        });


        Promise.all(promises).then(() => {
          const sortedWorks = hydratedWorks.sort((a, b) => a.current._id < b.current._id);

          render('pages/freezer', {
            title: 'Freezer',
            script: 'FreezerPage',
            works: sortedWorks
          }, req, res);
        });
      });
  });
}
