import numpy as np
import pandas as pd
import os

from bokeh.plotting import figure, show, output_file

'''
###########
# imports #
###########
import pandas as pd
from bokeh.plotting import figure, show, output_file
####################
# parametrizations #
####################
# WIP CONCATENATE LIST OF RATINGS-FILES@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
path = r'~/fegs-dashboard/ratings'
all_files = glob.glob(os.path.join(path, "*.csv"))
df = pd.concat(pd.read_csv(f) for f in all_files)
#####################
# load csv of attrs #
#####################
attrscsvfile = '~/fegs-dashboard/parameters/attributes.csv'
attrsdf = pd.read_csv(attrcsvfile)
attrs = list(df.name)
####################
# load csv of bens #
####################
benscsvfile = '~/fegs-dashboard/parameters/beneficiaries.csv'
bensdf = pd.read_csv(benscsvfile)
attrs = list(df.name)
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
ratingsdf = pd.read_csv(tooldir+'parameters/ratings.csv')
'''

# R_i = set of all k_i ratings of (ben_i, attr_i)
# count the number of ratings, k_i, for plot-point p_i in space S = attrs x bens
# calculate E(p_i) = SUM_j(r_j)/k
# make a map [0,1] -> Saturation s.t. E(p_i) |-> <saturation> 
# weight(p_i) = k_i/k is in [0,1] for all i<k
# draw circles at each grid-point
# - circle(attr_i, ben_i) draws a circle at (attr_i, ben_i)
# - scatter(xlist,
#           ylist,
#           radius=radii,
#           fill_color=colors,
#           line_color=linecolor
#           fill_alpha:=(a in [0:1]),


N = 40
dx = 50
dy = 50
# load attrs from attrs.csv
# load bens from bens.csv
x = np.random.random(size=N) * dx
y = np.random.random(size=N) * dy
# (x,y) = [(x,y) for (x,y) in points]
# points = ((attr, ben) for attr in attrs for ben in bens((x, y) for x in a for y in b))
# S[(attr, ben)][k] = <numratings>
# radii \prop k_i
radii = np.random.random(size=N) * 1.5
colors = [
    "#%02x%02x%02x" % (int(r), int(g), 150) for r, g in zip(50+2*x, 30+2*y)
]

TOOLS="hover,crosshair,pan,wheel_zoom,box_zoom,undo,redo,reset,tap,save,box_select,poly_select,lasso_select"

p = figure(tools=TOOLS)

p.scatter(x, y, radius=radii,
          fill_color=colors, fill_alpha=0.6,
          line_color=None)

output_file("smatterplot.html", title="color_smatter.py")

show(p)  # open a browser
