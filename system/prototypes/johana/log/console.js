/**
 * Console log writer. Writes out messages to console
 *
 * @package    Johana
 * @category   Logging
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaLogFile = function()
{
	LogWriter.call(this);
};

// Inherits
require('util').inherits(JohanaLogFile, LogWriter);

/**
 * Writes each of the messages to console
 *
 *     writer.write(messages);
 *
 * @param   Array   messages
 * @return  void
 */
JohanaLogFile.prototype.write = function(messages)
{
	for (var m in messages)
	{
		var line = messages[m].time + ' --- ' + this._logLevels[messages[m].level] + ': ' + messages[m].body;
		console.log(line);
	}
};

exports = module.exports = JohanaLogFile; // End
