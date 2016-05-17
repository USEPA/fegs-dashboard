# TODO:
- bug: lstAttrsSrc, the top attribute listbox, did not initialize with a scrollbar in the meeting
  - try: run listbox-fixer-code on worksheet load

- feature: nonuniform random data generation

- feature: export function exports data in xml format

- feature: videos covering the following points
  1. enter data
    - roadmap
    - instructions
    - sitename
    - add known bens to list of beneficiaries at site
    - add new beneficiaries
    - select ben to rate
    - add known attributes
    - add new attribute
    - consider prompted beneficiary and listed attributes
    - rate attributes as the beneficiary
    - explain rating
    - sulbmit data to data worksheet
    - rate the site as the next beneficiary
    - clear data from the dash-worksheet
  1. show data worksheet
    - begin exactly where data-entry-video left off
    - each rating gets a row for each attribute chosen
    - each field gets a column
    - delete data for a beneficiary
  1. analyze data
    - anlyze button
    - interpretation of default layout
    - field list
    - show values as
    - rearrange fields
    - example considerations which motivate table-and visualization-layout
      - drill down into data in default layout
      - open new pivottable by activating a value-cell
      - 

## Features to Explore
- tabbed/paged format instead of scrolling through a worksheet

- multiple rows and columns of natural features in data-entry

- description of fegs terminology

- tabbed/paged format instead of scrolling through a worksheet

## Misc. Ideas
- terminology of "uses" or "roles"

- don't overcrowd by showing bens and their respective attrs all at once

## Feature to Add ASAP
- tree view in lists of fegs**

# DONE:
- convert add/remove to pill-buttons instead of arrow-buttons**

- spread layout horizontally**

- attibutes before infrastructure in ordering of data-entry-take out infrastructure completely**

- move process-synopsis to a documentation file and flesh out the documentation using this as an outline

- bug: err msg on submit

- place dash buttons on bottom, stacked vertically with order "submit," "next ben," then "clear data on this worksheet(but keep submitted data)," then "export"

- bug: add ben btn not adding ben to cmbSelectBen

- feature: navigate to the top of the dash worksheet on open workbook (fegs-dashboard.xlsm)

- feature: btnNextBen_Click takes the user back to cmbSelectBen

- feature: step 5, rating, indicates which beneficiary and attributes are being rated

- feature: analyze data button writes pivot cache then shows tables, charts, and field list

- feature: display list of attributes in step 5

- bug: btnAddAttr broken

- bug: cmbRating only lists 'good'

- feature: whether infrastructure and access affect rating between cmbRating and txtExpln

- feature: pivot table automatically shows values as percentages

- feature: no fractional values on pivot chart

