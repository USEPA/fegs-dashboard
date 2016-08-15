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

#TODO make results treeview scrollable both directions
#TODO make a separate csv for user-added beneficiaries
#TODO load user-beneficiaries.csv
#TODO sort lbBenSrc after loading both lists
#TODO addToList checks *beneficiaries.csv for item
#TODO addToList adds item to user-beneficiaries.csv
#TODO clear txtNewBen after insertion of new ben into lbBenDest
#TODO facility for users to add a description with a new beneficiary
#TODO make a separate csv for user-added attributes
#TODO make frame master vertically and horizontally scrollable
#TODO facility for users to add a description with a new attribute
#TODO clear txtNewAttr after insertion of new attr into lbAttrDest
#TODO visual feedback for completed ratings:
  #TODO validate data on leave rating tab
  #TODO askyesno: "done with rating?"
  #TODO rating-tab-color = green
#TODO visualize ratings by providing something like a graph
#TODO set wraplength for all labels(try lbl.<some_method>_all)
#TODO retain data on existing rating-tabs when tabs are added
#TODO create data-analysis function
#TODO tab change focus from within Text widgets
#TODO enter key triggers default button on nb tab or nbRating tab
#TODO investigate localization support
#TODO clear txtNewBen and txtNewAttr after text retrieval
#TODO update nbRatings on activate frameProcessBens
#TODO horizontal scrollbars on listboxes

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
def addToList(item, listsrc, listdest):
    '''casts item as str and adds it to the end of list if
    not already in list
    '''
    for i in range(listsrc.index('end')):
        if item == listsrc.get(i): 
            print('The item is in the source list.')
            return
    for i in range(listdest.index('end')):
        if item == listdest.get(i):
            print('The item is in the destination list.')
            return
    listdest.insert('end', str(item))
    # FIXME add item to user-attributes.csv or user-beneficiaries.csv
    # additemtocsv(item, description, csv)
    messagebox.showinfo('Added', 'This item was added:\n'+item)
def additemtocsv(item, description, csvfilename):
    # FIXME open csv for writing and add item, description to it
    with open(csvfilename,'a') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow((item,description))
def lineListFromFilename(filename):
    "returns a list of end-whitespace-stripped lines from filename"
    lines = [line.rstrip('\n') for line in open(filename)]
    return lines
def scrapeExpln():
    "save explanation to a session-state-variable on focus out"
    session.expln = txtExpln.get('0.1', 'end-1c')
def processBens():
    "generate a tab for each ben in lbBenDest"
    nbRatings.updatetabs()
    nb.select(frameProcessBens)
def benactivation(event):
    "update descriptions of beneficiary when it's activated in a listbox"
    lblBenDescriptCaption.config(text=str(event.widget.get(ACTIVE))+":")
    description = beneficiariesdict[event.widget.get(ACTIVE)]
    txtBenDescript.config(state=NORMAL)
    txtBenDescript.delete(1.0, 'end')
    txtBenDescript.insert('end', description)
    txtBenDescript.config(state=DISABLED)
