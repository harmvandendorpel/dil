import moment from 'moment';
import Work from '../models/work';
import { render, workData } from '../helpers/helpers';


function workAge(work) {
  const ts = work._id.getTimestamp();
  return moment(ts).fromNow();
}

function frozenWorkData() {
  return new Promise((resolve) => {
    Work.find({
      frozen: true,
      enabled: true
    })
    .exec((err, works) => {
      const hydratedWorks = [];
      const promises = works.map(work =>
        workData(work.hash).then(more => hydratedWorks.push(more))
      );

      Promise.all(promises).then(() => {
        const sortedWorks = hydratedWorks.sort((a, b) => {
          return a.current.ts - b.current.ts;
        });
        resolve(sortedWorks);
      });
    });
  });
}

export default function (router) {
  router.get('/freezer', (req, res) =>
    frozenWorkData().then(works =>
      render('pages/freezer', {
        title: 'Freezer',
        script: 'FreezerPage',
        works
      }, req, res)
    )
  );
}
