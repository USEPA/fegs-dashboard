''' This is a GUI tool to identify and rate attributes as a beneficiary under the final ecosystem goods and services(FEGS) model and FEGS categorization system(FEGS-CS).
'''

# imports
from tkinter import *
from tkinter.ttk import *
import datetime

def moveBetweenLists(fromList, toList):
    "move selected items between fromList and toList"
    indices = list(fromList.curselection())
    indices.sort(reverse=True)
    for i in range(len(indices)):
        index = indices.pop()-i
        print(i, " of ", len(indices), ": index ", index)
        toList.insert(END, fromList.get(index))
        fromList.delete(index)

def addToList(item, lst):
    "casts item as str and adds it to the end of list)"
    lst.insert(END, item)

def lineListFromFilename(filename):
    "returns a list of end-whitespace-stripped lines from filename"
    lines = [line.rstrip('\n') for line in open(filename)]
    return lines

class Ratings_Session():
    "gives users a persistent session across closing the program and allows global data-sharing"
    timestamp = str(datetime.datetime.now())
#   site = StringVar()
#   lstBens = StringVar()
#   ben = StringVar()
#   lstAttrs = StringVar()
#   rating = StringVar()
#   explanation = StringVar()
    def __init__(self):
        lstRatings = []

# parametr's [= parametrizations]
lbHeight = 16
lbWidth = 32
fontHeight = 8
instructions_wrap_width = 60
beneficiaries = sorted(lineListFromFilename("parameters/beneficiaries.txt"))
attributes = sorted(lineListFromFilename("parameters/attributes.txt"))
ratings = lineListFromFilename("parameters/ratings.txt")

root = Tk()
root.option_add("*Font", "courier " + str(fontHeight))

master = Frame(root, name='master')
master.pack(fill=BOTH)

root.title('FEGS Rating Tool')
root.protocol("WM_DELETE_WINDOW", master.quit)

nb = Notebook(master, name='nb')
nb.pack(fill=BOTH, padx=2, pady=3)

s = Ratings_Session()

###########################
# tab for naming the site #
###########################
frameSite = Frame(nb, name='frameSite')
frameSite.pack(fill=BOTH)
nb.add(frameSite, text="Name the site")

lblSiteInstructions = Label(frameSite, text="Type the name of the site below.")
lblSiteInstructions.grid(row=0)

s.site = StringVar()
txtSite = Entry(frameSite, textvariable=s.site, width=lbWidth)
txtSite.grid(row=1)

btnChooseBens = Button(frameSite, text="Move on to choose beneficiaries of the site.",\
                       command=lambda: nb.select(frameChooseBens))
btnChooseBens.grid(row=2)

##############################################
# tab for choosing beneficiaries of the site #
##############################################
frameChooseBens = Frame(nb, name='frameChooseBens')
frameChooseBens.pack(fill=BOTH)
nb.add(frameChooseBens, text="Choose Beneficiaries")

txtBenInstructions = Label(frameChooseBens,\
                           text="Build a list of beneficiaries interested in the site."+\
                           "Here, a beneficiary is a role as which a person uses or"+\
                           "appreciates the site.",\
                           )
txtBenInstructions.grid(row=0, column=0, columnspan=6)

