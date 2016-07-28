def csvtodict(paramfilename):
    '''for each line in paramfilename:
    read (name, description) into dict
    beneficiary['<name>']->'<description>'
    '''
    import csv
    params = {}
    with open(paramfilename, newline='') as csvfile:
        csvreader = csv.DictReader(csvfile)
        for line in csvreader:
            params[line['name']] = line['description']
    return params

def texttostring(paramfilename):
    '''return all text in paramfilename as string
    '''
    import csv
    outputstring = ''
    with open(paramfilename, newline='') as paramfile:
        for line in paramfile.read():
            outputstring += line
        return str(outputstring)
