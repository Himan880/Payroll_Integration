/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget'], function(serverWidget) {
  function beforeLoad(context) {
    if (context.type === context.UserEventType.VIEW) {
      var form = context.form;

      var customFieldId = 'custrecord_engine_number';

      var customField = form.addField({
        id: customFieldId,
        type: serverWidget.FieldType.TEXT,
        label: 'Engine Number'
      });
      
  context.form = form;
    }
  }

  return {
    beforeLoad: beforeLoad
  };
});
