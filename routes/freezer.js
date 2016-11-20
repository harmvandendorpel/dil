import moment from 'moment';
import Work from '../models/work';
import { render, workData } from '../helpers/helpers';


function workAge(work) {
  const ts = work._id.getTimestamp();
  return moment(ts).fromNow();
}

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
          const sortedWorks = hydratedWorks.sort((a, b) => {
            return workAge(a.current) > workAge(b.current);
          });

          render('pages/freezer', {
            title: 'Freezer',
            script: 'FreezerPage',
            works: sortedWorks
          }, req, res);
        });
      });
  });
}
