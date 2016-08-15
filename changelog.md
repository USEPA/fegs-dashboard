# Changelog with new items appended to end, eg $ echo -e "\n- blah" >> changelog.md
- convert add/remove to pill-buttons instead of arrow-buttons**

- spread layout horizontally**

- attibutes before infrastructure in ordering of data-entry-take out infrastructure completely**

- move process-synopsis to a documentation file and flesh out the documentation using this as an outline

- bug: err msg on submit

- place dash buttons on bottom, stacked vertically with order "submit," "next ben," then "clear data on this worksheet(but keep submitted data)," then "export"

- bug: add ben btn not adding ben to cmbSelectBen

- feature: navigate to the top of the dash worksheet on open workbook (fegs-dashboard.xlsm)

- feature: btnNextBen_Click takes the user back to cmbSelectBen

- bug: lstAttrsSrc, the top attribute listbox, did not initialize with a scrollbar in the meeting
  - try: run listbox-fixer-code on worksheet load

- feature: step 5, rating, indicates which beneficiary and attributes are being rated

- feature: analyze data button writes pivot cache then shows tables, charts, and field list

- feature: display list of attributes in step 5

- bug: btnAddAttr broken

- bug: cmbRating only lists 'good'

- feature: whether infrastructure and access affect rating between cmbRating and txtExpln

- feature: pivot table automatically shows values as percentages

- feature: no fractional values on pivot chart

- remove instructions from step one

- put add and remove between beneficiary listboxes and attribute listboxes

- change label of buttons to "new" where buttons add new beneficiary or attribute 

- delete colored sections' bg

- thicken colored border for each nembered step

- embolden the word natural in instructions for step 3

- cbInfrastructure.text = "Did infrastructure affect the rating?"

- remove lstInfrastructureListBuilder and its dependent code

- enlarge instructions' text

- 2016.05.24at14:55 reword and move textboxes and buttons for adding new bens/attrs under source lists 

- 2016.05.24at17:14 reword instructions and visual edits 

- fix button labeled "rate as next beneficiary"

- create a written user's manual

- strTxtRatingDefaultText = "Explain this rating."

- 2016.05.26at20:21 change beneficiary: "Cafo Operator"|->"Concentrated Animal Feeding Operation Operator" 

- 2016.05.26at20:25 reposition buttons and text-fields for adding new attrs and bens to increase visibility 

- 2016.05.27at08:31 make-instructions-uniformly-large-and-prominent 

- check data-entries for more than about 250 chars (throws "type mismatch" if "analyze data"-button is used)

## ======== tool changed to python =============

- FEATURE: add and remove buttons' functionality

- FEATURE: new buttons' functionality

- FEATURE: rating combobox

- FEATURE: explanation text-field

- FEATURE: add tabbed bens interface

- TODO let users add attrs to beneficiaries

  - Solution: lambda:callbackFncn(i) -> lambda i=i:callbackFncn(i)

- nbBens |-> nbRatings

- TODO prevent 2nd click of btnProcessBens from creating second set of tabs

- TODO implement saveRatings()

- TODO change order of ratings to Good, Fair, then Poor in descending order

- TODO display description widget for the currently active beneficiary in lbBenSrc or lbBenDest

- TODO read beneficiaries' descriptions from parameters/beneficiaries.csv

- TODO display description widget for the currently active attribute in lbAttrSrc or lbAttrDest

- TODO read attributes' descriptions from parameters/attributes.csv

- TODO feedback on save

- TODO save dialog

- TODO update language to match fegs-dashboard.xlsm

- TODO error when focus leaves txtExpln

- TODO fix error in save

- TODO output tabular review of ratings on view frameSave

- TODO load saved session

- TODO fix error in session.load() and dependencies

- TODO give saveasfilename() dialog for save session

- TODO give openfilename() dialog for load session

- TODO add 'rate the site for the next beneficiary' button on frameProcessBens

- TODO remove addition of incorrect newlines if present in csv-parameter-generation-script

- TODO put description box in the first page of the tool

- change instructions to text widgets; update instructions' text

- add beninfo text widget

- TODO change lblattrdescript into txtattrdescript

- TODO activation of a ben or attr clears description first

- TODO implement attribute description in text-box

- TODO grid beninfo sticky ew to horizontally fill its cells

- TODO change lblBenDescript into txtBenDescript

- TODO label "add beneficiary"

- TODO label "add attribute"

- TODO Edit explanation page 1 (add word "for"  before "each type of beneficiary" ...my typo...)

- fix ugly, old-style interface: `from tkinter.ttk import *` after last import from tkinter

- add prompt for explanation of rating

- make description of beneficiaries scrollable

- make description of attributes scrollable
