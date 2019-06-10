'''
# GUI tool to identify and rate attributes per beneficiary under the final ecosystem goods and services(FEGS) model and FEGS categorization system(FEGS-CS) by Landers, Nahlik, et al
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
===========================================================
TODO
===========================================================

-  make a separate csv for user-added beneficiaries

-  load user-beneficiaries.csv

-  sort lbBenSrc after loading both lists

-  check *beneficiaries.csv for item

-  add new item to user-beneficiaries.csv

-  facility for users to add a description with a new beneficiary

-  make a separate csv for user-added attributes

-  make frame master vertically and horizontally scrollable

-  facility for users to add a description with a new attribute

-  visual feedback for completed ratings:

  -  validate data on leave rating tab

  -  askyesno: "done with rating?"

  -  rating-tab-color = green

-  visualize ratings by providing something like a graph

-  set wraplength for all labels(try lbl.<some_method>_all)

-  retain data on existing rating-tabs when tabs are added

-  create data-analysis function

-  tab change focus from within Text widgets

-  <return> key triggers default button on nb tab or nbRating tab

-  investigate localization support

-  update nbRatings on activate frameProcessBens

-  horizontal scrollbars on listboxes

======================= PROMPT FOR FINDING FOCUS ======================
- DONE rearrange GUI
- WIP modularize backend
- WIP data-restructure:
  - session.timestamp = '<timestamp>'
  - session.site = '<sitename>'
  - session.listbensrc =r
      [
      '<lbBenSrc[0]>',
			...,
			'<lbBenSrc[N]>'
      ] # for N+1 items in lb
	- session.listbendest =
      [
      '<lbBenDest[0]>',
      ...,
      '<lbBenDest[N]>'
      ] # for N+1 items in lb
  - session.ratings = {<ben0>,...,<benN>} # for N+1 bens
		- session.ratings['<ben>'].listattrsrc = 
        [
        '<attr0>',
        ...,
        '<attrN>'
        ] # for N+1 attrs
		- session.ratings['<ben>'].listattrgood =
        [
        '<attr0>',
        ...,
        '<attrN>'
        ] # for N+1 good attrs
		- session.ratings['<ben>'].listattrfair =
        [
        '<attr0>',
        ...,
        '<attrN>'
        ] # for N+1 fair attrs
		- session.ratings['<ben>'].listattrpoor =
        [
        '<attr0>',
        ...,
        '<attrN>'
        ] # for N+1 poor attrs
    - session.ratings['<ben>'].rating = '<rating>'
    - session.ratings['<ben>'].explanation = '<explanation>'
- WIP fix bugs to regain all functionality
'''

# imports
from tkinter import *
from tkinter import messagebox
from tkinter.filedialog import *
from tkinter.ttk import *
from datetime import datetime
import pdb # python's standard debugger
import sys
import csv
import pickle
# import custom classes and functions
from paramreader import csvtodict,texttostring
from smatterplot import smatterplot

def moveBetweenLists(fromList, toList):
    "move selected items between fromList and toList"
    indices = [i for i in fromList.curselection()]
    indices.sort(reverse=True)
    for i in range(len(indices)):
        index = indices.pop()-i
        toList.insert('end', fromList.get(index))
        fromList.delete(index)
def addToList(textbox, listoflistboxes, listdest):
    '''add textbox's contents to the end of
    list if not already in listboxes'''
    item = str(textbox.get()).strip()
    #################
    # validate item #
    #################
    if item == '': return
    for lb in listoflistboxes:
        for i in range(lb.index('end')):
            if item == lb.get(i): 
                messagebox.showinfo('Cancelled',
                        'The item was not added: "'+
                        item+'" already in a list.')
                return
    for i in range(listdest.index('end')):
        if item == listdest.get(i):
            messagebox.showinfo('Cancelled',
                    'The item was not added: "'+
                    item+'" already in destination list.')
            return
    #############################
    # insert item into listdest #
    #############################
    listdest.insert('end', str(item))
    messagebox.showinfo(
            'Added '+item,
            item+' were added to the list.')
    textbox.delete(0, 'end')
