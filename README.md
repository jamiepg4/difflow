#Difflow

Created by Zach Hawtof

[TOC]

##Server:

The Server side API of Difflow app.


Things to make sure:
raise your ulimit to 1024. Originally at 256
download GraphicsMagick without getting a Trojan.
sometimes python is necessary
can't differentiate between environments
MongoDB downloaded


###Features:

####SauceLabs
- Get list of jobs
- Download assets per job
####UI
- Receive requests for DiffJob from UI
- Send updates after each new Job is properly stored and recorded
- Receive images uploaded directly through UI
####Mongo
- Read and Write to MongoDB
####AWS
- Store photos on AWS servers
####Redis?
- Continually running with queue for jobs to be pulled and diffed

###Models:
####Screenshot
- Knows if Baseline
- Has Path to Image
####Timeline
- Ref to `Baseline` (Screenshot) and to `Screenshots` ([Screenshots])
- Knows Configuration Data
####SauceJob
- All Info from Sauce Labs API call
- Knows Configuration Data
####DiffJob
- Points to DiffImage
- Ref to `Baseline` (Screenshot) and `TestImage` (Screenshot)

##UI:

The Frontend side API of Difflow app.


