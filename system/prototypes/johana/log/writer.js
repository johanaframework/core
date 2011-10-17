/**
 * Log writer abstract pproto. All [Log] writers must extend this prototype.
 *
 * @package    Johana
 * @category   Logging
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaLogWriter = function() {};

/**
 * Numeric log level to string lookup table.
 * @var Object
 */
JohanaLogWriter.prototype._logLevels = {
	0: 'EMERGENCY',
	1: 'ALERT',
	2: 'CRITICAL',
	3: 'ERROR',
	4: 'WARNING',
	5: 'NOTICE',
	6: 'INFO',
	7: 'DEBUG',
	8: 'STRACE'
};

/**
 * Allows the writer to have a unique key when stored.
 *
 *     console.log(writer + '\n');
 *
 * @return  String
 */
JohanaLogWriter.prototype.toString = function()
{
	return JSON.stringify(this);
};

exports = module.exports = JohanaLogWriter; // End