def benratingsaver(event):
    'handler for saving a rating from interface'
    parent = event.widget.master
    i = nbRatings.index('current')
    savebenrating(
            ben=str(nbRatings.labels[i]['text']),
            rating=parent.cmbRating.get())
def savebenrating(ben, rating):
    'save ben rating to session object'
    if ben not in session.ratings.keys():
        session.ratings[ben] = {}
    session.ratings[ben]['rating'] = rating
def loadbenrating(ben):
    cmbRating.set(session.ratings[ben]['rating'])
def additemtocsv(item, description, csvfilename):
    with open(csvfilename,'a') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow((item,description))
def lineListFromFilename(filename):
    "returns a list of end-whitespace-stripped lines from filename"
    lines = [line.rstrip('\n') for line in open(filename)]
    return lines
def scrapeExpln():
    "save explanation to a session-state-variable on focus out"
    session.expln = txtexpln.get('0.1', 'end-1c')
def processBens():
    "generate a tab for each ben in lbBenDest"
    nbRatings.updatetabs()
    nb.select(frameProcessBens)
def benactivation(event):
    '''update description and rating of beneficiary
    when it's activated in a listbox'''
    #######################################
    # retrieve name of active beneficiary #
    #######################################
    curselection = event.widget.curselection()
    if len(curselection) != 1:
        activeben = str(event.widget.get('active'))
    else:
        activeben = str(event.widget.get(curselection[0]))
    ############################################
    # known rating for activeben => set rating #
    ############################################
    if activeben in session.ratings.keys():
        if 'rating' in session.ratings[activeben].keys():
            cmbRating.set(session.ratings[activeben][rating])
    ################################## 
    # find beneficiary's description #
    ################################## 
    if activeben in beneficiariesdict.keys():
        description = beneficiariesdict[activeben]
    else:
        description = ''
    lblBenDescriptCaption.config(text=activeben+":")
    ######################
    # insert description #
    ######################
    txtbendescript.config(state='normal')
    txtbendescript.delete(1.0, 'end')
    txtbendescript.insert('end', description)
    txtbendescript.config(state='disabled')
def bendoubleclick(event):
    'describe ben on double click'
    parent = event.widget.master
    curselection = str(event.widget.curselection()[0])
    ben = event.widget.get(curselection)
    if ben in beneficiariesdict.keys():
        description = beneficiariesdict[ben]
    else:
        description = ''
    txtbendescript.config(state='normal')
    txtbendescript.delete(1.0, 'end')
    txtbendescript.insert('end', description)
    txtbendescript.config(state='disabled')
def updateratingstree(event):
    "update ratingstree to show ratings"
    session.update()
    session.updateratingslist()
    ratingnumber = 0
    ratingstree.delete(*ratingstree.get_children())
    for rating in session.ratingslist:
        values = []
        for [i, field] in enumerate(session.fieldnames):
            values.append(rating[field])
        values = tuple(values)
        ratingstree.insert(
                '',
                'end',
                iid=None,
                text='rating '+str(ratingnumber),
                values=values)
        ratingnumber += 1
def plotratings():
    'plot current ratings'
    # define temp filename to save ratings
    ratingsfilename = os.path.join('tmp', 'plottedratings.csv')
    session.saveratings(ratingsfilename)
    smatterplot(ratingsfilename)
    #FIXME FINISH CALL TO smatterplot.py

