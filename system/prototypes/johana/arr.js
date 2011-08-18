/**
 * Array and Object helper.
 *
 * @package    Johana
 * @category   Helpers
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaArr = function()
{
};

/**
 * Merges 2 objects
 *
 * @param   Object  initial object
 * @param   Object  object to merge
 * @return  Object
 */
JohanaArr.merge = function(destination, source){
   for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
   return destination;
};

module.exports = JohanaArr; // End
