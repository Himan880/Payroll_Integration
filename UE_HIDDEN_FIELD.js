/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/record'], function(record) {

  function beforeLoad(context) {
    if (context.type === context.UserEventType.VIEW) {
      var newRecord = context.newRecord;
      var levelField = newRecord.getValue({
        fieldId: 'custentitycinntra_level1' 
      });

      if (levelField) {
      levelField.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN
        });
		 return true;
      }
    }
  }

  return {
    beforeLoad: beforeLoad
  };

});