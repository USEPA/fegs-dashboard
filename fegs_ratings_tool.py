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

#TODO feedback on save
#TODO save dialog
#TODO output tabular report
#TODO update nbRatings on activate frameProcessBens
#TODO load saved ratings
#TODO make master vertically and horizontally scrollable
#TODO visualize ratings
#TODO set wraplength for all labels(try lbl.<some_method>_all)
#TODO error when focus leaves txtExpln
#TODO retain data on existing rating-tabs when tabs are added
#TODO widgets dynamically fill available space
#TODO create data-analysis function
#TODO should fields be added to a saved ratings' csv for descriptions of attribute and beneficiary?

# imports
from tkinter import *
from tkinter.ttk import *
from datetime import datetime
import pdb #NOTE python's standard debugger
import sys
import csv
# import custom classes and functions
from paramreader import paramreader

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

def benactivation(event):
    "update descriptions of beneficiary when it's activated in a listbox"
    lblBenDescriptCaption.config(text=str(event.widget.get(ACTIVE))+":")
    description = beneficiariesdict[event.widget.get(ACTIVE)]
    lblBenDescript.config(text=description)

def attractivation(event):
    "update descriptions of attribute when it's activated in a listbox"
    pdb.set_trace()
    parent = event.widget.master
    parent.lblattrdescriptcaption.config(text=str(event.widget.get(ACTIVE))+":")
    description = attributesdict[event.widget.get(ACTIVE)]
    parent.lblattrdescript.config(text=description)

class Session():
    "centralize data and hide accessors"
    def __init__(self):
        '''statically bound attributes timestamp and site;
        create rating dict ior each rating in nbRatings'''
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
        for i in list(range(len(nbRatings.tablist))):
            for j in list(range(len(nbRatings.tablist[i].lbAttrDest.get(0,END)))):
                attribute = nbRatings.tablist[i].lbAttrDest.get(j)
                self.ratings.append({})
                dictnum = len(self.ratings)-1
                self.ratings[dictnum]['site'] = txtSite.get()
                self.ratings[dictnum]['timestamp'] = str(datetime.now())
                self.ratings[dictnum]['beneficiary'] = lbBenDest.get(i)
                self.ratings[dictnum]['attribute'] = attribute
                self.ratings[dictnum]['rating'] = nbRatings.tablist[i].cmbRating.get()
                self.ratings[dictnum]['explanation'] = nbRatings.tablist[i].txtExpln.get('0.1', 'end-1c')
        formatstring = "%Y.%m.%dAT%H.%M.%S"
        timestamp = datetime.now().strftime(formatstring)
        with open('saved-ratings-'+timestamp+'.csv', 'w') as csvfile:
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
            self.tablist.append(Frame(self))
            self.tablist[i].benName = lbBenDest.get(i)
            self.tablist[i].pack()
            self.labels.append(Label(self.tablist[i], text=self.tablist[i].benName))
            self.labels[i].grid(row=0, column=0, columnspan=6)
            self.add(self.tablist[i], text=self.tablist[i].benName)
            # source listbox of attributes
            self.tablist[i].lbAttrSrc = Listbox(self.tablist[i], height=lbHeight,\
                                             width=lbWidth, selectmode=EXTENDED)
            self.tablist[i].lbAttrSrc.grid(row=1, column=0, rowspan=3, sticky=E)
            for attribute in attributes:
                self.tablist[i].lbAttrSrc.insert(END, attribute)
            self.tablist[i].lbAttrSrc.bind('<<ListboxSelect>>',attractivation)
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
            self.tablist[i].lbAttrDest.bind('<<ListboxSelect>>',attractivation)
            self.tablist[i].sbAttrDest = Scrollbar(self.tablist[i], orient=VERTICAL,\
                                                command=self.tablist[i].lbAttrDest.yview)
            self.tablist[i].sbAttrDest.grid(row=1, column=5, rowspan=3, sticky=W+N+S)
            self.tablist[i].lbAttrDest.config(yscrollcommand=self.tablist[i].sbAttrDest.set)
            # description of active attribute
            self.tablist[i].lblattrdescriptcaption = Label(self.tablist[i],
                    text="Attribute:")
            self.tablist[i].lblattrdescriptcaption.grid(row=4,column=0,columnspan=2)
            self.tablist[i].lblattrdescript = Label(self.tablist[i],
                    text="description")
            self.tablist[i].lblattrdescript.grid(row=4,column=2,columnspan=4)
            # combobox of rating-values; text area for explanation
            self.tablist[i].cmbratingcaption = Label(self.tablist[i],
                    text='Enter a rating: ')
            self.tablist[i].cmbratingcaption.grid(row=5,
                    column=0,columnspan=2)
            self.tablist[i].cmbRating = Combobox(self.tablist[i], values=ratings)
            self.tablist[i].cmbRating.grid(row=5, column=2, columnspan=4)
            self.tablist[i].txtExpln = Text(self.tablist[i], height=10, width=48)
            self.tablist[i].txtExpln.bind('<FocusOut>', lambda: scrapeExpln())
            self.tablist[i].txtExpln.grid(row=6, column=0, columnspan=6)
            self.tablist[i].btnRate = Button(self.tablist[i],\
                                          text="Rate the site for the beneficiaries.",\
                                          command=lambda: nb.select(frameSave))
            self.tablist[i].btnRate.grid(row=7, column=2, columnspan=2)

# parametrizations
lbHeight = 16
lbWidth = 32
fontHeight = 12
wrapwidth = 64
beneficiariesdict = paramreader('parameters/beneficiaries.csv')
beneficiaries = sorted([beneficiary for beneficiary in beneficiariesdict.keys()])
attributesdict = paramreader('parameters/attributes.csv')
attributes = sorted([attribute for attribute in attributesdict.keys()])
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
                           text="Build a list of beneficiaries interested in the site. "+\
                           "Here, a beneficiary is a role as which a person uses or "+\
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

lblBenDescriptCaption = Label(frameChooseBens, text="Description of the selected beneficiary:")
lblBenDescriptCaption.grid(row=4, column=0, columnspan=2)
lblBenDescript = Label(frameChooseBens, text="unset")
lblBenDescript.grid(row=4, column=2, columnspan=2)
lbBenSrc.bind('<<ListboxSelect>>', benactivation)
lbBenDest.bind('<<ListboxSelect>>', benactivation)

btnProcessBens = Button(frameChooseBens, text="Process Beneficiaries")
btnProcessBens.config(command=lambda: processBens())
btnProcessBens.grid(row=5, column=2, columnspan=2)

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
