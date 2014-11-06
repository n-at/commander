commander
=========

Useful tool for remote systems administration. It allows to run shell scripts on multiple remote hosts in parallel.

commander consists of two parts: 

* commander server: web-interface to interact with units and run tasks.
* unit server: receives tasks from commander. 

##Installation

First, you need [nodejs](http://nodejs.org) and npm.

Second, for commander server installation you need [bower](http://bower.io).

Commander server requires [mongodb](http://mongodb.org). Unit server has no additional dependencies.

To install npm dependencies, run in shell: `npm install` (both for commander and unit). 

Commander server has additional bower dependencies which should be installed with: `bower install`.

Edit configuration in `conf/config.json`. Options are described in `conf/README.md`. Don't forget to 
change passwords and API keys :)

##Usage

###commander server

Start commander server: `node commander-ctl start`
 
After start commander server web interface will be available at `http://host:port` as it set in configuration.

First you need to add units. To to this, click "Units" in menu, then "Add unit" button and fill the form fields.

To create a new task, click "Tasks" in menu and then "New task" button. In the form you should add units which will
run this task and set task steps. Step can be one of the following:

* _script_: run a shell script, stored in task
* _preset_: run a script, stored in _preset_ directory of unit server

_Break on error_ option tells unit to stop task execution when step fails (non-zero return code or shell cannot start).

###unit server

Start commander unit: `node unit-ctl start`. No additional actions required. 

##License

Copyright (c) 2014, Alexey Nurgaliev
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the 
following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following 
   disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the 
   following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote 
   products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, 
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
