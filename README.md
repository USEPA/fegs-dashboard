# fegs-dashboard
## SYNOPSIS
open `fegs-dashboard.xlsm` and follow the instructions to save formatted ratings of all selected attributes in a line per selected beneficiary.
## DATA
Data is stored in the following schema, denoted in the syntax of <requirements> and [options]:
```<site> <site> <timestamp> <beneficiary> <rating> <explanation> <attribute1> [attribute2…attributeN]```

## EXAMPLE
The fegs-dashboard provides a measure of goods and services by questioning users of the tool for qualitative data. An example of the data users are asked for is "How would you rate the water quantity in your region's rivers and streams?" One idea for usage is to focus on using the tool to collect data at a site over time.

This data can then be used for data analysis. One example of possible analysis is finding correlations between foliage cover geodata and groundwater abundance. For instance, when foliage in one region becomes less dense there may be less water in a stream. The data prove useful to academics, administrators, and legislators.

Another possible user-story is a community that has a workstation available for public use. Citizens can use this workstation to submit ratings of attributes with comments as each pertinent beneficiary. The community could hence review the submitted ratings when making policy-decisions. 
