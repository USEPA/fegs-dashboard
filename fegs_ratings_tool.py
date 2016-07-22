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

#TODO update nbRatings on activate frameProcessBens
#TODO make master vertically and horizontally scrollable
#TODO visualize ratings
#TODO set wraplength for all labels(try lbl.<some_method>_all)
#TODO retain data on existing rating-tabs when tabs are added
#TODO widgets dynamically fill available space
#TODO create data-analysis function
#TODO tab change focus from within Text widgets
#TODO enter key triggers default button on nb tab or nbRating tab
#TODO investigate localization support
#TODO clear txtNewBen and txtNewAttr after text retrieval
#TODO sort lists after addition

# imports
from tkinter import *
from tkinter import messagebox
from tkinter.ttk import *
from tkinter.filedialog import asksaveasfilename
from datetime import datetime
import pdb #NOTE python's standard debugger
import sys
import csv
import pickle
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
    nb.select(frameProcessBens)
    nbRatings.updatetabs()
def benactivation(event):
    "update descriptions of beneficiary when it's activated in a listbox"
    lblBenDescriptCaption.config(text=str(event.widget.get(ACTIVE))+":")
    description = beneficiariesdict[event.widget.get(ACTIVE)]
    lblBenDescript.config(text=description)
def attractivation(event):
    "update descriptions of attribute when it's activated in a listbox"
    parent = event.widget.master
    parent.lblattrdescriptcaption.config(text=str(event.widget.get(ACTIVE))+":")
    description = attributesdict[event.widget.get(ACTIVE)]
    parent.lblattrdescript.config(text=description)
def updateratingstree(event):
    "update ratingstree to show ratings"
    session.update()
    row = 0
    ratingstree.delete(*ratingstree.get_children())
    for item in session.ratings:
        values=[]
        for field in session.fieldnames:
            values.append(item[field])
        values = tuple(values)
        ratingstree.insert('',row,text='row '+str(row),values=values)
        row += 1

class Session():
    "centralize data; hide widgets' accessors"
    def __init__(self):
        'statically bound attributes timestamp and site'
        self.fieldnames = [
                'site', 
                'beneficiary',
                'attribute',
                'rating',
                'explanation',
                'timestamp'
                ]
        self.timestamp = str(datetime.now())
        self.site = StringVar()
        txtSite.config(textvariable=self.site)
        self.bens = StringVar()
        lbBenDest.config(listvariable=self.bens)
        self.ratings = []
    def update(self):
        if len(self.ratings) != 0:
            del(self.ratings)
            self.ratings = []
        dictnum = 0
        for i in list(range(len(nbRatings.tablist))):
            for j in list(range(len(nbRatings.tablist[i].lbAttrDest.get(0,END)))):
                self.ratings.append({})
                tabi = nbRatings.tablist[i]
                attribute = tabi.lbAttrDest.get(j)
                self.ratings[dictnum]['site'] = txtSite.get()
                self.ratings[dictnum]['timestamp'] = str(datetime.now())
                self.ratings[dictnum]['beneficiary'] = lbBenDest.get(i)
                self.ratings[dictnum]['attribute'] = attribute
                self.ratings[dictnum]['rating'] = tabi.cmbRating.get()
                self.ratings[dictnum]['explanation'] = tabi.txtExpln.get('0.1', 'end-1c')
                dictnum += 1
    def saveRatings(self):
        'save ratings to csv with fieldnames as header'
        self.update()
        formatstring = "%Y.%m.%dAT%H.%M.%S"
        timestamp = datetime.now().strftime(formatstring)
        filename = asksaveasfilename(initialfile='saved-fegs-ratings-'+timestamp+'.csv')
        if filename != None and filename != '':
            with open(filename, 'w', newline='\r\n') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=self.fieldnames)
                writer.writeheader()
                for i in range(len(self.ratings)):
                    writer.writerow(self.ratings[i])
            messagebox.showinfo("Saved", "The file was saved.")
    def lblist(self, lb):
        'list of items in lb between first and last'
        output = []
        for lbindex in range(lb.size()):
            output.append(lb.get(lbindex))
        return output
    def lbload(self, inputlist, lb):
        'load items into from inputlist into listbox lb'
        for i in range(lb.size()):
            lb.delete(i)
        for item in inputlist:
            lb.insert('0', item)
    def save(self):
        "save info entered for loading later"
        site = txtSite.get()
        listbensrc = self.lblist(lbBenSrc)# get list
        listbendest = self.lblist(lbBenDest)# get list
        ratingslist = []
        for i in nbRatings.size():
            ratingslist.append({})
            for i in range(len(nbRatings.tablist)):
                ratingi = ratingslist[i]
                tabi = nbRatings.tablist[i]
                listattrsrc = lblist(tabi.lbAttrSrc)
                ratingi['listattrsrc'] = listattrsrc
                listattrdest = lblist(tabi.lbAttrDest)
                ratingi['listattrdest'] = listattrdest
                rating = tabi.cmbRating.get()
                ratingi['rating'] = rating
                expln = tabi.txtExpln.get('0.1','end-1c')
                ratingi['explanation'] = expln
        with open('session.pickle','wb') as f:
            picklelist = [
                    site,
                    lblist(lbBenSrc),
                    lblist(lbBenDest),
                    ratingslist ]
            pickle.dump(picklelist, f)
            #REMOVED , pickle.HIGHEST_PROTOCOL
    def load(self):
        'load saved data-entry-session into tool'
        with open('session.pickle','rb') as f:
            [
                    site,
                    listbensrc,
                    listbendest,
                    ratingslist ] =  pickle.load(f)
        txtSite.insert(END, site)
        self.lbload(listbensrc, lbBenSrc)
        self.lbload(listbendest, lbBenDest)
        nbRatings.updatetabs()
        for i in range(len(ratingslist)):
            tabi = nbRatings.tablist[i]
            ratingi = ratingslist[i]
            self.lbload(ratingi['listattrsrc'], tabi.lbAttrSrc)
            self.lbload(ratingi['listattrdest'], tabi.lbAttrDest)
            rating = ratingi['rating']
            tabi.cmbRating.set(rating)
            expln = ratingi['explanation']
            tabi.txtExpln.insert(END, expln)

