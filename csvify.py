'''convert files to csv'''
import csv, sys, re

for (infilename,outfilename) in [
        ('parameters/beneficiaries.txt',
            'parameters/beneficiaries.csv'),
        ('parameters/attributes.txt',
            'parameters/attributes.csv')]:
    lines = [line for line in open(infilename).readlines()]
    with open(outfilename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        # writerow takes an iterable whose
        # elements are field-values
        writer.writerow(('name','description'))
        for line in lines:
            line = re.sub('\s+',' ',line)
            # strip carriage returns,
            # linefeeds, tabs, and spaces
            line = line.strip('\r\n   ')
            writer.writerow((line,'description missing'))
