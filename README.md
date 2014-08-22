#Difflow
####A Visual Regression Testing Tool using Sauce Labs

Created for __[Practice Fusion](http://www.practicefusion.com/)__

---
##Prep:

- ####[Download GraphicsMagick](http://www.graphicsmagick.org/)
- ####[Download MongoDB](http://www.mongodb.org/downloads)
- ####[Register for a Sauce Labs Account](http://saucelabs.com)
- ####Ensure User Limit above 256.
If on a Mac or Linux system use `ulimit -n 1024` to set to 1024 synchronous read files.

####Configurations
1. Open the `difflow/config/config.js` file and change the *development* keys for `sauceAuth` to your username and access key from Sauce Labs.
2. Change your `equalityThreshold` to a value of your choosing. *This number is a decimal, not a percent. Must be <1.*

####Compile
Move into the difflow folder and run the command `grunt` from the console to start the application

####MongoDB
Start the database with `mongod`. See [Getting Started](http://docs.mongodb.org/manual/tutorial/getting-started/) for reference.

####Start Difflow Server
Open or refresh the url or whatever port you are using `localhost:3000/server/start` to start the process of the server. **Do not refresh multiple times.** Check your console to ensure it is running.

####Sauce Labs
Run automated tests on Sauce Labs. In order to see diffed images, must have at least 2 runs of the same test
######_Take Note_
- Difflow cannot differentiate between environments
- Will not work with most manual testing
---

##GUI
####Test Index
- Navigate to`localhost:3000`
- Clicking on one of the tests will lead to difftool
- Uploading two photos in the upload tool will create ad hoc  job that will not be saved into MongoDB. *__Images must be same height and width.__*

####Difftool
- Side-by-side comparison of test image, baseline, and diff image
- Clicking __Set as New Baseline__ button will make test image new baseline for future tests

---

##Codebase
###Models:
####Screenshot
One instance of an image.

####Timeline
Collection of Screenshots for one test, one configuration, and one step within the test.

####SauceJob
One instance of a test run on sauce.

####DiffJob
One completed diff image, its equality, and its corresponponding baseline and testImage.