class Session():
    "centralize data; hide widgets' accessors"
    def __init__(self):
        'statically bound attributes'
        self.fieldnames =\
                [
                        'Site',
                        'Beneficiary',
                        'Attribute',
                        "Beneficiary's Comprehensive Rating",
                        'Rating of Attribute',
                        'Explanation',
                        'Timestamp'
                ]
        self.timestamp = str(datetime.now())
        self.site = StringVar()
        txtSite.config(textvariable=self.site)
        self.bens = StringVar()
        lbBenDest.config(listvariable=self.bens)
        self.ratings = {}
    def update(self):
        'update interface-state-data'
        if len(self.ratings) != 0:
            del(self.ratings)
            self.ratings = {}
        listbensrc = self.lblist(lbBenSrc)
        listbendest = self.lblist(lbBenDest)
        for i in range(len(nbRatings.tablist)):
            tabi = nbRatings.tablist[i]
            ben = tabi.ben
            ratings = self.ratings
            ratings[ben] = {}
            ratings[ben]['listattrsrc'] = self.lblist(tabi.lbAttrSrc)
            ratings[ben]['listattrgood'] = self.lblist(tabi.lbAttrGood)
            ratings[ben]['listattrfair'] = self.lblist(tabi.lbAttrFair)
            ratings[ben]['listattrpoor'] = self.lblist(tabi.lbAttrPoor)
            ratings[ben]['rating'] = tabi.cmbRating.get()
            ratings[ben]['explanation'] = tabi.txtexpln.get('0.1', 'end-1c')
    def scrape(self,attr,ben):
        'return rating as a dict of the form "<fieldname>":"<value>"'
        self.update()
        rating = {}
        rating[self.fieldnames[0]] = self.site.get()
        rating[self.fieldnames[1]] = ben
        rating[self.fieldnames[2]] = attr
        rating[self.fieldnames[3]] = self.ratings[ben]['rating']
        if attr in self.ratings[ben]['listattrgood']:
            attrrating = 'Good'
        if attr in self.ratings[ben]['listattrfair']:
            attrrating = 'Fair'
        if attr in self.ratings[ben]['listattrpoor']:
            attrrating = 'Poor'
        rating[self.fieldnames[4]] = attrrating
        rating[self.fieldnames[5]] = self.ratings[ben]['explanation']
        rating[self.fieldnames[6]] = self.timestamp
        return rating
    def updateratingslist(self):
        self.ratingslist = []
        for ben in self.ratings.keys():
            attrs = self.ratings[ben]['listattrgood'] +\
                    self.ratings[ben]['listattrfair'] +\
                    self.ratings[ben]['listattrpoor']
            for attr in attrs:
                self.ratingslist.append(
                        self.scrape(attr,ben))
    def getratingsfilename(self):
        '''return filename 
        suggest a filename and let user choose a filename
        '''
        #############################################
        # generate timestamp for suggested filename #
        #############################################
        formatstring = "%Y.%m.%dAT%H.%M.%S"
        timestamp = datetime.now().strftime(formatstring)
        initialfile = 'saved-fegs-ratings-'+timestamp+'.csv'
        filename = asksaveasfilename(initialfile=initialfile)
        return filename
    def saveratings(self, filename):
        if filename != None and filename != '':
            with open(
                    filename,
                    'w',
                    newline='') as csvfile:
                writer = csv.DictWriter(
                        csvfile,
                        fieldnames=self.fieldnames)
                writer.writeheader()
                for i in range(len(self.ratingslist)):
                    writer.writerow(self.ratingslist[i])
            messagebox.showinfo(
                    "Saved",
                    "The file of ratings was saved as "+
                    filename+' .')
        else:
            messagebox.showinfo('Aborted', 'Saving failed.')
    def saveratingscallback(self):
        'save ratings to csv with fieldnames as header'
        self.update()
        ratingsfilename = self.getratingsfilename()
        self.saveratings(ratingsfilename)
    def lblist(self, lb):
        'list of items in lb between first and last'
        output = []
        for lbindex in range(lb.size()):
            output.append(lb.get(lbindex))
        return output
    def loadlb(self, inputlist, lb):
        'load items into from inputlist into listbox lb'
        for i in range(lb.size()):
            lb.delete(i)
        if len(list(inputlist)) == 0:
            return
        for item in inputlist:
            lb.insert('end', item)
    def save(self):
        "save state of tool for loading later"
        site = self.site.get()
        listbensrc = self.lblist(lbBenSrc)
        listbendest = self.lblist(lbBenDest)
        ratingslist = []
        #FIXME
        #pdb.set_trace()
        for i in range(len(nbRatings.tablist)):
            ratingslist.append({})
            ratingi = ratingslist[i]
            tabi = nbRatings.tablist[i]
            listattrsrc = self.lblist(tabi.lbAttrSrc)
            ratingi['listattrsrc'] = listattrsrc
            listattrgood = self.lblist(tabi.lbAttrGood)
            ratingi['listattrgood'] = listattrgood
            listattrfair = self.lblist(tabi.lbAttrFair)
            ratingi['listattrfair'] = listattrfair
            listattrpoor = self.lblist(tabi.lbAttrPoor)
            ratingi['listattrpoor'] = listattrpoor
            ben = str(lbBenDest.get(i))
            ratingi['benrating'] = tabi.cmbRating.get()
            expln = tabi.txtexpln.get('0.1','end-1c')
            ratingi['explanation'] = expln
        formatstring = "%Y.%m.%dAT%H.%M.%S"
        timestamp = datetime.now().strftime(formatstring)
        filename = asksaveasfilename(
                initialfile='session-'+timestamp+'.pickle')
        with open(filename,'wb') as f:
            picklelist = [
                    site,
                    self.lblist(lbBenSrc),
                    self.lblist(lbBenDest),
                    ratingslist ]
            pickle.dump(picklelist, f)
    def load(self):
        'ask for a saved tool-state and load it into tool'
        #FIXME
        self.__init__()
        filename = askopenfilename(filetypes=[(
            'saved sessions',
            "*.pickle")])
        if filename in ('', None):
            messagebox.showinfo('Aborted',
                    'No session was selected to load.')
        with open(filename,'rb') as f:
            [
                site,
                listbensrc,
                listbendest,
                ratingslist ] =  pickle.load(f)
        self.site.set(site)
        self.loadlb(listbensrc, lbBenSrc)
        self.loadlb(listbendest, lbBenDest)
        nbRatings.updatetabs()
        ratingsrange = range(len(ratingslist))
        for i in ratingsrange:
            tabi = nbRatings.tablist[i]
            ratinginfo = ratingslist[i]
            if 'listattrsrc' in ratinginfo.keys():
                self.loadlb(
                        ratinginfo['listattrsrc'],
                        tabi.lbAttrSrc)
            if 'listattrgood' in ratinginfo.keys():
                self.loadlb(
                        ratinginfo['listattrgood'],
                        tabi.lbAttrGood)
            if 'listattrfair' in ratinginfo.keys():
                self.loadlb(
                        ratinginfo['listattrfair'],
                        tabi.lbAttrFair)
            if 'listattrpoor' in ratinginfo.keys():
                self.loadlb(
                        ratinginfo['listattrpoor'],
                        tabi.lbAttrPoor)
            if 'benrating' in ratinginfo.keys():
                tabi.cmbRating.set(ratinginfo['benrating'])
            if 'explanation' in ratinginfo.keys():
                expln = ratinginfo['explanation']
                tabi.txtexpln.insert('end', expln)

