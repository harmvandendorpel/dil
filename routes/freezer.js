import { render, frozenWorkData } from '../helpers/helpers';

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
