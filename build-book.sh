#!/usr/bin/env bash

sass public/sass/book/index.scss:public/css/book.css

wkhtmltopdf \
  --print-media-type \
  --page-width 180 \
  --page-height 240 \
  --image-quality 100 \
  --no-pdf-compression \
  -d 600 \
  --image-dpi 600 \
  --margin-left 0 \
  --margin-right 0 \
  --margin-top 0 \
  --margin-bottom 0 \
  --disable-smart-shrinking \
  http://localhost:3000/book book.pdf