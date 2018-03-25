import { bookData } from '../helpers/helpers';
import { render } from '../helpers/helpers';

function preparePages(works) {
  const pages = [];

  while (works.length) {
    const page = {
      works: []
    };

    switch(parseInt(Math.random() * 3, 10)) {
      case 0:
        page.works.push(works.shift());
        page.view = 'one-work';
        break;

      case 1:
        page.works.push(...works.splice(0, 2));
        page.view = 'two-works';
        break;

      case 2:
        page.works.push(...works.splice(0, 3));
        page.view = 'three-works';
        break;

      default:
        console.log('unsupported page type');
    }

    if (page.works.length) {
      pages.push(page);
    }
  }

  return pages;
}

export default function (router) {
  router.get('/book/:mode?', (req, res) => {
      const mode = req.params.mode;
      bookData().then((works) => {
        const pages = preparePages(works.slice(0, 250));
        render('pages/book/index', { pages, mode }, req, res);
      });
    }
  );
}
