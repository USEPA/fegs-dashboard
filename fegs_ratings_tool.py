'''# GUI tool to identify and rate attributes per beneficiary under the final ecosystem goods and services(FEGS) model and FEGS categorization system(FEGS-CS) by Landers, Nahlik, et al

### naive debug-workflow:
  1. comment root.mainloop line at or near EOF
  2. open python interpreter
  3. >>> exec(open('relative/path/to/file.py').read())

### debugging with pdb:
  1. >>> ...
  2. >>> import pdb
  3. >>> ...
  4. place pdb.set_trace() where breakpoints are desired
  5. run script
'''

#TODO implement saveRatings()
#TODO realize visualization of ratings
#TODO create data-analysis function
#TODO implement pickle.dump() of session's state for persistence
#TODO lookup notifiers in python

# imports
from tkinter import *
from tkinter.ttk import *
from datetime import datetime
import pdb #NOTE python's standard debugger
import sys
import csv

def moveBetweenLists(fromList, toList):
    "move selected items between fromList and toList"
    indices = list(fromList.curselection())
    indices.sort(reverse=True)
    for i in range(len(indices)):
        index = indices.pop()-i
        toList.insert(END, fromList.get(index))
        fromList.delete(index)

def addToList(item, lst):
    "casts item as str and adds it to the end of list)"
    lst.insert(END, item)

def lineListFromFilename(filename):
    "returns a list of end-whitespace-stripped lines from filename"
    lines = [line.rstrip('\n') for line in open(filename)]
    return lines

def scrapeExpln():
    "save explanation to a session-state-variable on focus out"
    session.expln = txtExpln.get('0.1', 'end-1c')

def processBens():
    "generate a tab for each ben in lbBenDest; show "
    #for i in range(len(lbBenDest.get(0, END))): session.lbAttrDest.insert(END, lbBenDest.get(i))
    sys.stderr.write("about to generate tabs")
    pdb.set_trace()
    nbBens = Ratings_Notebook(lbBenDest.size())
    nb.select(frameProcessBens)

def saveRatings():
    pass

class Session():
    "persistent session across closing the program and allows global data-sharing"
    def __init__(self):
        'class attributes timestamp and site; create Rating object for each ben in lbBenDest'
        self.timestamp = str(datetime.now())
        self.site = StringVar()
        txtSite.config(textvariable=self.site)
        self.bens = StringVar()
        lbBenDest.config(listvariable=self.bens)

class Ratings_Notebook(Notebook):
    "pass arg numTabs for dynamic size"
    def __init__(self, numTabs):
        self = Notebook(frameProcessBens)
        self.pack()
        self.tabs = []
        self.labels = []
        for i in range(numTabs):
            benName = lbBenDest.get(i)
            self.tabs.append(Frame(self))
            self.tabs[i].pack()
            pdb.set_trace()
            self.labels.append(Label(self.tabs[i], text=benName))
            self.labels[i].grid(row=0, column=0, columnspan=6)
            self.add(self.tabs[i], text=benName)
            # source listbox of attributes
            self.tabs[i].lbAttrSrc = Listbox(self.tabs[i], height=lbHeight,\
                                             width=lbWidth, selectmode=EXTENDED)
            self.tabs[i].lbAttrSrc.grid(row=1, column=0, rowspan=3, sticky=E)
            for attribute in attributes:
                self.tabs[i].lbAttrSrc.insert(END, attribute)
            self.tabs[i].sbAttrSrc = Scrollbar(self.tabs[i], orient=VERTICAL,\
                                               command=self.tabs[i].lbAttrSrc.yview)
            self.tabs[i].sbAttrSrc.grid(row=1, column=1, rowspan=3, sticky=W+N+S)
            self.tabs[i].lbAttrSrc.config(yscrollcommand=self.tabs[i].sbAttrSrc.set)
            # widgets between listboxes
            self.tabs[i].btnAttrAdd = Button(self.tabs[i], text=">> Add >>",\
                                             command=lambda: moveBetweenLists(\
                                             self.tabs[i].lbAttrSrc,\
                                             self.tabs[i].lbAttrDest))
            ###### prepend self.tabs[i]. to controls' names
            self.tabs[i].btnAttrAdd.grid(row=1, column=2, columnspan=2)
            self.tabs[i].txtNewAttr = Entry(self.tabs[i], text="Don't see an attribute? "+\
                                                               "Type it here and click >>")
            self.tabs[i].txtNewAttr.grid(row=2, column=2)
            self.tabs[i].btnNewAttr = Button(self.tabs[i], text=">>",\
                                             command=lambda: addToList(\
                                             self.tabs[i].txtNewAttr.get(),\
                                             self.tabs[i].lbAttrDest))
            self.tabs[i].btnNewAttr.grid(row=2, column=3)
            self.tabs[i].btnAttrRm = Button(self.tabs[i], text="<< Remove <<",\
                                            command=lambda: moveBetweenLists(\
                                            self.tabs[i].lbAttrDest,\
                                            self.tabs[i].lbAttrSrc))
            self.tabs[i].btnAttrRm.grid(row=3, column=2, columnspan=2)
            # destination listbox of attributes
            self.tabs[i].lbAttrDest = Listbox(self.tabs[i], height=lbHeight,\
                                              width=lbWidth, selectmode=EXTENDED)
            self.tabs[i].lbAttrDest.grid(row=1, column=4, rowspan=3, sticky=E)
            self.tabs[i].sbAttrDest = Scrollbar(self.tabs[i], orient=VERTICAL,\
                                                command=self.tabs[i].lbAttrDest.yview)
            self.tabs[i].sbAttrDest.grid(row=1, column=5, rowspan=3, sticky=W+N+S)
            self.tabs[i].lbAttrDest.config(yscrollcommand=self.tabs[i].sbAttrDest.set)
            self.tabs[i].cmbRating = Combobox(self.tabs[i], values=ratings)
            self.tabs[i].cmbRating.grid(row=9, column=0, columnspan=6)
            self.tabs[i].txtExpln = Text(self.tabs[i], height=10, width=48)
            self.tabs[i].txtExpln.bind('<FocusOut>', lambda: scrapeExpln())
            self.tabs[i].txtExpln.grid(row=10, column=0, columnspan=6)
            self.tabs[i].btnRate = Button(self.tabs[i],\
                                          text="Rate the site for the beneficiaries.",\
                                          command=lambda: nb.select(frameSave))
            self.tabs[i].btnRate.grid(row=11, column=2, columnspan=2)

