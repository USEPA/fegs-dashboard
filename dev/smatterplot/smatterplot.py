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

# R_i = set of all k_i ratings of (ben_i, attr_i)
# count the number of ratings, k_i, for plot-point p_i in space S = attrs x bens
# calculate E(p_i) = SUM_j(r_j)/k
# make a map [0,1] -> Saturation s.t. E(p_i) |-> <saturation> 
# weight(p_i) = k_i/k is in [0,1] for all i<k
# draw circles at each grid-point
# - circle(attr(i), ben(j)) draws a circle at (attr_i, ben_j)
