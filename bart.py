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
===========================================================
TODO

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
1. Fix bug on beneficiary page--> DEFINITIONS for beneficiaries should pop up with one click
  - DONE find and fix bug on beneficiaries' listboxes
    - bindtags solution:
      - lbBenSrc.bind_class('latebensrctag', '<<ListboxSelected>>', benactivation)
      - taglist = lbBenSrc.bindtags()+('latebensrctag',)
      - lbBenSrc.bindtags(taglist)
      - lbBenDest.bind_class('latebendesttag', '<<ListboxSelected>>', benactivation)
      - taglist = lbBenDest.bindtags()+('latebendesttag',)
      - lbBenDest.bindtags(taglist)
  - FIXME !!!! fix attrs listboxes, too !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
2. Create good, fair, and poor destination-listboxes for attributes
  - make good,fair, and poor buttons that move to respective listboxes
  - use only one remove button
  - track lbAttr* contents with session.lbAttr*
  - make listboxselect deselect all other listboxes on page
      - as there is only one listbox item selected on page, remove knows which item to remove
  - implement data-structure for beneficiary-ratings and attribute-ratings:
    - each rating has fields:
      - timestamp, site, ben, benrating, benexpln, attr, attrrating, expln 
3. CREATE overall rating on ATTRIBUTE PAGE
  - "How satisfied, overall, is this beneficiary with the site?
  - move rating above lblBenDescriptCaption
4. Change wording in Green boxes according to new draft. KW will email new wording on Friday, August 26.
  - new draft?
5. Update welcome page (see email with new, simplified welcome message). 
  - new message?
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

def moveBetweenLists(fromList, toList):
    "move selected items between fromList and toList"
    indices = [i for i in fromList.curselection()]
    indices.sort(reverse=True)
    for i in range(len(indices)):
        index = indices.pop()-i
        toList.insert('end', fromList.get(index))
        fromList.delete(index)
def addToList(textbox, listsrc, listdest):
    '''add textbox's contents to the end of
    list if not already in list'''
    item = str(textbox.get()).strip()
    # validate item
    if item == '': return
    for i in range(listsrc.index('end')):
        if item == listsrc.get(i): 
            messagebox.showinfo('Cancelled',
                    'The item was not added: "'+
                    item+'" already in the source list.')
            return
    for i in range(listdest.index('end')):
        if item == listdest.get(i):
            messagebox.showinfo('Cancelled',
                    'The item was not added: "'+
                    item+'" already in the destination list.')
            return
    # insert item into listdest
    listdest.insert('end', str(item))
    # FIXME add to user-attributes.csv or user-beneficiaries.csv
    # additemtocsv(item, description, csv)
    messagebox.showinfo('Added '+item, item+' were added to the list.')
    textbox.delete(0, 'end')
def benratingsaver(event):
    parent = event.widget.master
    i = nbRatings.index('current')
    savebenrating(
            ben=str(nbRatings.labels[i]['text']),
            rating=parent.cmbRating.get())
def savebenrating(ben, rating):
    session.benratings[ben] = rating
def loadbenrating(ben):
    cmbRating.set(session.benratings[ben])
def getbenrating(ben):
    #FIXME
    index = session.benratings.index(ben)
    session.benratings[ben] = session.ratings(index)
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
    curselection = event.widget.curselection()
    if len(curselection) != 1:
        activeben = str(event.widget.get('active'))
    else:
        activeben = str(event.widget.get(curselection[0]))
        # find beneficiary's description
    if activeben in beneficiariesdict.keys():
        description = beneficiariesdict[activeben]
    else:
        description = ''
    lblBenDescriptCaption.config(text=activeben+":")
    # insert description
    txtbendescript.config(state='normal')
    txtbendescript.delete(1.0, 'end')
    txtbendescript.insert('end', description)
    txtbendescript.config(state='disabled')
    if activeben in session.benratings.keys():
        cmbRating.set(session.benratings[activeben])
