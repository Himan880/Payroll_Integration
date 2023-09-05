/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
*/
define(['N/error','N/currentRecord','N/search'], function(error,currentRecord,search) {
   	function pageInit(context) {
        var currentRecord = context.currentRecord;
        var hiddenLevel = currentRecord.getField({
            fieldId: 'custentitycinntra_level1'
        });.isDisplay = false;
		 alert('pageInit trigger' + hiddenLevel);
       hiddenLevel.isHidden = true;
	   log.debug('hiddenLevel',hiddenLevel);
	}
	
	 // function fieldChanged(context) {
		  // var currentRecord = context.currentRecord;
		// var fieldName = context.fieldId;
			// var objRecord = record.load({
			// type: 'custentity1',
			// id: '1'
			// isDynamic: true
		// });
        // if (fieldName === 'custentity1'){
		// var objRecord = record.getValue({
			// fieldId : "1"
		// })

		return {
				pageInit : pageInit
				//fieldChanged : fieldChanged
			}
		}); 

        