class Ratings_Notebook(Notebook):
    "check lbBenDest.size() for dynamic size"
    def __init__(self):
        #self = Notebook(frameProcessBens)
        Notebook.__init__(self,frameProcessBens)
        self.pack()
        self.tablist = []
        self.labels = []
    def cleartabs(self):
        "clear all tabs from notebook"
        numtabs = self.index('end')
        for i in range(numtabs):
            self.forget(self.tablist[i])
    def updatetabs(self):
        "update nbRatings tabs to reflect lbBenDest"
        self.cleartabs()
        for i in range(lbBenDest.size()):
            self.tablist.append(Frame(self))
            tabi = self.tablist[i]
            tabi.benName = lbBenDest.get(i)
            tabi.pack()
            self.labels.append(Label(tabi, text=tabi.benName))
            self.labels[i].grid(row=0, column=0, columnspan=6)
            self.add(tabi, text=tabi.benName)
            # source listbox of attributes
            tabi.lbAttrSrc = Listbox(tabi, height=lbHeight,\
                                             width=lbWidth, selectmode=EXTENDED)
            tabi.lbAttrSrc.grid(row=1, column=0, rowspan=3, sticky=E)
            for attribute in attributes:
                tabi.lbAttrSrc.insert(END, attribute)
            tabi.lbAttrSrc.bind('<<ListboxSelect>>',attractivation)
            tabi.sbAttrSrc = Scrollbar(tabi, orient=VERTICAL,\
                                               command=tabi.lbAttrSrc.yview)
            tabi.sbAttrSrc.grid(row=1, column=1, rowspan=3, sticky=W+N+S)
            tabi.lbAttrSrc.config(yscrollcommand=tabi.sbAttrSrc.set)
            # widgets between listboxes
            tabi.btnAttrAdd = Button(tabi, text=">> Add >>",\
                                             command=lambda i=i: moveBetweenLists(\
                                             tabi.lbAttrSrc,\
                                             tabi.lbAttrDest))
            tabi.btnAttrAdd.grid(row=1, column=2, columnspan=2)
            tabi.txtNewAttr = Entry(tabi,
                    text="Don't see an attribute? "+\
                    "Type it here and click >>")
            tabi.txtNewAttr.grid(row=2, column=2)
            tabi.btnNewAttr = Button(tabi, text=">>",\
                                             command=lambda i=i: addToList(\
                                             tabi.txtNewAttr.get(),\
                                             tabi.lbAttrDest))
            tabi.btnNewAttr.grid(row=2, column=3)
            tabi.btnAttrRm = Button(tabi, text="<< Remove <<",\
                                            command=lambda i=i: moveBetweenLists(\
                                            tabi.lbAttrDest,\
                                            tabi.lbAttrSrc))
            tabi.btnAttrRm.grid(row=3, column=2, columnspan=2)
            # destination listbox of attributes
            tabi.lbAttrDest = Listbox(tabi, height=lbHeight,\
                                              width=lbWidth, selectmode=EXTENDED)
            tabi.lbAttrDest.grid(row=1, column=4, rowspan=3, sticky=E)
            tabi.lbAttrDest.bind('<<ListboxSelect>>',attractivation)
            tabi.sbAttrDest = Scrollbar(tabi, orient=VERTICAL,\
                                                command=tabi.lbAttrDest.yview)
            tabi.sbAttrDest.grid(row=1, column=5, rowspan=3, sticky=W+N+S)
            tabi.lbAttrDest.config(yscrollcommand=tabi.sbAttrDest.set)
            # description of active attribute
            tabi.lblattrdescriptcaption = Label(tabi,
                    text="Attribute:")
            tabi.lblattrdescriptcaption.grid(row=4,column=0,columnspan=2)
            tabi.lblattrdescript = Label(tabi,
                    text="description")
            tabi.lblattrdescript.grid(row=4,column=2,columnspan=4)
            # combobox of rating-values; text area for explanation
            tabi.cmbratingcaption = Label(tabi,
                    text='Enter a rating: ')
            tabi.cmbratingcaption.grid(row=5,
                    column=0,columnspan=2)
            tabi.cmbRating = Combobox(tabi, values=ratings)
            tabi.cmbRating.grid(row=5, column=2, columnspan=4)
            tabi.txtExpln = Text(tabi, height=10,
                    width=60)
            tabi.lblexplncaption = Label(tabi,text='Type additional information.')
            tabi.txtExpln.bind('<FocusOut>', lambda _: scrapeExpln)
            tabi.txtExpln.grid(row=6, column=2, columnspan=6)
            tabi.btnRate = Button(tabi,\
                                          text="Rate the site for the beneficiaries.",\
                                          command=lambda: nb.select(frameSave))
            tabi.btnRate.grid(row=7, column=2, columnspan=2)

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
root.title('FEGS Ratings Tool')
root.protocol("WM_DELETE_WINDOW", master.quit)
nb = Notebook(master, name='nb')
nb.pack(fill=BOTH, padx=2, pady=3)

