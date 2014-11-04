commander
=========

Useful tool for remote systems administration. It allows to run shell scripts on multiple remote hosts.

commander consists of two parts: 

* commander server: interface to interact with units and remotely run tasks.
* unit server: receives tasks from commander. 

##Installation

First, you need [nodejs](http://nodejs.org) and npm.

Second, for commander server installation you need [bower](http://bower.io).

Commander server requires [mongodb](http://mongodb.org). Unit server has no additional dependencies.

To install dependencies, run in shell:

    npm install
    bower install #only for commander server
    
Edit configuration in `conf/config.json`. Don't forget to change passwords and API keys :)

##Usage

Start commander server: `node commander-ctl start`
 
Start commander unit: `node unit-ctl start`
