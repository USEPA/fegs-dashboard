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
