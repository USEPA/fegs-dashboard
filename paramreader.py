def paramreader(paramfile):
    import csv
    beneficiaries = {}
    with open(paramfile, newline='\r\n') as csvfile:
        '''read (name,description) into dict: beneficiary['<name>']->'<description>'
        '''
        csvreader = csv.DictReader(csvfile)
        for line in csvreader:
            beneficiaries[line['name']] = line['description']
    return beneficiaries
