import { bookData } from '../helpers/helpers';
import { render } from '../helpers/helpers';

export default function (router) {
  router.get('/book/:mode?', (req, res) => {
      const mode = req.params.mode;
      bookData().then((works) =>
        render('pages/book/index', {
          works: works.slice(0, 250),
          mode
        }, req, res)
      )
    }
  );
}
