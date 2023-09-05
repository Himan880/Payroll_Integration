/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error','N/currentRecord'],
    function(error , currentRecord) {
        function saveRecord(context) {
            try{
			 var poRecord = context.currentRecord;
                var lineCount = poRecord.getLineCount({
                    sublistId: 'item'
                });
             //   for (var count = 0; count < lineCount; count++) { // Changed the condition to '<' instead of '>'
                    var billQuantity = poRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemquantity'
                    });
                    var physicalQty =  poRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol3'
                    });
                    var remarks = poRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol4'
                    }); 
					log.debug('subsidiary',subsidiary);
					var physicalQTY = poRecord.getCurrentSublistValue({
						sublistId: 'machtitle',
						fieldId: 'name'
					});
					log.debud('physicalQTY',physicalQTY);
					 
				if (billQuantity === physicalQty) {
					alert('Both quantities are the same.');
					return true;
				}
                if (billQuantity !== physicalQty && (remarks === '' || remarks === null)) {
                        alert('Bill quantity is not equal to physical quantity. Please add a remark on line');
                        return false; // Prevents the record from being saved
                    }
              
				else{
					
                return true; // Only return true if all quantities match
				}

            } catch(e) {
                log.debug(e.name, e.message);
            }
        }

        return {
            saveRecord: saveRecord
        };
    });
