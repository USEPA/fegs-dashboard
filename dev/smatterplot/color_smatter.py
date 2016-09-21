import numpy as np
import os
import pandas as pd
from bokeh.plotting import figure, show, output_file


# R_i = set of all k_i ratings of (ben_i, attr_i)
# count the number of ratings, k_i, for plot-point p_i in space S = attrs x bens
# calculate E(p_i) = SUM_j(r_j)/k
# make a map [0,1] -> Saturation s.t. E(p_i) |-> <saturation> 
# weight(p_i) = k_i/k is in [0,1] for all i<k
# draw circles at each grid-point
# - circle(attr(i), ben(j)) draws a circle at (attr_i, ben_j)


N = 240
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