def bendoubleclick(event):
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
    row = 0
    ratingstree.delete(*ratingstree.get_children())
    for item in session.ratings:
        values=[]
        for field in session.fieldnames:
            values.append(item[field])
        values = tuple(values)
        ratingstree.insert(
                '',
                row,
                text='row '+str(row),
                values=values)
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
        self.benratings = {}
    def update(self):
        if len(self.ratings) != 0:
            del(self.ratings)
            self.ratings = []
        fields = self.fieldnames
        dictnum = 0
        session.benratings = {}
        for i in range(len(nbRatings.tablist)):
            limit = nbRatings.tablist[i].lbAttrDest.index('end')+1
            for j in range(limit):
                self.ratings.append({})
                tabi = nbRatings.tablist[i]
                ben = lbBenDest.get(i)
                attribute = tabi.lbAttrDest.get(j)
                self.ratings[dictnum][fields[0]] =\
                        session.site.get()
                self.ratings[dictnum][fields[1]] =\
                        ben
                self.ratings[dictnum][fields[2]] =\
                        attribute
                self.ratings[dictnum][fields[3]] =\
                        getbenrating(ben)
                self.ratings[dictnum][fields[4]] =\
                        tabi.txtexpln.get('0.1', 'end-1c')
                self.ratings[dictnum][fields[-1]] =\
                        str(datetime.now())
                dictnum += 1
    def saveRatings(self):
        'save ratings to csv with fieldnames as header'
        self.update()
        # create timestamp for the initially suggested filename
        formatstring = "%Y.%m.%dAT%H.%M.%S"
        timestamp = datetime.now().strftime(formatstring)
        initialfile = 'saved-fegs-ratings-'+timestamp+'.csv'
        filename = asksaveasfilename(initialfile=initialfile)
        if filename != None and filename != '':
            with open(
                    filename,
                    'w',
                    newline='\r\n') as csvfile:
                writer = csv.DictWriter(
                        csvfile,
                        fieldnames=self.fieldnames)
                writer.writeheader()
                for i in range(len(self.ratings)):
                    writer.writerow(self.ratings[i])
            messagebox.showinfo("Saved", "The file of ratings was saved.")
        else:
            messagebox.showinfo('Aborted', 'Saving failed.')
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
        "save data entered for loading later"
        site = self.site.get()
        listbensrc = self.lblist(lbBenSrc)
        listbendest = self.lblist(lbBenDest)
        ratingslist = []
        for i in range(len(nbRatings.tablist)):
            ratingslist.append({})
            ratingi = ratingslist[i]
            tabi = nbRatings.tablist[i]
            listattrsrc = self.lblist(tabi.lbAttrSrc)
            ratingi['listattrsrc'] = listattrsrc
            listattrdest = self.lblist(tabi.lbAttrDest)
            ratingi['listattrdest'] = listattrdest
            ben = str(lbBenDest.get(i))
            if ben in session.benratings.keys():
                benrating = session.benratings[ben]
                ratingi['benrating'] = benrating
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
        'load saved data-entry-session into tool'
        session.__init__()
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
        #FIXME bug in load clears txtSite
        session.site.set(site)
        self.loadlb(listbensrc, lbBenSrc)
        self.loadlb(listbendest, lbBenDest)
        nbRatings.updatetabs()
        ratingsrange = range(len(ratingslist))
        for i in ratingsrange:
            tabi = nbRatings.tablist[i]
            ratinginfo = ratingslist[i]
            if 'listattrsrc' in ratinginfo.keys():
                self.loadlb(ratinginfo['listattrsrc'], tabi.lbAttrSrc)
            if 'listattrdest' in ratinginfo.keys():
                self.loadlb(ratinginfo['listattrdest'], tabi.lbAttrDest)
            if  'benrating' in ratinginfo.keys():
                beni = str(lbBenDest.get(i))
                rating = ratinginfo['benrating']
                session.benratings[beni] = rating
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
            #tabi.lblnewattr = Label(
            #        tabi,
            #        text='Add a New Attribute')
            #tabi.lblnewattr.grid(
            #        row=7,
            #        column=2,
            #        columnspan=2,
            #        sticky='s')
            tabi.btnNewAttr = Button(
                    tabi,
                    text="<<",
                    command=lambda tabi=tabi:
                    addToList(
                        tabi.txtNewAttr,
                        tabi.lbAttrSrc,
                        tabi.lbAttrDest))
            tabi.btnNewAttr.grid(
                    row=6,
                    column=2)
            tabi.txtNewAttr = Entry(tabi)
            tabi.txtNewAttr.insert(
                        0,
                        'Add a New Attribute')
            tabi.txtNewAttr.grid(
                    row=6,
                    column=3)
            tabi.btnAttrRm = Button(
                    tabi,
                    text="<< Remove <<",
                    command=lambda tabi=tabi:
                    moveBetweenLists(
                        tabi.lbAttrDest,
                        tabi.lbAttrSrc))
            tabi.btnAttrRm.grid(
                    row=8,
                    column=2,
                    columnspan=2)
            #######################################
            # destination listboxes of attributes #
            #######################################
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
            # rating-comments from user
            tabi.lblexplncaption = Label(
                    tabi,
                    text="Comments:")
            tabi.lblexplncaption.grid(
                    row=12,
                    column=0,
                    columnspan=6)
            tabi.sbexpln = Scrollbar(tabi)
            tabi.sbexpln.grid(
                    row=13,
                    column=5,
                    sticky='ns')
            tabi.txtexpln = Text(tabi,
                    height=10,
                    width=60,
                    yscrollcommand=tabi.sbexpln.set)
            tabi.txtexpln.bind('<FocusOut>', lambda _: scrapeExpln)
            tabi.sbexpln.config(command=tabi.txtexpln.yview)
            tabi.txtexpln.grid(
                    row=13,
                    column=0,
                    columnspan=5,
                    sticky='ew')
            tabi.btnnextben = Button(tabi,
                    text='Process the Next Beneficiary',
                    command=lambda: self.selectnext())
            tabi.btnnextben.grid(row=14, column=0,columnspan=6)
            tabi.btnRate = Button(tabi,
                    text="Next",
                    command=lambda: nb.select(frameSave))
            tabi.btnRate.grid(row=15, column=0, columnspan=6)

