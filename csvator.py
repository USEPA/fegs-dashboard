'''convert files to csv'''
import csv, sys, re


for (infile,outfile) in [('parameters/beneficiaries.txt','parameters/bens.csv'),
                         ('parameters/attributes.txt','parameters/attrs.csv')]:
    lines = [line for line in open(infile, newline='\r\n').readlines()]
    with open(outfile, 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(('name','description'))
        for line in lines:
            line = re.sub('\s+',' ',line)
            line = re.sub('"','',line)
            line = line.rstrip()
            writer.writerow((line,'description missing'))