def attractivation(event):
    "update descriptions of attribute when it's activated in a listbox"
    parent = event.widget.master
    parent.lblattrdescriptcaption.config(text=str(
        event.widget.get(ACTIVE))+":")
    description = attributesdict[event.widget.get(ACTIVE)]
    parent.txtattrdescript.config(state='normal')
    parent.txtattrdescript.delete(1.0, 'end')
    parent.txtattrdescript.insert('end', description)
    parent.txtattrdescript.config(state='disabled')
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
        fields = self.fieldnames
        dictnum = 0
        for i in range(len(nbRatings.tablist)):
            limit = nbRatings.tablist[i].lbAttrDest.size()
            for j in range(limit):
                self.ratings.append({})
                tabi = nbRatings.tablist[i]
                attribute = tabi.lbAttrDest.get(j)
                self.ratings[dictnum][fields[0]] =\
                        txtSite.get()
                self.ratings[dictnum][fields[1]] =\
                        lbBenDest.get(i)
                self.ratings[dictnum][fields[2]] =\
                        attribute
                self.ratings[dictnum][fields[3]] =\
                        tabi.cmbRating.get()
                self.ratings[dictnum][fields[4]] =\
                        tabi.txtExpln.get('0.1', 'end-1c')
                self.ratings[dictnum][fields[-1]] =\
                        str(datetime.now())
                dictnum += 1
    def saveRatings(self):
        'save ratings to csv with fieldnames as header'
        self.update()
        formatstring = "%Y.%m.%dAT%H.%M.%S"
        timestamp = datetime.now().strftime(formatstring)
        initialfile = 'saved-fegs-ratings-'+timestamp+'.csv'
        filename = asksaveasfilename(initialfile)
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
        site = txtSite.get()
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
            rating = tabi.cmbRating.get()
            ratingi['rating'] = rating
            expln = tabi.txtExpln.get('0.1','end-1c')
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
            #REMOVED pickle.HIGHEST_PROTOCOL as arg 3 above
    def load(self):
        'load saved data-entry-session into tool'
        # RESUME IMPLEMENTING LOADER FNCNALITY
        filename = askopenfilename(filetypes=[(
            'pickled sessions',
            "*.pickle")])
        with open(filename,'rb') as f:
            [
                    site,
                    listbensrc,
                    listbendest,
                    ratingslist ] =  pickle.load(f)
        txtSite.delete(0,'end')
        txtSite.insert('end', site)
        self.loadlb(listbensrc, lbBenSrc)
        self.loadlb(listbendest, lbBenDest)
        nbRatings.updatetabs()
        for i in range(len(ratingslist)):
            tabi = nbRatings.tablist[i]
            ratingi = ratingslist[i]
            if 'listattrsrc' in ratingi.keys():
                self.loadlb(ratingi['listattrsrc'], tabi.lbAttrSrc)
            if 'listattrdest' in ratingi.keys():
                self.loadlb(ratingi['listattrdest'], tabi.lbAttrDest)
            if 'rating' in ratingi.keys():
                rating = ratingi['rating']
                tabi.cmbRating.set(rating)
            if 'explanation' in ratingi.keys():
                expln = ratingi['explanation']
                tabi.txtExpln.insert('end', expln)