class Ratings_Notebook(Notebook):
    "check lbBenDest.size() for dynamic size"
    def __init__(self):
        Notebook.__init__(self,frameProcessBens)
        self.pack()
        self.tablist = []
        self.labels = []
    def selectnext(self):
        'select next ben to rate if not on last ben'
        if self.index('current')+1 < self.index('end'):
            self.select(self.index('current')+1)
        else:
            self.select(0)
    def cleartabs(self):
        "clear all tabs from object"
        numtabs = self.index('end')
        for i in range(numtabs):
            tabi = self.tablist[i]
            self.forget(tabi)
    def updatetabs(self):
        "update tabs to reflect lbBenDest"
        self.cleartabs()
        for i in range(lbBenDest.size()):
            self.tablist.append(Frame(self))
            tabi = self.tablist[i]
            ben = lbBenDest.get(i)
            tabi.ben = ben
            tabi.pack()
            self.labels.append(Label(tabi, text=ben, font=(16)))
            self.labels[i].grid(
                    row=0,
                    column=0,
                    columnspan=6)
            # combobox of rating-values
            tabi.lblbenratingcaption = Label(
                    tabi,
                    text='How satisfied, overall, are '+
                    ben.lower()+' with the site?')
            tabi.lblbenratingcaption.grid(row=1,
                    column=0,columnspan=6)
            tabi.cmbRating = Combobox(tabi, values=ratings)
            tabi.cmbRating.grid(
                    row=2,
                    column=0,
                    columnspan=6)
            tabi.cmbRating.bind(
                    '<<ComboboxSelected>>',
                    benratingsaver)
            tabi.cmbRating.bind(
                    '<FocusOut>',
                    benratingsaver)
            self.add(tabi, text=ben)
            # instructions for rating attributes
            txtAttrsInstructions = Text(tabi)
            txtAttrsInstructions.insert(
                    'end',
                    attrsinstructions)
            txtAttrsInstructions.config(
                    state='disabled',
                    background='#dfd',
                    wrap='word',
                    height=3)
            txtAttrsInstructions.grid(row=3,
                    column=0,
                    columnspan=6)
            # source listbox of attributes
            tabi.lbAttrSrc = Listbox(tabi,
                    height=lbheight,
                    width=lbWidth,
                    selectmode='extended')
            tabi.lbAttrSrc.grid(
                    row=4,
                    column=0,
                    rowspan=6,
                    sticky='e')
            tabi.sbAttrSrc = Scrollbar(
                    tabi,
                    orient='vertical',
                    command=tabi.lbAttrSrc.yview)
            tabi.sbAttrSrc.grid(
                    row=4,
                    column=1,
                    rowspan=6,
                    sticky='wns')
            tabi.lbAttrSrc.config(
                    yscrollcommand=tabi.sbAttrSrc.set)
            for attribute in attributes:
                tabi.lbAttrSrc.insert('end', attribute)
            #############################
            # widgets between listboxes #
            #############################
            tabi.btnAttrGood = Button(
                    tabi,
                    text=">> Good >>",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrSrc,
                        tabi.lbAttrGood))
            tabi.btnAttrGood.grid(
                    row=5,
                    column=2,
                    columnspan=2)
            tabi.btnAttrNotGood = Button(
                    tabi,
                    text="< < Remove from Good < <",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrGood,
                        tabi.lbAttrSrc))
            tabi.btnAttrNotGood.grid(
                    row=6,
                    column=2,
                    columnspan=2,
                    sticky='n')
            tabi.btnAttrFair = Button(
                    tabi,
                    text=">> Fair >>",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrSrc,
                        tabi.lbAttrFair))
            tabi.btnAttrFair.grid(
                    row=7,
                    column=2,
                    columnspan=2)
            tabi.btnAttrNotFair = Button(
                    tabi,
                    text="< < Remove from Fair < <",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrFair,
                        tabi.lbAttrSrc))
            tabi.btnAttrNotFair.grid(
                    row=8,
                    column=2,
                    columnspan=2,
                    sticky='n')
            tabi.btnAttrPoor = Button(
                    tabi,
                    text=">> Poor >>",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrSrc,
                        tabi.lbAttrPoor))
            tabi.btnAttrPoor.grid(
                    row=9,
                    column=2,
                    columnspan=2)
            tabi.btnAttrNotPoor = Button(
                    tabi,
                    text="< < Remove from Poor < <",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrPoor,
                        tabi.lbAttrSrc))
            tabi.btnAttrNotPoor.grid(
                    row=10,
                    column=2,
                    columnspan=2,
                    sticky='n')
            ###############################################
            # destination attr listboxes and their labels #
            ###############################################
            tabi.lblgood = Label(
                    tabi,
                    text='Good Attributes:')
            tabi.lblgood.grid(
                    row=4,
                    column=4,
                    columnspan=2)
            tabi.lbAttrGood = Listbox(
                    tabi,
                    height=5,
                    width=lbWidth,
                    selectmode='extended')
            tabi.lbAttrGood.grid(
                    row=5,
                    column=4,
                    sticky='e')
            tabi.sbAttrGood = Scrollbar(
                    tabi,
                    orient='vertical',
                    command=tabi.lbAttrGood.yview)
            tabi.sbAttrGood.grid(
                    row=5,
                    column=5,
                    sticky='wns')
            tabi.lbAttrGood.config(
                    yscrollcommand=tabi.sbAttrGood.set)
            tabi.lblfair = Label(
                    tabi,
                    text='Fair Attributes:')
            tabi.lblfair.grid(
                    row=6,
                    column=4,
                    columnspan=2)
            tabi.lbAttrFair = Listbox(
                    tabi,
                    height=5,
                    width=lbWidth,
                    selectmode='extended')
            tabi.lbAttrFair.grid(
                    row=7,
                    column=4,
                    sticky='e')
            tabi.sbAttrFair = Scrollbar(
                    tabi,
                    orient='vertical',
                    command=tabi.lbAttrFair.yview)
            tabi.sbAttrFair.grid(
                    row=7,
                    column=5,
                    sticky='wns')
            tabi.lbAttrFair.config(
                    yscrollcommand=tabi.sbAttrFair.set)
            tabi.lblpoor = Label(
                    tabi,
                    text='Poor Attributes:')
            tabi.lblpoor.grid(
                    row=8,
                    column=4,
                    columnspan=2)
            tabi.lbAttrPoor = Listbox(
                    tabi,
                    height=5,
                    width=lbWidth,
                    selectmode='extended')
            tabi.lbAttrPoor.grid(
                    row=9,
                    column=4,
                    sticky='e')
            tabi.sbAttrPoor = Scrollbar(
                    tabi,
                    orient='vertical',
                    command=tabi.lbAttrPoor.yview)
            tabi.sbAttrPoor.grid(
                    row=9,
                    column=5,
                    sticky='wns')
            tabi.lbAttrPoor.config(
                    yscrollcommand=tabi.sbAttrPoor.set)
            ################
            # add new attr #
            ################
            tabi.btnNewAttr = Button(
                    tabi,
                    text="^^ Add ^^",
                    command=lambda tabi=tabi:
                    addToList(
                        tabi.txtNewAttr,
                        [
                            tabi.lbAttrSrc,
                            tabi.lbAttrGood,
                            tabi.lbAttrFair,
                            tabi.lbAttrPoor
                        ],
                        tabi.lbAttrSrc))
            tabi.btnNewAttr.grid(
                    row=10,
                    column=0)
            tabi.txtNewAttr = Entry(tabi)
            tabi.txtNewAttr.insert(
                        0,
                        'Add a New Attribute')
            tabi.txtNewAttr.grid(
                    row=11,
                    column=0)
            ################### 
            # rating-comments #
            ################### 
            tabi.lblexplncaption = Label(
                    tabi,
                    text="Comments:")
            tabi.lblexplncaption.grid(
                    row=20,
                    column=0,
                    columnspan=6)
            tabi.sbexpln = Scrollbar(tabi)
            tabi.sbexpln.grid(
                    row=30,
                    column=5,
                    sticky='ns')
            tabi.txtexpln = Text(tabi,
                    height=4,
                    width=60,
                    yscrollcommand=tabi.sbexpln.set)
            tabi.txtexpln.bind('<FocusOut>', lambda _: scrapeExpln)
            tabi.sbexpln.config(command=tabi.txtexpln.yview)
            tabi.txtexpln.grid(
                    row=30,
                    column=0,
                    columnspan=5,
                    sticky='ew')
            tabi.btnnextben = Button(tabi,
                    text='Process the Next Beneficiary',
                    command=lambda: self.selectnext())
            tabi.btnnextben.grid(row=50, column=0,columnspan=6)
            tabi.btnRate = Button(tabi,
                    text="Next",
                    command=lambda: nb.select(frameSave))
            tabi.btnRate.grid(row=60, column=0, columnspan=6)

