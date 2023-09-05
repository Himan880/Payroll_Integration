/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
*/
define(['N/currentRecord','N/search'], function(currentRecord,search) {
   	function pageInit(context) {
        var currentRecord = context.currentRecord;
        var hiddenLevel = currentRecord.getField({
            fieldId: 'custentitycinntra_level1'
        }).isDisplay = false;
		 alert('pageInit trigger' + hiddenLevel);
       hiddenLevel.isHidden = true;
	   log.debug('hiddenLevel',hiddenLevel);
	}
	
	 function fieldChanged(context) {
		  var currentRecord = context.currentRecord;
		var fieldName = context.fieldId;
		if (fieldName === 'custentity1'){
			var sector = currentRecord.setValue({
			fieldId : 'custentity1'
		});
		log.debug('sector',sector)
			var objRecord = record.load({
			type: 'entitycustomfield',
			id: '1'
		}); 
		if(sector == 2){
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Alternative/traditional medicine (Ayurveda, etc.)'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'communicable diseases'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Non-Communicable diseases'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Other Healthcare Stakeholders'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Point of Care'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'System Strengthening'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'RMNCH+A'
		});
			currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Knowledge Attitudes and Practices'
		});
		if(sector == 3){
			currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Pre-school + School Level Education'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Special Learning Areas'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Teachers & Pedagogy'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'School Infrastructure'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Higher Education'
		});
		currentRecord.setValue({
			fieldId : 'selectrecordtype',
			value : 'Ed-tech'
		});
		}
		objRecord.save();
		}
	 }
		return {
				pageInit : pageInit,
				fieldChanged : fieldChanged
			}
	 }
		}); 

        