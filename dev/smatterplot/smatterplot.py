###########
# imports #
###########
from bokeh.plotting import figure, show, output_file
import pandas as pd
import numpy as np
import os
import glob
####################
# parametrizations #
####################
toolpath = os.path.join(r'~','fegs-dashboard')
myglob = os.path.join(toolpath, 'ratings', "*.csv")
all_files = glob.glob(myglob)
#####################
# load csv of attrs #
#####################
attrsfilename = os.path.join(r'~', 'fegs-dashboard', 'parameters', 'attributes.csv')
attrsdf = pd.read_csv(attrsfilename)
attrs = list(attrsdf.name)
####################
# load csv of bens #
####################
benspath = r'~/fegs-dashboard/parameters/beneficiaries.csv'
bensdf = pd.read_csv(benspath)
bens = list(bensdf.name)
###########################################
# make figure with attrs,bens on the axes #
###########################################
p = figure(x_range=attrs, y_range=bens)
############################################################
# map rating-values: {"Good"|->1, "Fair"|->0, "Poor"|->-1} #
############################################################
values = {"Good":1, "Fair":0, "Poor":-1}
# kth_rating_value = values[ratings[k]]
##################################################
# load csv of ratings # R = set of all k ratings #
##################################################
ratingsdf = pd.concat(pd.read_csv(f) for f in all_files)
goupedratings = ratingsdf.groupby(['Attribute', 'Beneficiary'])
########
# plot #
########
xlist = list(df.groupby('Attribute'))
ylist = list(df.groubby('Beneficiary'))
scatter(xlist=attrs,
        ylist=bens,
        radius=10,#radius=f(weight(p))
        #fill_color=,
        line_color=None,
        fill_alpha=0.5)