#####################
# parametrizations #
#####################
lbheight = 18
lbWidth = 32
fontHeight = 10
wrapwidth = 64
beneficiariesdict = csvtodict('parameters/beneficiaries.csv')
beneficiaries = sorted([beneficiary for beneficiary in beneficiariesdict.keys()])
attributesdict = csvtodict('parameters/attributes.csv')
attributes = sorted([attribute for attribute in attributesdict.keys()])
ratings = lineListFromFilename("parameters/ratings.txt")
tooltitle = 'BART: Beneficiary Assessment and Review Tool'
describetool = texttostring('parameters/describetool.txt')
beninstructions = texttostring('parameters/beninstructions.txt')
beninfo = texttostring('parameters/beninfo.txt')
attrsinstructions = texttostring('parameters/attrsinstructions.txt')

###############
# tkinter GUI #
###############
# make the root Toplevel Frame
root = Tk()
# parametrized standard font-size 
root.option_add("*Font", "courier " + str(fontHeight))
# instantiate a frame with this general syntax:
# <name> = <Class>(<parentwidget>[, **options])
# metasyntax-key: <required> [optional], | is or
master = Frame(root, name='master')
# every visible widget needs a geometry-manager:
# <name>.pack|grid|place([**options])
master.pack(fill='both')
# insert the tool's title
root.title(tooltitle)
root.protocol("WM_DELETE_WINDOW", root.quit)
# make a Notebook of tabs
nb = Notebook(master, name='nb')
nb.pack(fill='both', padx=2, pady=3)

