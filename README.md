# fegs-dashboard
The fegs-dashboard provides a measure of goods and services by questioning users of the tool for qualitative data. An example of the data users are asked for is "How would you rate the water quantity in your region's rivers and streams?" One idea is to focus on using the tool to collect data at a site over time.

This data can then be used for data analysis. One example of possible analysis is finding correlations between foliage cover geodata and groundwater abundance. For instance, when foliage in one region becomes less dense there may be water in a stream. The data prove useful to academics, administrators, and legislators.


## prototyping features in `prototype4.xlsm`
The file `prototype4.xlsm` is a prototype that serves as a pretty proof of concept. The file is to be used to interactively fill out a set of ratings.

### `prototype4.xlsm` Usage
Users can enter data into the Ratings spreadsheet directly. A wizard with userforms is being built to walk users through data entry.
Future features:
- feature: user can add dropdown items then automatically alphabetize the source list
- feature: save a snapshot of the worksheet named Ratings to a worksheet whose name=date
- feature: create a wizard which steps users through data entry

---
## Development Notes

### 2016.03.03 walkthrough of tool with Kirsten using example use-cases:
1. first users of tool possible type in all beneficiaries explicitly if no preliminary list is found
1. user defines each beneficiary as belonging to a specific beneficiary-category from the fegs-cs
  - user can define a new beneficiary-category
1. user enters a qualitative measure of each beneficiary's satisfaction(beneficiary-satisfaction) for each attribute
1. tool provides a predicted set of attributes which are valued by a beneficiary
  - from predicted list of attributes, user can add or remove items
  - frst users may have to type in attributes which each beneficiary values
1. tool assign or allows assignment of each beneficiary to a set of environmental subclasses
1. data from users can be analyzed to show correlation(IE tradeoff, no effect, synergy) between attributes
1. tool reports an average of beneficiary-satisfaction
1. tool reports lowest scoring attributes and which beneficiaries are affected
1. tool asks which beneficiaries need the most attention

- getting input from users might qualify as "quality improvement" rather than as a "survey"

## TODO
- feature: user can add dropdown items then automatically alphabetize the source list
- feature: save a snapshot of the worksheet named Ratings to a worksheet whose name=date
- feature: create a wizard which steps users through data entry
- enter field for user to select "qualitative" or "quantitative" data to be measured in each column or even cell...
- investigate defining geographic region described by fegs-dashboard data entered by user in an accessible way
  - user-story: a user gives a central lat-long point and a radius
  - user-story: a user graphically draws a region described to the fegs-dashboard
  - user-story: a user selects regions automatically detected in satellite images
  - user-story: a user redraws part of a suggested region
- make submit button work
- make wizard show user question for a beneficiary and have the user graphically enter data, E.G.:
  - buttons representing "Good" or "Bad" and advancing the user to the next question for that beneficiary