###############################
# globally accessible buttons #
###############################
btnsave = Button(master,
        text='Save this session to continue these ratings later.',
        command=lambda: session.save())
btnsave.pack()
btnload = Button(master,
        text='Load a saved session.',
        command=lambda: session.load())
btnload.pack()

###########################
# tab for naming the site #
###########################
frameSite = Frame(nb, name='frameSite')
frameSite.pack(fill=BOTH)
nb.add(frameSite, text="Name the site")

lblSiteInstructions = Label(frameSite,
        text="Type the name of the site.")
lblSiteInstructions.grid(row=0)

txtSite = Entry(frameSite, width=lbWidth)
txtSite.grid(row=1)

btnChooseBens = Button(frameSite, text="Next",\
                       command=lambda: nb.select(frameChooseBens))
btnChooseBens.grid(row=2)

##############################################
# tab for choosing beneficiaries of the site #
##############################################
frameChooseBens = Frame(nb, name='frameChooseBens')
frameChooseBens.pack(fill=BOTH)
nb.add(frameChooseBens, text="Beneficiaries")

beninstructions = 'Create a list of people who directly '\
        'experience, value, or benefit from natural '\
        'features at the site.'
txtBenInstructions = Label(frameChooseBens,\
                           text=beninstructions)
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

lblBenDescriptCaption = Label(frameChooseBens, text="Description of the underlined beneficiary:")
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

lblSaveInstructions = Label(frameSave, text="Save these ratings to a file for later use.")
lblSaveInstructions.pack()

session = Session()

# review ratings
ratingstree = Treeview(frameSave)
frameSave.bind('<Expose>', updateratingstree)
ratingstree.pack()
ratingstree['columns'] = session.fieldnames 
for heading in session.fieldnames:
    ratingstree.heading(heading, text=heading)

btnSave = Button(frameSave, text="Save")
btnSave.pack()
btnSave.config(command=lambda: session.saveRatings())

btndebug = Button(
        frameSave,
        text="Debug",
        command =lambda: pdb.set_trace())
btndebug.pack()

root.mainloop()
'''don't put any code which should run before the GUI
closes after mainloop
'''
