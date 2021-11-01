import os
import argparse
import pathlib

BASE_PATH = os.path.expanduser('~/hugo-blog/static/images/')

def create_dir(path):
    if not os.path.exists(path):
        os.mkdir(path)

def main(args):
    dir = os.path.join(BASE_PATH, args.dir)
    create_dir(dir)

    m = 0
    for file_name in os.listdir(dir):
        if file_name[0].isdigit():
            idx = int(file_name.split('.')[0])
            m = max(m, idx)
    m += 1

    suf = str(args.path).rsplit('.', 1)[-1]
    path = os.path.join(dir, f'{m}.{suf}')
    os.rename(args.path, path)

    path = path[path.index(r'/images/'):]
    print(f'![img]({path})')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=pathlib.Path)  # path for the image
    parser.add_argument("--dir", type=str)  # path for images dir
    args = parser.parse_args()

    main(args)

