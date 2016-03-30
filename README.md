# fegs-dashboard
## SYNOPSIS
open `fegs-dashboard.xlsm` and follow the instructions to save formatted ratings of all selected attributes in a line per selected beneficiary.
## DATA
Data is stored in the following schema, denoted in the syntax of <requirements> and [options]:
```<site> <site> <timestamp> <beneficiary> <rating> <explanation> <attribute1> [attribute2…attributeN]```

## EXAMPLE
The fegs-dashboard provides a measure of goods and services by questioning users of the tool for qualitative data. An example of the data users are asked for is "How would you rate the water quantity in your region's rivers and streams?" One idea is to focus on using the tool to collect data at a site over time.

This data can then be used for data analysis. One example of possible analysis is finding correlations between foliage cover geodata and groundwater abundance. For instance, when foliage in one region becomes less dense there may be water in a stream. The data prove useful to academics, administrators, and legislators.

Another possible user-story is a community might have a workstation available for public use. Citizens can use this workstation to submit ratings of attributes with comments as each pertinent beneficiary. The community may review the submitted ratings when making policy-decisions. 

## TODO
- code export button to export to either xml or a more robustly delimited csv

## FEATURES TO CONSIDER
- investigate defining geographic region described by fegs-dashboard data entered by user in an accessible way
  - user-story: a user gives a central lat-long point and a radius
  - user-story: a user graphically draws a region described to the fegs-dashboard
  - user-story: a user selects regions automatically detected in satellite images
  - user-story: a user redraws part of a suggested region

