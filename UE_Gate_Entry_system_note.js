/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/runtime'], function(record, serverWidget, runtime) {
	function beforeLoad(context) 
	{
		var form = context.form;
		var objRec = context.newRecord;
		form.clientScriptModulePath = 'SuiteScripts/CS_ITEM_RECEIPT_CLICK_BUTTON.js';
		// log.debug('objRec',objRec);
		var userObj = runtime.getCurrentUser();
		var userName = userObj.name;
		var currentDate = sysDate(); // returns the date
		var currentTime = timestamp(); // returns the time stamp in HH:MM:SS
		var currentDateAndTime = currentDate + ' ' + currentTime;
		var sublistCount = objRec.getLineCount({
			sublistId: 'recmachcustrecord_system_notes_linkup'
		});
		log.debug('sublistCount', sublistCount);
		if (context.type == "create")
		{
			log.debug('context.type', context.type);
			objRec.setSublistValue({
				sublistId: 'recmachcustrecord_system_notes_linkup',
				fieldId: 'custrecord_name',
				line: sublistCount,
				value: userName
			});
			objRec.setSublistValue({
				sublistId: 'recmachcustrecord_system_notes_linkup',
				fieldId: 'custrecord_time',
				line: sublistCount,
				value: currentDateAndTime
			});
			objRec.setSublistValue({
				sublistId: 'recmachcustrecord_system_notes_linkup',
				fieldId: 'custrecord_mode',
				line: sublistCount,
				value: context.type
			});
			log.audit('under if condition');
		}

		if (context.type == "view")
		{
			log.debug('START', '');

			var contextForm = context.form;
			// var functionName;
			var urls = "https://6810795-sb1.app.netsuite.com/app/accounting/transactions/itemrcpt.nl?e=T&memdoc=0&whence=&transform=purchord&id=1195";

			contextForm.addButton({
				id: 'custpage_itemreceipt',
				label: 'ITEM RECEIPT',
				functionName: 'window.open("' + urls + '");'
			});
			log.debug('urls', urls);
		}
		if (context.type == "edit")
		{
			var recId = context.newRecord.id;
			log.audit('recId', recId);
			var recLoad = record.load({
				type: 'customrecord_gate_pass_record',
				id: recId,
				isDynamic: true
			});
			var lineNum = recLoad.selectNewLine({
				sublistId: 'recmachcustrecord_system_notes_linkup'
			});
			recLoad.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_system_notes_linkup',
				fieldId: 'custrecord_name',
				value: userName
			});
			recLoad.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_system_notes_linkup',
				fieldId: 'custrecord_time',
				value: currentDateAndTime
			});
			recLoad.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_system_notes_linkup',
				fieldId: 'custrecord_mode',
				value: context.type
			});
			recLoad.commitLine({
				sublistId: 'recmachcustrecord_system_notes_linkup'
			});
			var recId = recLoad.save();
			log.debug('recId', recId);
		}
	}

	function sysDate() {
		var date = new Date();
		var tdate = date.getDate();
		var month = date.getMonth() + 1; // jan = 0
		var year = date.getFullYear();
		return currentDate = month + '/' + tdate + '/' + year;
	}

	function timestamp() {
		var str = "";

		var currentTime = new Date();
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		var seconds = currentTime.getSeconds();
		var meridian = "";
		if (hours > 12) {
			meridian += "pm";
		} else {
			meridian += "am";
		}
		if (hours > 12) {

			hours = hours - 12;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		str += hours + ":" + minutes + ":" + seconds + " ";

		return str + meridian;
	}
	return {
		beforeLoad: beforeLoad
	}
});