###############################
# globally accessible buttons #
###############################
# these buttons appear outside every tab
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
frameSite.pack(fill='both')
nb.add(frameSite, text="Name the site")

txtdescribetool = Text(frameSite)
#txtdescribetool.bind()#RESUME making this text editable after freezing
txtdescribetool.insert('end', describetool)
txtdescribetool.config(state='disabled',
        background='#dfd',
        wrap='word',
        height=14)
txtdescribetool.pack()

lblSiteInstructions = Label(frameSite,
        text="Type the name of the site.")
lblSiteInstructions.pack()

txtSite = Entry(frameSite, width=lbWidth)
txtSite.pack()

btnChooseBens = Button(
        frameSite,
        text="Next",
        command=lambda: nb.select(framePackBens))
btnChooseBens.pack()

##############################################
# tab for choosing beneficiaries of the site #
##############################################
framePackBens = Frame(nb, name='framePackBens')
framePackBens.pack(fill='both')
nb.add(framePackBens, text='Beneficiaries')

frameChooseBens = Frame(
        framePackBens,
        name='frameChooseBens',
        borderwidth=2)
frameChooseBens.pack()

txtbeninstructions = Text(frameChooseBens)
txtbeninstructions.insert('end', beninstructions)
txtbeninstructions.config(
        state='disabled',
        background='#dfd',
        wrap='word',
        height=2)
