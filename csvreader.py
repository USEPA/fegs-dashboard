'''returns a dict with keys of the form
"<line-number><field-name>"
and
"header<field-name>"'''

import pdb
import csv

def csvreader(infilename):
    with open(infilename, newline='') as csvfile:
        reader = csv.reader(csvfile)
        for line in range(1, len(reader)):
            print(reader(i))

if __name__ == '__main__':
    from sys import argv
    print('running '+argv[0]+' as a script.')
    csvreader(argv[1])
