'''# GUI tool to identify and rate attributes per beneficiary under the final ecosystem goods and services(FEGS) model and FEGS categorization system(FEGS-CS) by Landers, Nahlik, et al

## naive debug-workflow:
  1. comment root.mainloop line at or near EOF
  2. open python interpreter
  3. >>> exec(open('relative/path/to/file.py').read())

## debugging with pdb:
  1. >>> ...
  2. >>> import pdb
  3. >>> ...
  4. place pdb.set_trace() where breakpoints are desired
  5. run script
'''

#TODO implement saveRatings()
#TODO resolve FIXME near line 91
#TODO make master vertically and horizontally scrollable
#TODO visualize ratings
#TODO create data-analysis function
#TODO set wraplength for all labels(lbl.<some_method>_all)

# imports
from tkinter import *
from tkinter.ttk import *
from datetime import datetime
import pdb #NOTE python's standard debugger
import sys
import csv

def moveBetweenLists(fromList, toList):
    "move selected items between fromList and toList"
    indices = [i for i in fromList.curselection()]
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
    "generate a tab for each ben in lbBenDest"
    sys.stdout.write("about to generate tabs")
    nb.select(frameProcessBens)
    nbRatings.updatetabs()

class Session():
    "persistent session across closing the program and allows global data-sharing"
    def __init__(self):
        'statically bound attributes timestamp and site; create rating dict for each rating in nbRatings'
        self.timestamp = str(datetime.now())
        self.site = StringVar()
        txtSite.config(textvariable=self.site)
        self.bens = StringVar()
        lbBenDest.config(listvariable=self.bens)
        self.ratings = []
    def saveRatings(self):
        if len(self.ratings) != 0:
            del(self.ratings)
            self.ratings = []
        for i in range(lbBenDest.size()):
            for attribute in nbRatings.tablist[i].lbAttrDest.get(0,END):
                self.ratings.append({})
                self.ratings[i]['site'] = txtSite.get()
                self.ratings[i]['timestamp'] = str(datetime.now())
                self.ratings[i]['beneficiary'] = lbBenDest.get(i)
                self.ratings[i]['attribute'] = attribute
                self.ratings[i]['rating'] = nbRatings.tablist[i].cmbRating.get()
                self.ratings[i]['explanation'] = nbRatings.tablist[i].txtExpln.get('0.1', 'end-1c')
        #pdb.set_trace()#----------------------BREAK--------------------------
        #with open('writer.csv', 'w', newline = '') as csvfile:
        #    writer = csv.writer(csvfile)
        #    csvheader = [key for i in range(lbBenDest.size()) for key in self.ratings[i].keys()]
        #    writer.writerow(csvheader)
        #FIXME bug using csv.DictWriter()
        with open('dictwriter.csv', 'w') as csvfile:
            fieldnames = ['site', 'timestamp', 'beneficiary', 'attribute', 'rating', 'explanation']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for i in range(self.ratings.__len__()):
                writer.writerow(self.ratings[i])

