import json
import urllib2
import os
import shutil

HOST = "http://localhost:3000"
BOOK_DATA = './book_data'


def process_frozen_works():
    frozen_works = json.load(urllib2.urlopen("{}/api/frozen".format(HOST)))

    if os.path.isdir(BOOK_DATA):
        shutil.rmtree(BOOK_DATA)

    os.makedirs(BOOK_DATA)
    for frozen_work in frozen_works:
        process_frozen_work_by_hash(frozen_work["current"]["hash"])


def process_frozen_work_by_hash(hash):
    url = "{}/api/work/{}".format(HOST, hash)
    frozen_work = json.load(urllib2.urlopen(url))
    print frozen_work["current"]


process_frozen_works()
