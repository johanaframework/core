/**
 * File log writer. Writes out messages and stores them in a YYYY/MM directory.
 *
 * @package    Johana
 * @category   Logging
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaLogFile = function(directory)
{
	LogWriter.call(this);

	try
	{
		// Check if cache dir is writable
		require('fs').chmodSync(directory, 0755);
	}
	catch (e)
	{
		throw new Error('Directory ' + directory + ' must be writable');
	}

	// Determine the directory path
	this._directory = require('fs').realpathSync(directory) + '/';
};

// Inherits
require('util').inherits(JohanaLogFile, LogWriter);

/**
 * @var  String  Directory to place log files in
 */
JohanaLogFile.prototype._directory;

/**
 * Writes each of the messages into the log file. The log file will be
 * appended to the `YYYY/MM/DD.log` file, where YYYY is the current
 * year, MM is the current month, and DD is the current day.
 *
 *     writer.write(messages);
 *
 * @param   Array   messages
 * @return  void
 */
JohanaLogFile.prototype.write = function(messages)
{
	// Set the yearly directory name
	var directory = this._directory + new Date().getFullYear();

	if ( ! require('path').existsSync(directory))
	{
		require('fs').mkdirSync(directory, 02777);
	}

	// Add the month to the directory
	var month = new Date().getMonth();

	if (month < 10)
	{
		month = '0' + month;
	}

	directory += '/' + month;

	if ( ! require('path').existsSync(directory))
	{
		// Create the monthly directory
		require('fs').mkdirSync(directory, 02777);
	}

	// Set the name of the log file
	var date = new Date().getDate();

	if (date < 10)
	{
		date = '0' + date;
	}

	var filename = directory + '/' + date + '.log';

	var file = require('fs').openSync(filename, 'a');

	for (var m in messages)
	{
		// Write each message into the log file
		// Format: time --- level: body
		var line = '\n' + messages[m].time + ' --- ' + this._logLevels[messages[m].level] + ': ' + messages[m].body;
		require('fs').writeSync(file, line);
	}
};

exports = module.exports = JohanaLogFile; // End
