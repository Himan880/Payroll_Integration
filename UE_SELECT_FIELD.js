/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/record'], function(record) {

  function beforeLoad(context) {
    if (context.type === context.UserEventType.VIEW) {
      var newRecord = context.newRecord;
      var levelField = newRecord.getField{
        fieldId: 'custentitycinntra_level1' 
      });
   log.debug('levelField',levelField);
      levelField.updateDisplayType({
          displayType:FieldDisplayType.HIDDEN
        });
		log.debug('levelField1',levelField1);
		 return true;
      }
    }
	return false;
  }

  return {
    beforeLoad: beforeLoad
  };

});