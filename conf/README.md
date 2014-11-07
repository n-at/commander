commander configuration
=======================

commander server configuration:

* `host`: a host to listen. Set to **127.0.0.1** for listening to local interfaces only. 
  For listening to all interfaces set it to **0.0.0.0**
* `port`: port to listen
* `session_secret`: session cookie will be signed with this string
* `password`: web interface password
* `api_key`: key for remote calls
* `mongodb`: mongo db connection options
* `output_length_limit`: maximum length of step output (in characters)
* `unit_status_timeout`: timeout of unit status check connection

unit server configuration:

* `host`, `port`, `api_key`: same as for commander server
* `shell`: path to shell executable
* `preset_only`: disables execution of external scripts
* `request_max_length`: maximum length of request (in bytes)

Common settings:

* `log_level`: severity of messages to be put in the log. Can be _debug_, _info_, _warn_, _error_. 
  Development value is _debug_, recommended production value is _warn_.
* `log_name`: log file name
