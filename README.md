# JIC8202
Visualization front-end for the Time Machine Space Dinosaur Science Experiment.

## Team members

Mason Buchanan | 770-634-9034 | sbuchanan8@gatech.edu

Andrew Chang | 919-780-3457 | achang66@gatech.edu

Bret Davis | 770-313-9043 | bdavis300@gatech.edu

Kyle Hosford | 770-596-0462 | khosford3@gatech.edu

some members omitted for privacy

## Release Notes
### New Features since last sprint
* Database administration (i.e. node and link removal interface)
* Backend API for Data Manipulation
* Incoming/Outgoing links have different colours
* Ratio of incoming to outgoing links in sidebar

### Bug Fixes
* some wording issues
* sidebar panes now equal height in Chrome
* CSV export now escapes commas
* faster loading time

### Known bugs
* website is slow for user interaction --- not much we can do about that, there's too much data
* scroll bar for the sidebar disappears for some operating systems
* no functionality for authentication for data manipulation yet

## Development Guide
### Setting up
* First, make sure you have `node.js` installed. You can [find instructions here](https://nodejs.org/en/download/). You can check if you actually have it installed if the command `npm -v` returns the current version of the installed `node.js`
* Now you can now clone the repository. You can do this by typing `git clone https://github.com/JIC8202/jic8202.github.io.git JIC8202` into your terminal. 
* After cloning the repo, enter the directory by typing `cd JIC8202`. 
* Then, branch to the development branch by typing `git checkout d3`. This is because the d3 branch contains the source code for the project while the master branch contains the compiled code. Then, run:
```
npm install
```
This will install the required packages for you.

### Starting a development server
All you have to do is type the following into your terminal:
```
npm run start
```
A webpack development server will be started at http://localhost:8080/. The server will watch for changes to the source files and reload automatically.

### Compiling static bundle
To compile a static bundle, type the following into the terminal:
```
npm run build
```
A `dist` folder will be created containing the compiled site. The compiled files will be used for the master branch to actually be shown online. If you want to take your changes online, you will need to push these files to the master branch. This is done by first copying everything in the `dist` folder (you can optionally paste it somewhere else for safekeeping). Then, you checkout to the master branch by typing `git checkout master` into the terminal (make sure you push any changes to the d3 branch first). Then, paste the newly compiled files into the `JIC8202` folder to replace the current ones. Finally, push the updated files to the master branch by first committing, and then typing `git push origin master`. 