# parametr's [= parametrizations]
lbHeight = 16
lbWidth = 32
fontHeight = 10
instructions_wrap_width = 60
beneficiaries = sorted(lineListFromFilename("parameters/beneficiaries.txt"))
attributes = sorted(lineListFromFilename("parameters/attributes.txt"))
ratings = lineListFromFilename("parameters/ratings.txt")

###############
# tkinter GUI #
###############
root = Tk()
root.option_add("*Font", "courier " + str(fontHeight))
master = Frame(root, name='master')
master.pack(fill=BOTH)
root.title('FEGS Rating Tool')
root.protocol("WM_DELETE_WINDOW", master.quit)
nb = Notebook(master, name='nb')
nb.pack(fill=BOTH, padx=2, pady=3)

###########################
# tab for naming the site #
###########################
frameSite = Frame(nb, name='frameSite')
frameSite.pack(fill=BOTH)
nb.add(frameSite, text="Name the site")

lblSiteInstructions = Label(frameSite, text="Type the name of the site below.")
lblSiteInstructions.grid(row=0)

txtSite = Entry(frameSite, width=lbWidth)
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
                           #wraplength=80 #FIXME set wraplength for all labels(lbl.method)
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

btnProcessBens = Button(frameChooseBens, text="Process Beneficiaries")
btnProcessBens.config(command=processBens)
btnProcessBens.grid(row=4, column=2, columnspan=2)

#################################################
# tab for adding attributes to each beneficiary #
#################################################
frameProcessBens = Frame(nb, name='frameProcessBens')
frameProcessBens.pack(fill=BOTH)
#frameProcessBens.bind("<Activate>", lambda: processBens())
nb.add(frameProcessBens, text="Process Beneficiaries")

lblAttrsInstructions = Label(frameProcessBens, text="Create a list of attributes that affect each beneficiary's rating of the site.")
lblAttrsInstructions.pack()

#NOTE the tabs for each rating are populated on press btnProcessBens

#######################
##tab to save ratings##
#######################
frameSave = Frame(nb, name="frameSave")
frameSave.pack(fill=BOTH)
nb.add(frameSave, text="Save Ratings")

lblSaveInstructions = Label(frameSave, text="Once all data is entered, save the data to a file for later use.")
lblSaveInstructions.grid(row=0, column=0)

btnSave = Button(frameSave, text="Save")
btnSave.grid(row=1, column=0)
btnSave.config(command=saveRatings())

session = Session()
print(session.site.get())

# don't put any code which should run before the GUI closes after mainloop
root.mainloop()
