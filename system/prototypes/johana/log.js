/**
 * Message logging with observer-based log writing.
 *
 * @package    Johana
 * @category   Logging
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaLog = function()
{
};

// Log message levels
JohanaLog.EMERGENCY = 0;
JohanaLog.ALERT     = 1;
JohanaLog.CRITICAL  = 2;
JohanaLog.ERROR     = 3;
JohanaLog.WARNING   = 4;
JohanaLog.NOTICE    = 5;
JohanaLog.INFO      = 6;
JohanaLog.DEBUG     = 7;
JohanaLog.STRACE    = 8;

/**
 * @var  Log  Singleton instance container
 */
JohanaLog._instance = null;

/**
 * Get the singleton instance of this proto.
 *
 *     var log = Log.instance();
 *
 * @return  Log
 */
JohanaLog.instance = function()
{
	if (Log._instance === null)
	{
		// Create a new instance
		Log._instance = new Log();
	}

	return Log._instance;
};

/**
 * @var  Array  list of added messages
 */
JohanaLog.prototype._messages = [];

/**
 * @var  Array  list of log writers
 */
JohanaLog.prototype._writers = [];

/**
 * Attaches a log writer, and optionally limits the levels of messages that
 * will be written by the writer.
 *
 *     log.attach(writer);
 *
 * @param   Object   LogWriter instance
 * @param   mixed    array of messages levels to write OR max level to write
 * @param   integer  min level to write IF levels is not an array
 * @return  Log
 */
JohanaLog.prototype.attach = function(writer, levels, minLevel)
{
	minLevel = minLevel || 0;

	if (levels === undefined)
	{
		levels = [];
	}

	if (levels.constructor != Array)
	{
		var lev = [];
		for (var i = minLevel; i <= levels; i++)
		{
			lev.push(i);
		}
		levels = lev;
	}

	this._writers[writer.toString()] =
	{
		object: writer,
		levels: levels
	};

	return this;
};

/**
 * Detaches a log writer. The same writer object must be used.
 *
 *     log.detach(writer);
 *
 * @param   object  LogWriter instance
 * @return  Log
 */
JohanaLog.prototype.detach = function(writer)
{
	// Remove the writer
	delete this._writers[writer.toString()];

	return this;
};

/**
 * Adds a message to the log. Replacement values must be passed in to be
 * replaced using mask
 *
 *     log.add(Log.ERROR, 'Could not locate user: :user', {
 *         ':user' => username,
 *     });
 *
 * @param   String  level of message
 * @param   String  message body
 * @param   Array   values to replace in the message
 * @return  Log
 */
JohanaLog.prototype.add = function(level, message, values)
{
	if (values)
	{
		// Insert the values into the message
		for (var v in values)
		{
			message = message.replace(v, values[v]);
		}
	}

	// Create a new message and timestamp it
	this._messages.push({
		time: new Date().toString(),
		level: level,
		body: message
	});

	// Write logs as they are added
	this.write();

	return this;
};

/**
 * Write and clear all of the messages.
 *
 *     log.write();
 *
 * @return  void
 */
JohanaLog.prototype.write = function()
{
	if ( ! this._messages.length)
	{
		// There is nothing to write, move along
		return;
	}

	// Import all messages locally
	var messages = this._messages;

	// Reset the messages array
	this._messages = [];

	for (var w in this._writers)
	{
		if ( ! this._writers[w].levels.length)
		{
			// Write all of the messages
			this._writers[w].object.write(messages);
		}
		else
		{
			// Filtered messages
			var filtered = [];

			for (var m in messages)
			{
				if (this._writers[w].levels.indexOf(messages[m].level) != -1)
				{
					// Writer accepts this kind of message
					filtered.push(messages[m]);
				}
			}

			// Write the filtered messages
			this._writers[w].object.write(filtered);
		}
	}
};

module.exports = JohanaLog; // End
