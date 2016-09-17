import numpy as np

from bokeh.plotting import figure, show, output_file

# circle(attr_i, ben_i) draws a circle at (attr_i, ben_i)
# draw circles at each grid-point
# load csv of attrs
# make plot-axis with attrs on it
# load csv of bens
# make plot-axis with bens on it
# map rating-values: "Good"|->1, "Fair"|->0, "Poor"|->-1
# load csv of ratings
# R = set of all k ratings
# count the number of ratings, k_i, for plot-point p_i in space S = attrs x bens
# R_i = set of all k_i ratings of (ben_i, attr_i)
# calculate E(p_i) = SUM_j(r_j)/k
# make a map [0,1] -> Saturation s.t. E(p_i) |-> <saturation> 
# w(p_i) = k_i/k is in [0,1] for all i<k

N = 40
dx = 20
dy = 20
# load attrs from attrs.csv
# load bens from bens.csv
# x = np.array(len(attrs))
x = np.random.random(size=N) * dx
# y = np.array(len(bens))
y = np.random.random(size=N) * dy
# S = ((attr, ben) for attr in attrs for ben in bens((x, y) for x in a for y in b))
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
