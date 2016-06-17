# fegs-rating-tool: rate attributes (natural features)
# for different classes of beneficiaries
from tkinter import *
from tkinter.ttk import *

# parametr's
lbHeight = 16
lbWidth = 64

root = Tk()

master = Frame(root, name='master')
master.pack(fill=BOTH)

root.title('FEGS Rating Tool')
root.protocol("WM_DELETE_WINDOW", master.quit)

nbMain = Notebook(master, name='nbMain')
nbMain.pack(fill=BOTH, padx=2, pady=3)

###########################
# tab for naming the site #
###########################
frameSiteName = Frame(nbMain, name='frameSiteName')
frameSiteName.pack(fill=BOTH)
nbMain.add(frameSiteName, text="Name the site")

lblSiteInstructions = Label(frameSiteName, text="Type the name of the site below.")
lblSiteInstructions.grid(row=0)

txtSiteName = Entry(frameSiteName, text="Type the site name here.", width=lbWidth)
txtSiteName.grid(row=1)

btnChooseBens = Button(frameSiteName, text="Move on to choose beneficiaries of the site.")
btnChooseBens.grid(row=2)

##############################################
# tab for choosing beneficiaries of the site #
##############################################
frameChooseBens = Frame(nbMain, name='frameChooseBens')
frameChooseBens.pack(fill=BOTH)
nbMain.add(frameChooseBens, text="Choose Beneficiaries")

txtBenInstructions = Label(frameChooseBens, text="Build a list of beneficiaries interested in the site. Here, a beneficiary is a role as which a person uses or appreciates the site.")
txtBenInstructions.grid(row=0, column=0, columnspan=6)

lbBenSrc = Listbox(frameChooseBens)
lbBenSrc.grid(row=1, column=0, rowspan=3)
for ben in open("parameters/beneficiaries.txt","r"):
    lbBenSrc.insert(END, ben)

sbBenSrc = Scrollbar(frameChooseBens)
sbBenSrc.grid(row=1, column=1)
lbBenSrc.config(yscroll=sbBenSrc.set)
sbBenSrc.config(command=lbBenSrc.yview)

btnBenAdd = Button(frameChooseBens, text=">> Add >>")
btnBenAdd.grid(row=1, column=1, columnspan=2)

btnBenRm = Button(frameChooseBens, text="<< Remove <<")
btnBenRm.grid(row=3, column=1, columnspan=2)

txtNewBen = Entry(frameChooseBens, text="Don't see a beneficiary? Type it here and click >>")
txtNewBen.grid(row=2, column=1) 

btnNewBen = Button(frameChooseBens, text=">>")
btnNewBen.grid(row=2, column=2)

lbBenDest = Listbox(frameChooseBens, height=lbHeight, width=lbWidth)
lbBenDest.grid(row=1, column=3, rowspan=3)

btnProcessBens = Button(frameChooseBens, text="Process Beneficiaries")
btnProcessBens.grid(row=4, column=1, columnspan=2)

#################################################
# tab for adding attributes to each beneficiary #
#################################################
frameProcessBens = Frame(nbMain, name='frameProcessBens')
frameProcessBens.pack(fill=BOTH)
nbMain.add(frameProcessBens, text="Process Beneficiaries")

lblAttrsInstructions = Label(frameProcessBens, text="Create a list of attributes that affects each beneficiary's rating of the site.")
lblAttrsInstructions.grid(row=0, column=0, columnspan=4)

# source list of attributes
lbAttrSrc = Listbox(frameProcessBens, height=lbHeight, width=lbWidth)
lbAttrSrc.grid(row=1, column=0, rowspan=3)
# populate the attributes users select from
for attr in open("parameters/attributes.txt", "r"):
    lbAttrSrc.insert(END, attr)

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
lbAttrDest = Listbox(frameProcessBens, height=lbHeight, width=lbWidth)
lbAttrDest.grid(row=1, column=3, rowspan=3)
# populate the attributes users select from
for attr in open("parameters/attributes.txt", "r"):
    lbBenSrc.insert(END, attr)

btnRate = Button(frameProcessBens, text="Rate the site for the beneficiaries.")
btnRate.grid(row=9, column=1, columnspan=2)

#########################
# tab to submit ratings #
#########################
frameSubmit = Frame(nbMain, name="frameSubmit")
frameSubmit.pack(fill=BOTH)
nbMain.add(frameSubmit, text="Submit Ratings")

lblSubmitInstructions = Label(frameSubmit, text="Once all data is entered, submit the data to a file for later use.")
lblSubmitInstructions.grid(row=0, column=0)

btnSubmit = Button(frameSubmit, text="Submit")
btnSubmit.grid(row=1, column=0)

# don't put any code which should run before the GUI closes after mainloop
root.mainloop()
