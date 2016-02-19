# fegs-dashboard
The fegs-dashboard provides a measure of goods and services by surveying users of the tool for qualitative data. An example of the data users are asked for is "How would you rate the water quantity in your region's rivers and streams?" One idea is to focus on using the tool to survey data at a site over time.

This data can then be used for data analysis. One example of possible analysis is finding correlations between foliage cover geodata and water abundance. For instance, when foliage in one region becomes less dense there may be water in a stream. The data prove useful to academics, administrators, and legislators.

## prototyping features in `prototype3.xlsx`
The file `prototype3.xlsx` is the pretty proof of concept. The file is to be used to interactively fill out a survey.

### `prototype3.xlsx` Usage
Users start on the EnviroClasses worksheet and enter values in the colored cell.

## TODO
- fix blanks for pivot table:
  - enter field for user to select "qualitative" or "quantitative" data to be measured in each column or even cell...
- investigate defining geographic region described by fegs-dashboard data entered by user in an accessible way
  - user-story: a user gives a central lat-long point and a radius
  - user-story: a user graphically draws a region described to the fegs-dashboard
  - user-story: a user selects regions automatically detected in satellite images
  - user-story: a user redraws part of a suggested region
- make submit button work
- make wizard show user question for a beneficiary and have the user graphically enter data, E.G.: buttons representing "Good" or "Bad" and advancing the user to the next question for that beneficiary
- make some way to let users enter new response options
- talk to Patrick about limitations of offering predefined options to users through data validation
- one could limit users to entering a predefined rating if there was a way for users to define a rating
