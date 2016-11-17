import { render } from '../helpers/helpers';

export default function (router) {
  router.get('/about', (req, res) => {
    render('pages/about', { title: 'About' }, req, res);
  });
}
