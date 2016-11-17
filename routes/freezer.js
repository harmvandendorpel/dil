import Work from '../models/work';
import { render } from '../helpers/helpers';

export default function (router) {
  router.get('/freezer', (req, res) => {
    Work
      .find({
        frozen: true,
        enabled: true
      })
      .sort({_id: -1})
      .exec((err, works) => {
        console.log(works[1]);
        render('pages/freezer', {
          title: 'Freezer',
          script: 'FreezerPage',
          works
        }, req, res);
      });
  });
}