class Ratings_Notebook(Notebook):
    "check lbBenDest.size() for dynamic size"
    def __init__(self):
        Notebook.__init__(self,frameProcessBens)
        self.pack()
        self.tablist = []
        self.labels = []
    def selectnext(self):
        'select next ben to rate if not on last ben'
        if self.index('current') < self.index('end'):
            self.select(self.index('current')+1)
    def cleartabs(self):
        "clear all tabs from Ratings_Notebook object"
        numtabs = self.index('end')
        for i in range(numtabs):
            self.forget(self.tablist[i])
    def updatetabs(self):
        "update tabs to reflect lbBenDest"
        self.cleartabs()
        for i in range(lbBenDest.size()):
            self.tablist.append(Frame(self))
            tabi = self.tablist[i]
            ben = lbBenDest.get(i)
            tabi.pack()
            self.labels.append(Label(tabi, text=ben))
            self.labels[i].grid(row=0, column=0, columnspan=6)
            self.add(tabi, text=ben)
            # source listbox of attributes
            tabi.lbAttrSrc = Listbox(tabi, height=lbHeight,
                    width=lbWidth, selectmode=EXTENDED)
            tabi.lbAttrSrc.grid(row=1, column=0, rowspan=4, sticky=E)
            for attribute in attributes:
                tabi.lbAttrSrc.insert('end', attribute)
            tabi.lbAttrSrc.bind('<<ListboxSelect>>',attractivation)
            tabi.sbAttrSrc = Scrollbar(tabi, orient=VERTICAL,
                    command=tabi.lbAttrSrc.yview)
            tabi.sbAttrSrc.grid(row=1, column=1, rowspan=4, sticky=W+N+S)
            tabi.lbAttrSrc.config(yscrollcommand=tabi.sbAttrSrc.set)
            # widgets between listboxes
            tabi.btnAttrAdd = Button(tabi, text=">> Add >>",
                    command=lambda tabi=tabi: moveBetweenLists(
                        tabi.lbAttrSrc, tabi.lbAttrDest))
            tabi.btnAttrAdd.grid(row=1, column=2, columnspan=2)
            tabi.lblnewattr = Label(tabi,
                    text='Add a New Attribute')
            tabi.lblnewattr.grid(row=2, column=2, columnspan=2, sticky='s')
            tabi.txtNewAttr = Entry(tabi)
            tabi.txtNewAttr.grid(row=3, column=2, sticky='n', ipady=4)
            tabi.btnNewAttr = Button(tabi, text=">>",
                    command=lambda tabi=tabi: addToList(
                        tabi.txtNewAttr.get(),
                        tabi.lbAttrSrc,
                        tabi.lbAttrDest))
            tabi.btnNewAttr.grid(row=3, column=3, sticky='n')
            tabi.btnAttrRm = Button(tabi, text="<< Remove <<",
                    command=lambda tabi=tabi: moveBetweenLists(
                        tabi.lbAttrDest, tabi.lbAttrSrc))
            tabi.btnAttrRm.grid(row=4, column=2, columnspan=2)
            # destination listbox of attributes
            tabi.lbAttrDest = Listbox(tabi, height=lbHeight,
                    width=lbWidth, selectmode=EXTENDED)
            tabi.lbAttrDest.grid(row=1, column=4, rowspan=4, sticky='e')
            tabi.lbAttrDest.bind('<<ListboxSelect>>',attractivation)
            tabi.sbAttrDest = Scrollbar(tabi, orient=VERTICAL,
                    command=tabi.lbAttrDest.yview)
            tabi.sbAttrDest.grid(row=1, column=5, rowspan=4, sticky=W+N+S)
            tabi.lbAttrDest.config(yscrollcommand=tabi.sbAttrDest.set)
            # description of active attribute
            tabi.lblattrdescriptcaption = Label(tabi,
                    text="Attribute:")
            tabi.lblattrdescriptcaption.grid(row=5,column=0,columnspan=6)
            tabi.sbattrdescript = Scrollbar(
                    tabi,
                    name='sbattrdescript')
            tabi.sbattrdescript.grid(row=6, column=5)
            tabi.txtattrdescript = Text(
                    tabi,
                    name='txtattrdescript',
                    yscrollcommand=sbattrdescript.set)
            tabi.txtattrdescript.config(
                    state='disabled',
                    background='#dfd',
                    wrap='word',
                    height=3)
            tabi.txtattrdescript.grid(row=6, column=0, columnspan=5)
            tabi.sbattrdescript.config(command=tabi.txtattrdescript.yview)
            # combobox of rating-values; text area for explanation
            tabi.cmbratingcaption = Label(tabi,
                    text='Enter a rating: ')
            tabi.cmbratingcaption.grid(row=7,
                    column=0,columnspan=6)
            tabi.cmbRating = Combobox(tabi, values=ratings)
            tabi.cmbRating.grid(row=8, column=0, columnspan=6)
            tabi.txtExpln = Text(tabi, height=10,
                    width=60)
            tabi.lblexplncaption = Label(tabi,
                    text='Add an Explanation for this Rating')
            tabi.lblexplncaption.grid(row=9, column=0, columnspan=6)
            tabi.txtExpln.bind('<FocusOut>', lambda _: scrapeExpln)
            tabi.txtExpln.grid(row=10, column=0, columnspan=6)
            tabi.btnnextben = Button(tabi,
                    text='Process the Next Beneficiary',
                    command=lambda: self.selectnext())
            tabi.btnnextben.grid(row=11, column=0,columnspan=6)
            tabi.btnRate = Button(tabi,
                    text="Next",
                    command=lambda: nb.select(frameSave))
            tabi.btnRate.grid(row=12, column=0, columnspan=6)

# parametrizations
lbHeight = 16
lbWidth = 32
fontHeight = 10
wrapwidth = 64
beneficiariesdict = csvtodict('parameters/beneficiaries.csv')
beneficiaries = sorted([beneficiary for beneficiary in beneficiariesdict.keys()])
attributesdict = csvtodict('parameters/attributes.csv')
attributes = sorted([attribute for attribute in attributesdict.keys()])
ratings = lineListFromFilename("parameters/ratings.txt")
# CMS
tooltitle = 'FEGS Ratings Tool'
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
master.pack(fill=BOTH)
root.title(tooltitle)
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

btnChooseBens = Button(frameSite, text="Next",
        command=lambda: nb.select(frameChooseBens))
btnChooseBens.pack()