txtbeninstructions.grid(
        row=0,
        column=0,
        columnspan=6)

lbBenSrc = Listbox(frameChooseBens, height=lbheight,
        width=lbWidth, selectmode='extended')
lbBenSrc.grid(row=1, column=0, rowspan=4, sticky='e')
for beneficiary in beneficiaries:
    lbBenSrc.insert('end', beneficiary)
sbBenSrc = Scrollbar(frameChooseBens, orient='vertical',
        command=lbBenSrc.yview)
sbBenSrc.grid(row=1, column=1, rowspan=4, sticky='wns')
lbBenSrc.config(yscrollcommand=sbBenSrc.set)

btnBenAdd = Button(frameChooseBens, text=">> Add >>",
        command=lambda: moveBetweenLists(
            lbBenSrc,
            lbBenDest))
btnBenAdd.grid(row=1, column=2, columnspan=2)
lblnewben = Label(frameChooseBens, text='Add a New Beneficiary')
lblnewben.grid(row=2, column=2, columnspan=2, sticky='s')
txtNewBen = Entry(frameChooseBens)
txtNewBen.grid(row=3, column=2, sticky='n', ipady='4') 
btnNewBen = Button(frameChooseBens, text=">>",
        command=lambda: addToList(
            txtNewBen,
            [lbBenSrc],
            lbBenDest))
btnNewBen.grid(row=3, column=3, sticky='n')
btnBenRm = Button(frameChooseBens, text="<< Remove <<",
        command=lambda: moveBetweenLists(
            bBenDest,
            lbBenSrc))
btnBenRm.grid(row=4, column=2, columnspan=2)

lbBenDest = Listbox(
        frameChooseBens,
        height=lbheight,
        width=lbWidth,
        selectmode='extended')
lbBenDest.grid(row=1, column=4, rowspan=4, sticky='e')
sbBenDest = Scrollbar(frameChooseBens,
        orient='vertical',
        command=lbBenDest.yview)
sbBenDest.grid(row=1, column=5, rowspan=4, sticky='wns')
lbBenDest.config(yscrollcommand=sbBenDest.set)

lblBenDescriptCaption = Label(
        frameChooseBens,
        text="Description of the underlined beneficiary:")
lblBenDescriptCaption.grid(row=5, column=0, columnspan=6)
sbbendescript = Scrollbar(frameChooseBens)
sbbendescript.grid(row=6, column=5)
txtbendescript = Text(
        frameChooseBens,
        yscrollcommand=sbbendescript)
txtbendescript.config(
        state='disabled',
        background='#dfd',
        wrap='word',
        height=3)