lbBenSrc = Listbox(frameChooseBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbBenSrc.grid(row=1, column=0, rowspan=3, sticky=E)
for beneficiary in beneficiaries:
    lbBenSrc.insert(END, beneficiary)

sbBenSrc = Scrollbar(frameChooseBens, orient=VERTICAL, command=lbBenSrc.yview)
sbBenSrc.grid(row=1, column=1, rowspan=3, sticky=W+N+S)
lbBenSrc.config(yscrollcommand=sbBenSrc.set)

btnBenAdd = Button(frameChooseBens, text=">> Add >>", \
                   command=lambda: moveBetweenLists(lbBenSrc, lbBenDest))
btnBenAdd.grid(row=1, column=2, columnspan=2)

txtNewBen = Entry(frameChooseBens, text="Don't see a beneficiary? Type it here and click >>")
txtNewBen.grid(row=2, column=2) 

btnNewBen = Button(frameChooseBens, text=">>",\
                   command=lambda: addToList(txtNewBen.get(), lbBenDest))
btnNewBen.grid(row=2, column=3)

btnBenRm = Button(frameChooseBens, text="<< Remove <<",\
                  command=lambda: moveBetweenLists(lbBenDest, lbBenSrc))
btnBenRm.grid(row=3, column=2, columnspan=2)

lbBenDest = Listbox(frameChooseBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbBenDest.grid(row=1, column=4, rowspan=3, sticky=E)

sbBenDest = Scrollbar(frameChooseBens, orient=VERTICAL, command=lbBenDest.yview)
sbBenDest.grid(row=1, column=5, sticky=W+N+S)
lbBenDest.config(yscrollcommand=sbBenDest.set)

btnProcessBens = Button(frameChooseBens, text="Process Beneficiaries", command=lambda: nb.select(frameProcessBens))
btnProcessBens.grid(row=4, column=2, columnspan=2)

#################################################
# tab for adding attributes to each beneficiary #
#################################################
frameProcessBens = Frame(nb, name='frameProcessBens')
frameProcessBens.pack(fill=BOTH)
nb.add(frameProcessBens, text="Process Beneficiaries")

lblAttrsInstructions = Label(frameProcessBens, text="Create a list of attributes that affects each beneficiary's rating of the site.")
lblAttrsInstructions.grid(row=0, column=0, columnspan=6)

# source listbox of attributes
lbAttrSrc = Listbox(frameProcessBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbAttrSrc.grid(row=1, column=0, rowspan=3, sticky=E)
# populate the attributes users select from
for attribute in attributes:
    lbAttrSrc.insert(END, attribute)

sbAttrSrc = Scrollbar(frameProcessBens, orient=VERTICAL, command=lbAttrSrc.yview)
sbAttrSrc.grid(row=1, column=1, rowspan=3, sticky=W+N+S)
lbAttrSrc.config(yscrollcommand=sbAttrSrc.set)

# widgets between listboxes
btnAttrAdd = Button(frameProcessBens, text=">> Add >>",\
                    command=lambda: moveBetweenLists(lbAttrSrc, lbAttrDest))
btnAttrAdd.grid(row=1, column=2, columnspan=2)
txtNewAttr = Entry(frameProcessBens, text="Don't see an attribute? Type it here and click >>")
txtNewAttr.grid(row=2, column=2)
btnNewAttr = Button(frameProcessBens, text=">>",\
                    command=lambda: addToList(txtNewAttr.get(), lbAttrDest))
btnNewAttr.grid(row=2, column=3)
btnAttrRm = Button(frameProcessBens, text="<< Remove <<",\
                    command=lambda: moveBetweenLists(lbAttrDest, lbAttrSrc))
btnAttrRm.grid(row=3, column=2, columnspan=2)

# destination listbox of attributes
lbAttrDest = Listbox(frameProcessBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbAttrDest.grid(row=1, column=4, rowspan=3, sticky=E)

sbAttrDest = Scrollbar(frameProcessBens, orient=VERTICAL, command=lbAttrDest.yview)
sbAttrDest.grid(row=1, column=5, rowspan=3, sticky=W+N+S)
lbAttrDest.config(yscrollcommand=sbAttrDest.set)

cmbRating = Combobox(frameProcessBens, values=ratings)
cmbRating.grid(row=9, column=0, columnspan=6)

txtExpln = Text(frameProcessBens, height=10, width=48)
txtExpln.grid(row=10, column=0, columnspan=6)

btnRate = Button(frameProcessBens, text="Rate the site for the beneficiaries.", command=lambda: nb.select(frameSubmit))
btnRate.grid(row=11, column=2, columnspan=2)

cmbSelectBen = Combobox(frameProcessBens, values=lbBenDest.get(0, END))
cmbSelectBen.grid(row=12, column=0, columnspan=6)

#########################
# tab to submit ratings #
#########################
frameSubmit = Frame(nb, name="frameSubmit")
frameSubmit.pack(fill=BOTH)
nb.add(frameSubmit, text="Submit Ratings")

lblSubmitInstructions = Label(frameSubmit, text="Once all data is entered, submit the data to a file for later use.")
lblSubmitInstructions.grid(row=0, column=0)

btnSubmit = Button(frameSubmit, text="Submit")
btnSubmit.grid(row=1, column=0)

# don't put any code which should run before the GUI closes after mainloop
root.mainloop()
