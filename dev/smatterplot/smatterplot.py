
###########
# imports #
###########
import numpy as np
import os
import pandas as pd
from bokeh.plotting import figure, show, output_file
####################
# parametrizations #
####################
toolpath = os.path.join(r'~','fegs-dashboard')
myglob = os.path.join(toolpath, 'ratings', "*.csv")
all_files = glob.glob(myglob)
#####################
# load csv of attrs #
#####################
attrspath = r'~/fegs-dashboard/parameters/attributes.csv'
attrsdf = pd.read_csv(attrcsvfile)
attrs = list(df.name)
####################
# load csv of bens #
####################
benspath = r'~/fegs-dashboard/parameters/beneficiaries.csv'
bensdf = pd.read_csv(benscsvfile)
bens = list(df.name)
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
xlist = list(df.groupby(
scatter(xlist=attrs,
        ylist=bens,
        radius=10,#radius=f(weight(p))
        #fill_color=,
        line_color=None,
        fill_alpha=0.5)