# parametrizations
lbheight = 18
lbWidth = 32
fontHeight = 10
wrapwidth = 64
beneficiariesdict = csvtodict('parameters/beneficiaries.csv')
beneficiaries = sorted([beneficiary for beneficiary in beneficiariesdict.keys()])
attributesdict = csvtodict('parameters/attributes.csv')
attributes = sorted([attribute for attribute in attributesdict.keys()])
ratings = lineListFromFilename("parameters/ratings.txt")
# CMS
tooltitle = 'BART: Beneficiary Assessment and Review Tool'
describetool = texttostring('parameters/describetool.txt')
beninstructions = texttostring('parameters/beninstructions.txt')
beninfo = texttostring('parameters/beninfo.txt')
attrsinstructions = texttostring('parameters/attrsinstructions.txt')

###############
# tkinter GUI #
###############
root = Tk()
root.option_add("*Font", "courier " + str(fontHeight))
master = Frame(root, name='master')
master.pack(fill='both')
root.title(tooltitle)
root.protocol("WM_DELETE_WINDOW", master.quit)
nb = Notebook(master, name='nb')
nb.pack(fill='both', padx=2, pady=3)

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
            lbBenSrc,
            lbBenDest))
btnNewBen.grid(row=3, column=3, sticky='n')
btnBenRm = Button(frameChooseBens, text="<< Remove <<",
        command=lambda: moveBetweenLists(lbBenDest, lbBenSrc))
btnBenRm.grid(row=4, column=2, columnspan=2)

lbBenDest = Listbox(frameChooseBens, height=lbheight, width=lbWidth, selectmode='extended')
lbBenDest.grid(row=1, column=4, rowspan=4, sticky='e')
sbBenDest = Scrollbar(frameChooseBens, orient='vertical', command=lbBenDest.yview)
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

btnSave = Button(frameSave, text="Save")
btnSave.grid(row=2, column=0, columnspan=2)
btnSave.config(command=lambda: session.saveRatings())

btndebug = Button(
        frameSave,
        text="Debug",
        command =lambda: pdb.set_trace())
btndebug.grid(row=3, column=0, columnspan=2)

if __name__ == '__main__':
    root.mainloop()
'''
    don't put any code which should run before the GUI
    closes after mainloop
'''