class Ratings_Notebook(Notebook):
    "check lbBenDest.size() for dynamic size"
    def __init__(self):
        #self = Notebook(frameProcessBens)
        Notebook.__init__(self,frameProcessBens)
        self.pack()
        self.tablist = []
        self.labels = []
        lambda: self.updatetabs()
    def cleartabs(self):
        "clear all tabs from notebook"
        numtabs = self.index('end')
        for i in range(numtabs):
            self.forget(self.tablist[i])
    def updatetabs(self):
        "update tabs to reflect nbBenDest"
        self.cleartabs()
        for i in range(lbBenDest.size()):
            benName = lbBenDest.get(i)
            self.tablist.append(Frame(self))
            self.tablist[i].pack()
            self.labels.append(Label(self.tablist[i], text=benName))
            self.labels[i].grid(row=0, column=0, columnspan=6)
            self.add(self.tablist[i], text=benName)
            # source listbox of attributes
            self.tablist[i].lbAttrSrc = Listbox(self.tablist[i], height=lbHeight,\
                                             width=lbWidth, selectmode=EXTENDED)
            self.tablist[i].lbAttrSrc.grid(row=1, column=0, rowspan=3, sticky=E)
            for attribute in attributes:
                self.tablist[i].lbAttrSrc.insert(END, attribute)
            self.tablist[i].sbAttrSrc = Scrollbar(self.tablist[i], orient=VERTICAL,\
                                               command=self.tablist[i].lbAttrSrc.yview)
            self.tablist[i].sbAttrSrc.grid(row=1, column=1, rowspan=3, sticky=W+N+S)
            self.tablist[i].lbAttrSrc.config(yscrollcommand=self.tablist[i].sbAttrSrc.set)
            # widgets between listboxes
            self.tablist[i].btnAttrAdd = Button(self.tablist[i], text=">> Add >>",\
                                             command=lambda i=i: moveBetweenLists(\
                                             self.tablist[i].lbAttrSrc,\
                                             self.tablist[i].lbAttrDest))
            self.tablist[i].btnAttrAdd.grid(row=1, column=2, columnspan=2)
            self.tablist[i].txtNewAttr = Entry(self.tablist[i], text="Don't see an attribute? "+\
                                                               "Type it here and click >>")
            self.tablist[i].txtNewAttr.grid(row=2, column=2)
            self.tablist[i].btnNewAttr = Button(self.tablist[i], text=">>",\
                                             command=lambda i=i: addToList(\
                                             self.tablist[i].txtNewAttr.get(),\
                                             self.tablist[i].lbAttrDest))
            self.tablist[i].btnNewAttr.grid(row=2, column=3)
            self.tablist[i].btnAttrRm = Button(self.tablist[i], text="<< Remove <<",\
                                            command=lambda i=i: moveBetweenLists(\
                                            self.tablist[i].lbAttrDest,\
                                            self.tablist[i].lbAttrSrc))
            self.tablist[i].btnAttrRm.grid(row=3, column=2, columnspan=2)
            # destination listbox of attributes
            self.tablist[i].lbAttrDest = Listbox(self.tablist[i], height=lbHeight,\
                                              width=lbWidth, selectmode=EXTENDED)
            self.tablist[i].lbAttrDest.grid(row=1, column=4, rowspan=3, sticky=E)
            self.tablist[i].sbAttrDest = Scrollbar(self.tablist[i], orient=VERTICAL,\
                                                command=self.tablist[i].lbAttrDest.yview)
            self.tablist[i].sbAttrDest.grid(row=1, column=5, rowspan=3, sticky=W+N+S)
            self.tablist[i].lbAttrDest.config(yscrollcommand=self.tablist[i].sbAttrDest.set)
            # combobox of rating-values; text area for explanation
            self.tablist[i].cmbRating = Combobox(self.tablist[i], values=ratings)
            self.tablist[i].cmbRating.grid(row=4, column=0, columnspan=6)
            self.tablist[i].txtExpln = Text(self.tablist[i], height=10, width=48)
            self.tablist[i].txtExpln.bind('<FocusOut>', lambda: scrapeExpln())
            self.tablist[i].txtExpln.grid(row=5, column=0, columnspan=6)
            self.tablist[i].btnRate = Button(self.tablist[i],\
                                          text="Rate the site for the beneficiaries.",\
                                          command=lambda: nb.select(frameSave))
            self.tablist[i].btnRate.grid(row=6, column=2, columnspan=2)
        

# parametr's [= parametrizations]
lbHeight = 16
lbWidth = 32
fontHeight = 12
instructions_wrap_width = 64
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
                           #wraplength=80 
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
btnProcessBens.config(command=lambda: processBens())
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

nbRatings = Ratings_Notebook()
#NOTE the tabs for ratings are populated on press btnProcessBens

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
btnSave.config(command=lambda: session.saveRatings())

session = Session()

# don't put any code which should run before the GUI closes after mainloop
root.mainloop()
