'''convert files to csv'''
import csv, sys, re


for (infile,outfile) in [('parameters/beneficiaries.txt','parameters/beneficiaries.csv'),
                         ('parameters/attributes.txt','parameters/attributes.csv')]:
    lines = [line for line in open(infile).readlines()]
    with open(outfile, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(('name','description'))
        for line in lines:
            line = re.sub('\s+',' ',line)
            line = re.sub('"','',line)
            # strip carriage returns, linefeeds, tabs, and spaces:
            line = line.strip('\r\n   ')
            writer.writerow((line,'description missing'))
