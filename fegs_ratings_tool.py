# FIXME: add tabbed bens i'face

# fegs-rating-tool: rate attributes (natural features) for different classes of beneficiaries
from tkinter import *
from tkinter.ttk import *
import datetime

# parametr's [= parametrizations]
lbHeight = 16
lbWidth = 32
fontHeight = 10

root = Tk()
root.option_add("*Font", "courier " + str(fontHeight))

master = Frame(root, name='master')
master.pack(fill=BOTH)

root.title('FEGS Rating Tool')
root.protocol("WM_DELETE_WINDOW", master.quit)

nb = Notebook(master, name='nb')
nb.pack(fill=BOTH, padx=2, pady=3)

def moveBetweenLists(element, fromList, toList):
    # move items between fromList and toList
    items = fromList.curselection.value()
    for item in items:
        toList.insert(END, fromList(item))
        fromList.delete(item)
    
###########################
# tab for naming the site #
###########################
frameSiteName = Frame(nb, name='frameSiteName')
frameSiteName.pack(fill=BOTH)
nb.add(frameSiteName, text="Name the site")

lblSiteInstructions = Label(frameSiteName, text="Type the name of the site below.")
lblSiteInstructions.grid(row=0)

txtSiteName = Entry(frameSiteName, text="Type the site name here.", width=lbWidth)
txtSiteName.grid(row=1)

btnChooseBens = Button(frameSiteName, text="Move on to choose beneficiaries of the site.", command=lambda: nb.select(frameChooseBens))
btnChooseBens.grid(row=2)

##############################################
# tab for choosing beneficiaries of the site #
##############################################
frameChooseBens = Frame(nb, name='frameChooseBens')
frameChooseBens.pack(fill=BOTH)
nb.add(frameChooseBens, text="Choose Beneficiaries")

txtBenInstructions = Label(frameChooseBens, text="Build a list of beneficiaries interested in the site. Here, a beneficiary is a role as which a person uses or appreciates the site.")
txtBenInstructions.grid(row=0, column=0, columnspan=6)

lbBenSrc = Listbox(frameChooseBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbBenSrc.grid(row=1, column=0, rowspan=3)
for ben in open("parameters/beneficiaries.txt","r"):
    lbBenSrc.insert(END, ben)

sbBenSrc = Scrollbar(frameChooseBens, orient=VERTICAL, command=lbBenSrc.yview)
sbBenSrc.grid(row=1, column=1, rowspan=3, sticky=N+S)
lbBenSrc.config(yscrollcommand=sbBenSrc.set)

btnBenAdd = Button(frameChooseBens, text=">> Add >>")
btnBenAdd.grid(row=1, column=2, columnspan=2)

txtNewBen = Entry(frameChooseBens, text="Don't see a beneficiary? Type it here and click >>")
txtNewBen.grid(row=2, column=2) 

btnNewBen = Button(frameChooseBens, text=">>")
btnNewBen.grid(row=2, column=3)

btnBenRm = Button(frameChooseBens, text="<< Remove <<")
btnBenRm.grid(row=3, column=2, columnspan=2)

lbBenDest = Listbox(frameChooseBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbBenDest.grid(row=1, column=4, rowspan=3)

sbBenDest = Scrollbar(frameChooseBens, orient=VERTICAL, command=lbBenDest.yview)
sbBenDest.grid(row=1, column=5, sticky=N+S)
lbBenDest.config(yscrollcommand=sbBenDest.set)

btnProcessBens = Button(frameChooseBens, text="Process Beneficiaries", command=lambda: nb.select(frameProcessBens))
btnProcessBens.grid(row=4, column=2, columnspan=2)

#################################################
# tab for adding attributes to each beneficiary #
#################################################
frameProcessBens = Frame(nb, name='frameProcessBens')
frameProcessBens.pack(fill=BOTH)
nb.add(frameProcessBens, text="Process Beneficiaries")

nbBens = Notebook(frameProcessBens, name="nbBens")

lblAttrsInstructions = Label(frameProcessBens, text="Create a list of attributes that affects each beneficiary's rating of the site.")
lblAttrsInstructions.grid(row=0, column=0, columnspan=4)

# source list of attributes
lbAttrSrc = Listbox(frameProcessBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbAttrSrc.grid(row=1, column=0, rowspan=3)
# populate the attributes users select from
for attr in open("parameters/attributes.txt", "r"):
    lbAttrSrc.insert(END, attr)

sbAttrSrc = Scrollbar(frameProcessBens, orient=VERTICAL, command=lbAttrSrc.yview)
sbAttrSrc.grid(row=1, column=5, sticky=N+S)
lbAttrSrc.config(yscrollcommand=sbAttrSrc.set)

# widgets between listboxes
btnAttrAdd = Button(frameProcessBens, text=">> Add >>")
btnAttrAdd.grid(row=1, column=1, columnspan=2)
txtNewAttr = Entry(frameProcessBens, text="Don't see a? Type it here and click >>")
txtNewAttr.grid(row=2, column=1)
btnNewAttr = Button(frameProcessBens, text=">>")
btnNewAttr.grid(row=2, column=2)
btnAttrRm = Button(frameProcessBens, text="<< Remove <<")
btnAttrRm.grid(row=3, column=1, columnspan=2)

# destination list of attributes
lbAttrDest = Listbox(frameProcessBens, height=lbHeight, width=lbWidth, selectmode=EXTENDED)
lbAttrDest.grid(row=1, column=3, rowspan=3)
# populate the attributes users select from
for attr in open("parameters/attributes.txt", "r"):
    lbBenSrc.insert(END, attr)

sbAttrDest = Scrollbar(frameProcessBens, orient=VERTICAL, command=lbAttrDest.yview)
sbAttrDest.grid(row=1, column=5, sticky=N+S)
lbAttrDest.config(yscrollcommand=sbAttrDest.set)

btnRate = Button(frameProcessBens, text="Rate the site for the beneficiaries.", command=lambda: nb.select(frameSubmit))
btnRate.grid(row=9, column=1, columnspan=2)

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

class Ratings_Session():
    "gives users a persistent session across closing the program"
    lstRatings = [] #FIXME: populate list with Fegs_Rating objects
    def __init__(self):
        sessionCreationTime = str(datetime.datetime.now())
        site = txtSiteName
        i = 0
        lstRatings = []
        for ben in lstBenDest:
            lstRatings[i] = {"timestamp":str(datetime.datetime.now()), "site":txtSiteName, \
                             "beneficiary":ben, "attributes":[], "rating":cmbRating, \
                             "explanation":txtExplanation}
            i = i + 1

class Fegs_Rating():
    "globally stores a rating's info"
    timestamp = 0 #FIXME: same as session timestamp
    site = txtSiteName
    beneficiary = "" #FIXME: grab the name from lstBenDest
    attributes = []
    explanation = ""
    rating = ""
