'''roll the project into an executable in ./dist/
./build/ may be deleted anytime 
USAGE $ python <filename> py2exe
<filename> is the file to make an executable from'''

from distutils.core import setup
import py2exe
from glob import glob
import os

#build list data_files to include
data_files = [("Microsoft.VC90.CRT",
    glob(r'C:\Program Files\Microsoft Visual Studio 9.0\VC\redist\x86\Microsoft.VC90.CRT\*.*'))]
#copy parameters folder and its contents
for files in os.listdir('./parameters'):
    f1 = 'parameters/' + files
    if os.path.isfile(f1): # skip directories
        f2 = 'parameters', [f1]
        data_files.append(f2)

setup(windows=['fegs_ratings_tool.py'], data_files=data_files)
