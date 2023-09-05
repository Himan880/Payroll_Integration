/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/http', 'N/task'], function (record, search, serverWidget, http ,task) {

    function onRequest(context) {
	  if (request.method === 'GET') {
     var objRecord = record.create({
						type: "paycheckjournal"
							});
							objRecord.setValue({
								fieldId :'employee',
								value : 9884
							})
					log.debug('objRecord',objRecord);
					
						objRecord.setSublistText({
						sublistId: 'earning',
						fieldId: 'payrollitem',
						line: 0,
						value: empEarning
					});
					objRecord.setSublistValue({
						sublistId: 'earning',
						fieldId: 'amount',
						line: 0,
						value: empEarning
					});
					objRecord.setSublistText({
						sublistId: 'deduction',
						fieldId: 'payrollitem',
						line: 0,
						value: empdeduction
					});
					objRecord.setSublistValue({
						sublistId: 'deduction',
						fieldId: 'amount',
						line: 0,
						value: empdeductionAmount
					});
			       var payId = objRecord.save();
					log.debug('payId',payId);
      }
    }
	return {
        onRequest: onRequest
    };
});