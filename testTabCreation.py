from tkinter import *
from tkinter.ttk import *

class Tabby(Notebook):
    def __init__(self, numTabs):
        self = Notebook(root)
        self.pack()

        self.tabs = []
        self.labels = []
        for i in range(numTabs):
            self.tabs.append(Frame(self))
            self.tabs[i].pack()
            self.labels.append(Label(self.tabs[i], text='tab '+str(i)))
            self.labels[i].pack()
            self.add(self.tabs[i], text='tab '+str(i))

root = Tk()
nb = Tabby(12)

root.mainloop()