##############################################
# tab for choosing beneficiaries of the site #
##############################################
frameChooseBens = Frame(nb, name='frameChooseBens')
# frame placed in efforts to center frame
#frameChooseBens.place(in_=nb, anchor='c', relx=.5, rely=.5)
frameChooseBens.pack(fill='both')
frameChooseBens.config(border='2')
nb.add(frameChooseBens, text="Beneficiaries")

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

lbBenSrc = Listbox(frameChooseBens, height=lbHeight,
        width=lbWidth, selectmode=EXTENDED)
lbBenSrc.grid(row=1, column=0, rowspan=4, sticky='e')
for beneficiary in beneficiaries:
    lbBenSrc.insert('end', beneficiary)
sbBenSrc = Scrollbar(frameChooseBens, orient=VERTICAL,
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
            txtNewBen.get(),
            lbBenSrc,
            lbBenDest))
btnNewBen.grid(row=3, column=3, sticky='n')
btnBenRm = Button(frameChooseBens, text="<< Remove <<",\
                  command=lambda: moveBetweenLists(lbBenDest, lbBenSrc))
btnBenRm.grid(row=4, column=2, columnspan=2)

lbBenDest = Listbox(frameChooseBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbBenDest.grid(row=1, column=4, rowspan=4, sticky='e')
sbBenDest = Scrollbar(frameChooseBens, orient=VERTICAL, command=lbBenDest.yview)
sbBenDest.grid(row=1, column=5, rowspan=4, sticky='wns')
lbBenDest.config(yscrollcommand=sbBenDest.set)

lblBenDescriptCaption = Label(
        frameChooseBens,
        text="Description of the underlined beneficiary:")
lblBenDescriptCaption.grid(row=5, column=0, columnspan=6)
sbbendescript = Scrollbar(frameChooseBens)
sbbendescript.grid(row=6, column=5)
txtBenDescript = Text(
        frameChooseBens,
        yscrollcommand=sbbendescript)
txtBenDescript.config(
        state='disabled',
        background='#dfd',
        wrap='word',
        height=3)
txtBenDescript.grid(row=6, column=0, columnspan=5, sticky=E)
sbbendescript.config(command=txtBenDescript.yview)
lbBenSrc.bind('<<ListboxSelect>>', benactivation)
lbBenDest.bind('<<ListboxSelect>>', benactivation)

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
btnProcessBens.grid(row=9, column=0, columnspan=6)

#################################################
# tab for adding attributes to each beneficiary #
#################################################
frameProcessBens = Frame(nb, name='frameProcessBens')
frameProcessBens.pack(fill=BOTH)
#frameProcessBens.bind("<Activate>", lambda: processBens())
nb.add(frameProcessBens, text="Process Beneficiaries")

txtAttrsInstructions = Text(frameProcessBens)
txtAttrsInstructions.insert('end', attrsinstructions)
txtAttrsInstructions.config(
        state='disabled',
        background='#dfd',
        wrap='word',
        height=3)

txtAttrsInstructions.pack()

nbRatings = Ratings_Notebook()
# tabs for ratings are populated on press btnProcessBens

##################################
# tab to review and save ratings #
##################################
frameSave = Frame(nb, name="frameSave")
frameSave.pack(fill=BOTH)
nb.add(frameSave, text="Save Ratings")

lblSaveInstructions = Label(
        frameSave,
        text="Save these ratings to a file for later use.")
lblSaveInstructions.pack()

session = Session()

# review ratings
framereview = Frame(frameSave)
framereview.pack(fill='both', expand=1)
ratingstreehsb = Scrollbar(framereview, orient='horizontal')
ratingstreehsb.grid(row=1, column=0, sticky='new')
ratingstreevsb = Scrollbar(framereview, orient='vertical')
ratingstreevsb.grid(row=0, column=1, sticky='nsw')
ratingstree = Treeview(framereview)
frameSave.bind('<Expose>', updateratingstree)
ratingstree.grid(row=0, column=0, sticky='news')
ratingstreehsb.config(command=ratingstree.xview)
ratingstreevsb.config(command=ratingstree.yview)
ratingstree.config(
        xscrollcommand=ratingstreehsb.set,
        yscrollcommand=ratingstreevsb.set)
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

if __name__ == '__main__':
    root.mainloop()
'''don't put any code which should run before the GUI
closes after mainloop
'''
