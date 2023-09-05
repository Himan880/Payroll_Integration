/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/search', 'N/currentRecord'], function(search, currentRecord) {
    function pageInit(context) {
        var objRecord = context.currentRecord;
        var poId = objRecord.getValue({
            fieldId: 'createdfrom'
        });
		//alert('poId'+poId);
		
		var customrecord_gate_pass_recordSearchObj = search.create({
   type: "customrecord_gate_pass_record",
   filters:
   [
      ["custrecord_purchase_order","anyof",poId]
   ],
   columns:
   [
      search.createColumn({
         name: "custrecord_ctra_gate_pass_quantity",
         join: "CUSTRECORD107",
         label: "Bill Quantity"
      }),
      search.createColumn({
         name: "custrecord_ctra_gate_pass_item",
         join: "CUSTRECORD107",
         label: "Item"
      })
   ]
});
var searchResultCount = customrecord_gate_pass_recordSearchObj.runPaged().count;
log.debug("customrecord_gate_pass_recordSearchObj result count",searchResultCount);
customrecord_gate_pass_recordSearchObj.run().each(function(result){
	 var itemQuantity = result.getValue({
                name: "custrecord_ctra_gate_pass_quantity",
                join: "CUSTRECORD107"
            });
           alert('itemQuantity' + itemQuantity);
			var itemName = result.getValue({
				 name: "custrecord_ctra_gate_pass_item",
                    join: "CUSTRECORD107"
			});
			
            for (var i = 0; i < searchResultCount; i++) {
				var lineNumber = objRecord.findSublistLineWithValue({
					sublistId: 'item',
					fieldId: 'item',
					value: itemName
				});
				
                objRecord.selectLine({
                    sublistId: 'item',
                    line: lineNumber
                });
                objRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: itemQuantity,
                    ignoreFieldChange: true,
                    forceSyncSourcing: true
                });
                objRecord.commitLine({
                    sublistId: 'item'
                });
            }
   // .run().each has a limit of 4,000 results
   return true;
});
        return true;
    }

    function saveRecord (context){
		var globalc= ' ';
        var objRecord = context.currentRecord;
		 var poId = objRecord.getValue({
            fieldId: 'createdfrom'
        });
        var customrecord_gate_pass_recordSearchObj = search.create({
            type: "customrecord_gate_pass_record",
            filters: [
                ["custrecord_purchase_order", "anyof", poId]
            ],
            columns: [
                search.createColumn({
                    name: "custrecord_ctra_gate_pass_quantity",
                    join: "CUSTRECORD107",
                    label: "Landed Quantity"
                }),
                search.createColumn({
                    name: "custrecord_ctra_gate_pass_item",
                    join: "CUSTRECORD107",
                    label: "Item"
                })
            ]
        });
        var searchResultCount = customrecord_gate_pass_recordSearchObj.runPaged().count;
        customrecord_gate_pass_recordSearchObj.run().each(function(result) {
            var itemQuantity = result.getValue({
                name: "custrecord_ctra_gate_pass_quantity",
                join: "CUSTRECORD107"
            });
			//alert('itemQuantity'+itemQuantity);
			var CustItem = result.getValue({
				 name: "custrecord_ctra_gate_pass_item",
                    join: "CUSTRECORD107"
			})
		//	alert('itemQuantity'+itemQuantity);
            
				var lineNumber = objRecord.findSublistLineWithValue({
					sublistId: 'item',
					fieldId: 'item',
					value: CustItem
				});
			//	alert('lineNumber'+lineNumber);
				
				
				var iRqty = objRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						line : lineNumber
					});
				//alert('iRqty'+iRqty);
				var item = objRecord.getCurrentSublistText({
						sublistId: 'item',
						fieldId: 'item'
					});
				if(iRqty>itemQuantity){
					alert('Quantity of item is greater then Bill Quantity');
					globalc = 'Fe'
					return false;
				}
            return true;
        });
		//alert('globalc'+globalc);
		if(globalc == "Fe"){
			return false;
		}
		else{
			return true;
		}
    }
    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    }
}); 