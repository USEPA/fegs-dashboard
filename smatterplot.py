def smatterplot(filename=None):
    'Plot fegs-ratings on grid: attributes x beneficiaries'
    def maprating(rating):
        'map ratings to numbers to find mean'
        ratingsmap = {"Good":1, "Fair":0, "Poor":-1}
        if rating in ratingsmap.keys():
            return ratingsmap[rating]
        else:
            return None
    def colorer(attr,ben):
        'map mean rating to redwhitegreen'
        pass
    ###########
    # imports #
    ###########
    import pandas as pd
    import numpy as np
    from bokeh.plotting import figure, show, output_file
    import os
    import glob
    import pdb
    ####################
    # parametrizations #
    ####################
    # machine-specific parametrization
    homedir = r'c:\\users\\kthom02'  #r'/home/thomasky/Downloads'
    toolpath = os.path.join(homedir,'fegs-dashboard')
    if filename == None or filename.strip() == '':
        myglob = os.path.join(toolpath, 'ratings', '*.csv')
        allfiles = glob.glob(myglob)
    else:
        allfiles = [filename]
    # list of colors to bin mean ratings into
    redwhitegreen = [
            'darkgreen', 'green', 'lightgreen', 'white',
            'lightred', 'red', 'darkred']
    #######################
    # load csv of ratings #
    #######################
    # build dataframe from CSVs with columns attribute, beneficiary, rating
    ratingsdf = pd.concat(pd.read_csv(f) for f in allfiles)
    # map all ratings to numerical values
    numratingdf = ratingsdf['Rating of Attribute'].apply(maprating)
    numratingdf.head()
    ###############################
    # cultivate data for plotting #
    ###############################
    # group the ratings by each particular point (attr,ben)
    groupedratings = ratingsdf.groupby(['Attribute', 'Beneficiary'])
    attrsvals = list(ratingsdf.Attribute)
    bensvals = list(ratingsdf.Beneficiary)
    # minify: rm repeated attrs from list
    minattrs = list(set(attrsvals))
    # minify: rm repeated bens from list
    minbens = list(set(bensvals))
    ########
    # plot #
    ########
    # make a grid of attrs X bens
    p = figure(x_range=minattrs, y_range=minbens)
    # tilt labels so they can be read
    p.xaxis.major_label_orientation = np.pi/4
    # make a circle for each rating-point (attr,ben)
    circles = p.circle(
            # iterable of x-values
            x=attrsvals,
            # iterable of x-values
            y=bensvals,
            radius=.5,
            #radius=f(weight(p)),
            #fill_color=redwhitegreen,
            line_color=None,
            fill_alpha=0.2)
    # show plot
    show(p)

if __name__ == '__main__':
    smatterplot()