txtbendescript.grid(
        row=6,
        column=0,
        columnspan=5,
        sticky='ew')
sbbendescript.config(command=txtbendescript.yview)

# describe ben on select in listbox
lbBenSrc.bind_class('latebensrctag',
        '<<ListboxSelected>>',
        benactivation)
lbBenSrc.bind('<<ListboxSelect>>', benactivation)
tagtuple = ('latebensrctag',)+lbBenSrc.bindtags()
lbBenSrc.bindtags(tagtuple)
lbBenDest.bind_class('latebendesttag',
        '<<ListboxSelected>>',
        benactivation)
lbBenDest.bind('<<ListboxSelect>>', benactivation)
tagtuple = ('latebendesttag',)+lbBenDest.bindtags()
lbBenDest.bindtags(tagtuple)

lbBenSrc.bind('<Double-Button-1>', bendoubleclick)
lbBenDest.bind('<Double-Button-1>', bendoubleclick)

lblbeninfocapt = Label(
        frameChooseBens,
        text='Explanation of page:')
lblbeninfocapt.grid(row=7, column=0, columnspan=6)
txtbeninfo = Text(frameChooseBens)
txtbeninfo.insert('end', beninfo)
txtbeninfo.config( 
        state='disabled',
        background='#dfd',
        wrap='word',
        height=10)
txtbeninfo.grid(row=8, column=0, columnspan=5, sticky='ew')
sbbeninfo = Scrollbar(frameChooseBens, command=txtbeninfo.yview)
sbbeninfo.grid(row=8, column=5, sticky='nws')
txtbeninfo.config(yscrollcommand=sbbeninfo.set)


btnProcessBens = Button(frameChooseBens, text="Next")
btnProcessBens.config(command=lambda: processBens())
btnProcessBens.grid(row=11, column=0, columnspan=6)

#################################################
# tab for adding attributes to each beneficiary #
#################################################
frameProcessBens = Frame(nb, name='frameProcessBens')
frameProcessBens.pack(fill='both')
nb.add(frameProcessBens, text="Process Beneficiaries")

nbRatings = Ratings_Notebook()
# tabs for ratings are populated on use btnProcessBens

##################################
# tab to review and save ratings #
##################################
frameSave = Frame(nb, name="frameSave")
#frameSave.pack_propagate(0)
frameSave.grid_propagate(0)
frameSave.grid_columnconfigure(0, weight=1)
frameSave.pack(fill='both')
nb.add(frameSave, text="Save Ratings")

lblSaveInstructions = Label(
        frameSave,
        text="Save these ratings to a file for later use.")
lblSaveInstructions.grid(row=0, column=0, columnspan=2)
session = Session()

# review ratings
ratingstree = Treeview(frameSave)
ratingstree.grid_propagate(0)
ratingstree.grid(row=0, column=0, sticky='news')
ratingstreevsb = Scrollbar(frameSave, orient='vertical')
ratingstreevsb.grid(row=0, column=1, sticky='wns')
ratingstreehsb = Scrollbar(frameSave, orient='horizontal')
ratingstreehsb.grid(row=1, column=0, sticky='new')
frameSave.bind('<Expose>', updateratingstree)
ratingstreehsb.config(command=ratingstree.xview)
ratingstreevsb.config(command=ratingstree.yview)
ratingstree.config(
        xscrollcommand=ratingstreehsb.set,
        yscrollcommand=ratingstreevsb.set)
ratingstree['columns'] = session.fieldnames 
for heading in session.fieldnames:
    ratingstree.heading(heading, text=heading)

btnSave = Button(frameSave, text="Save Ratings to a File")
btnSave.grid(row=2, column=0, columnspan=2)
btnSave.config(command=lambda: session.saveratingscallback())

btndebug = Button(
        frameSave,
        text="Debug",
        command=lambda: pdb.set_trace())
#btndebug.grid(row=3, column=0, columnspan=2)

btnplot = Button(
        frameSave,
        text="Plot",
        command=plotratings)
btnplot.grid(row=10, column=0, columnspan=2)

if __name__ == '__main__':
    root.mainloop()
'''
    don't put any code which should run before the GUI
    closes after mainloop
'''
