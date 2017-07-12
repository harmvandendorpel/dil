import json
import urllib2
import os
import shutil

HOST = "http://localhost:3000"
BOOK_DATA = "./book_data"
IMAGE_LOCATION = "/Users/harm/webserver/dil/public/works"

file_total = 0
file_successful = 0
file_errors = 0

def process_frozen_works():
    frozen_works = json.load(urllib2.urlopen("{}/api/frozen".format(HOST)))

    if os.path.isdir(BOOK_DATA):
        shutil.rmtree(BOOK_DATA)

    os.makedirs(BOOK_DATA)
    for index, frozen_work in enumerate(frozen_works):
        process_frozen_work_by_hash(frozen_work["current"]["hash"], index)


def try_copy(source, destination):
    global file_total
    global file_successful
    global file_errors
    file_total += 1
    if os.path.exists(source):
        shutil.copyfile(source, destination)
        file_successful += 1
        # print "file copied to {}".format(destination)
    else:
        file_errors += 1
    #     print "file {} does not exists".format(source)


def store_current(data, folder):
    current = data["current"]
    parents = data["parents"]
    os.makedirs(folder)
    source = "{}/full/{}".format(IMAGE_LOCATION, current["filename"])
    full_name = "{} {} {}.jpg".format(current["title"], parents[0]["title"], parents[0]["title"])
    destination = "{}/{}".format(folder, full_name)
    try_copy(source, destination)


def store_multiple(data, folder):
    os.makedirs(folder)
    for child in data:
        source = "{}/full/{}".format(IMAGE_LOCATION, child["filename"])
        destination = "{}/{}.jpg".format(folder, child["title"])
        try_copy(source, destination)


def process_frozen_work_by_hash(hash, index):
    url = "{}/api/work/{}".format(HOST, hash)
    frozen_work = json.load(urllib2.urlopen(url))
    work_folder = "{}/{index:03d}-{}".format(BOOK_DATA, hash, index=index)
    os.makedirs(work_folder)
    store_current(frozen_work, "{}/current".format(work_folder))
    store_multiple(frozen_work["children"], "{}/children".format(work_folder))
    store_multiple(frozen_work["siblings"], "{}/siblings".format(work_folder))
    store_multiple(frozen_work["parents"], "{}/parents".format(work_folder))


process_frozen_works()

percentage = int(float(file_successful) / float(file_total) * 100.0)
print "From a total of {} files, {} succesfully copied, {} errors ({}%)".format(
    file_total,
    file_successful,
    file_errors,
    percentage
)

