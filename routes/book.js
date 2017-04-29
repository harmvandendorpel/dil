import { bookData } from '../helpers/helpers';
import { render } from '../helpers/helpers';

export default function (router) {
  router.get('/book', (req, res) =>
    bookData().then((works) =>
      render('pages/book/index', { works: works.slice(0, 250) }, req, res)
    )
  );
}
