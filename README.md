# Beneficiaries' Attribute-Review-Tool(BART)
## SYNOPSIS
Use this GUI-driven tool to rate an arbitrarily user-defined site's attributes per class of beneficiary. The provided lists of beneficiaries and attributes are based on definitions from the Final Ecosystem Goods and Services-Classification-System(FEGS-CS).

### Use python to run the tool as `bart.py`.
Use the following command within the directory containing `bart.py` on Windows, OSX, or Linux:
`python fegs_ratings_tool.py`. The tool is written in python 3.

### Use python to build the tool as an executable named `bart.exe`.
Use setup.py to create, use, and distribute a standalone executable named `bart.exe` within the automatically created `./dist/` directory. The machine that builds the executable needs Windows, python, and py2exe. Development of the tool used 
  - `Windows 7 Enterprise Service Pack 1`,
  - `python 3.4.3` with `tkinter 8.6`, and 
  - `py2exe 0.9.2.2`.

## Data
Ratings can be saved as `.csv` files. Theses files can be created and edited with a spreadsheet application such as Excel or Calc.

## Sharepoint Site
Additional information about the tool can be found on a 
[Sharepoint-site.](https://usepa.sharepoint.com/sites/ORD_Work/Dash/_layouts/15/start.aspx#/)

## Electron App Installation
**Note**: Running this requires [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/en/) (which includes npm) on your system.
### Clone the repository
`$ git clone -b fegs-electron https://github.com/USEPA/fegs-dashboard`
### Go into the repository
`$ cd fegs-dashboard`
### Install dependencies
`$ npm install`
### Run the app
`$ npm start`
