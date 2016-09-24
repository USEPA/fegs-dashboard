'Plot fegs-ratings on a grid of attributes x beneficiaries'
def smatterplot(filename=None):
    ###########
    # imports #
    ###########
    from bokeh.plotting import figure, show, output_file
    from bokeh.models import LinearColorMapper
    from bokeh.palettes import RdYlGn
    import pandas as pd
    import numpy as np
    import os
    import glob
    import pdb
    ####################
    # parametrizations #
    ####################
    # environmental parametrization
    homedir = r'c:\\users\\kthom02'  #r'/home/thomasky/Downloads'
    toolpath = os.path.join(homedir,'fegs-dashboard')
    pdb.set_trace()
    if filename == None or filename.strip() == '':
        myglob = os.path.join(toolpath, 'ratings', "*.csv")
        allfiles = glob.glob(myglob)
    else:
        allfiles = [filename]
    redwhitegreen = ['darkred', 'red', 'lightred', 'white', 'lightgreen', 'green', 'darkgreen']
    #####################
    # load csv of attrs #
    #####################
    attrsfilename = os.path.join(
            toolpath,
            'parameters',
            'attributes.csv')
    attrsdf = pd.read_csv(attrsfilename)
    attrs = list(attrsdf.name)
    ####################
    # load csv of bens #
    ####################
    benspath = os.path.join(
            toolpath,
            'parameters',
            'beneficiaries.csv')
    bensdf = pd.read_csv(benspath)
    bens = list(bensdf.name)
    ###########################################
    # make figure with attrs,bens on the axes #
    ###########################################
    p = figure(x_range=attrs, y_range=bens)
    #####################
    # map rating-values #
    #####################
    def maprating(rating):
        ratingsmap = {"Good":1, "Fair":0, "Poor":-1}
        if rating in ratingsmap:
            return ratingsmap[rating]
        else:
            return None
    # kth_rating_value = values[ratings[k]]
    ##################################################
    # load csv of ratings # R = set of all k ratings #
    ##################################################
    ratingsdf = pd.concat(pd.read_csv(f) for f in allfiles)
    goupedratings = ratingsdf.groupby(['Attribute', 'Beneficiary'])
    ########
    # plot #
    ########
    attrsvals = list(ratingsdf.Attribute)
    bensvals = list(ratingsdf.Beneficiary)
    minattrs = list(set(attrsvals))
    minbens = list(set(bensvals))
    p = figure( x_range=minattrs,
                y_range=minbens)
    p.xaxis.major_label_orientation = np.pi/4
    p.circle(   x=attrsvals,
                y=bensvals,
                radius=.5,
                #radius=f(weight(p)),
                fill_color=RdYlGn,
                line_color=None,
                fill_alpha=0.2)
    show(p)

    # R_i = set of all k_i ratings of (ben_i, attr_i)
    # count the number of ratings, k_i, for plot-point p_i in space S = attrs x bens
    # calculate E(p_i) = SUM_j(r_j)/k
    # make a map [0,1] -> Saturation s.t. E(p_i) |-> <saturation> 
    # weight(p_i) = k_i/k is in [0,1] for all i<k
    # draw circles at each grid-point
    # - circle(attr(i), ben(j)) draws a circle at (attr_i, ben_j)

if __name__ == '__main__':
    smatterplot()
