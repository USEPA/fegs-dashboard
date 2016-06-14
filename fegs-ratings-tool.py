from tkinter import *
from tkinter.ttk import *

root = Tk()

master = Frame(root, name='master')
master.pack(fill=BOTH)

root.title('FEGS Rating Tool')
root.protocol("WM_DELETE_WINDOW", master.quit)

nbMain = Notebook(master, name='nbMain')
nbMain.pack(fill=BOTH, padx=2, pady=3)

chooseBens = Frame(nbMain, name='chooseBens')
chooseBens.pack(fill=BOTH)
nbMain.add(chooseBens, text="Choose Beneficiaries")

txtBenInstructions = Label(chooseBens, text="Build a list of beneficiaries interested in the site. Here, a beneficiary is a role as which a person uses or appreciates the site.")
txtBenInstructions.grid(row=0, column=0, columnspan=3)

lbBenSrc = Listbox(chooseBens, height=12)
lbBenSrc.grid(row=1, column=0, rowspan=3)

btnBenAdd = Button(chooseBens, text=">> Add >>")
btnBenAdd.grid(row=1, column=1)

btnBenRm = Button(chooseBens, text="<< Remove <<")
btnBenRm.grid(row=3, column=1)

lbBenDest = Listbox(chooseBens, height=16)
lbBenDest.grid(row=1, column=3, rowspan=3)

btnNext = Button(chooseBens, text="Next")
btnNext.grid(row=4, column=2)

root.mainloop()
