import json
import urllib
import urllib2
import os
import shutil

HOST = "http://death.imitates.org"
BOOK_DATA = "./book_data"
IMAGE_LOCATION = "/Users/harm/webserver/dil/public/works"

def process_frozen_works():
    url = "{}/api/frozen".format(HOST)
    print url
    frozen_works = json.load(urllib2.urlopen(url))

    # if os.path.isdir(BOOK_DATA):
    #     shutil.rmtree(BOOK_DATA)

    if not os.path.exists(BOOK_DATA):
        os.makedirs(BOOK_DATA)
    for index, frozen_work in enumerate(frozen_works):
        process_frozen_work_by_hash(frozen_work["current"]["hash"], index)


def try_copy(source, destination):
    if not os.path.exists(destination):
        print "saving {}...".format(source)
        urllib.urlretrieve(source, destination)


def store_current(data, folder):
    current = data["current"]
    parents = data["parents"]
    if not os.path.exists(folder):
        os.makedirs(folder)
    source = "{}/works/full/{}".format(HOST, current["filename"])
    full_name = "{} {} {}.jpg".format(current["title"], parents[0]["title"], parents[1]["title"])
    destination = "{}/{}".format(folder, full_name)
    try_copy(source, destination)


def store_multiple(data, folder, filter_enabled):
    if not os.path.exists(folder):
        os.makedirs(folder)
    for child in data:
        if filter_enabled and not child["enabled"]:
            print 'skipping disabled child'
        else:
            source = "{}/works/full/{}".format(HOST, child["filename"])
            destination = "{}/{}.jpg".format(folder, child["title"])
            try_copy(source, destination)


def process_frozen_work_by_hash(hash, index):
    url = "{}/api/work/{}".format(HOST, hash)
    frozen_work = json.load(urllib2.urlopen(url))
    work_folder = "{}/{index:03d}-{}".format(BOOK_DATA, hash, index=index)
    if not os.path.exists(work_folder):
        os.makedirs(work_folder)
    store_current(frozen_work, "{}/current".format(work_folder))
    store_multiple(frozen_work["children"], "{}/children".format(work_folder), True)
    store_multiple(frozen_work["siblings"], "{}/siblings".format(work_folder), True)
    store_multiple(frozen_work["parents"], "{}/parents".format(work_folder), False)


process_frozen_works()
