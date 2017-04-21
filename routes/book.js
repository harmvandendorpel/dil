import { theWorks } from '../helpers/helpers';
import { render } from '../helpers/helpers';

export default function (router) {
  router.get('/book', (req, res) => {
    theWorks().then((works) => {
      render('pages/book/index', { works }, req, res);
    });
  });
}
