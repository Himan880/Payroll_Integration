	/**
	 * @NApiVersion 2.0
	 * @NScriptType ClientScript
	 */

	define(['N/currentRecord', 'N/search'], function(currentRecord, search) {
	  
	  function fieldChanged(context) {
		var currentRec = context.currentRecord;
		var sublistName = context.sublistId;
		var fieldId = context.fieldId;
	   var purchaseOrderId = currentRec.getValue('custrecord_purchase_order');
		 alert('purchaseOrderId'+purchaseOrderId);
		 if(fieldId == 'custrecord_purchase_order'){
			 if(purchaseOrderId){
		var purchaseorderSearchObj = search.create({
		   type: "purchaseorder",
		   filters:
		   [
			  ["type","anyof","PurchOrd"], 
			  "AND", 
			  ["internalid","anyof",purchaseOrderId], 
			  "AND", 
			  ["mainline","is","F"]
		   ],
		   columns:
		   [
			  search.createColumn({name: "item", label: "Item"}),
			  search.createColumn({name: "quantity", label: "Quantity"})
		   ]
		});
		var searchResultCount = purchaseorderSearchObj.runPaged().count;
		log.debug("purchaseorderSearchObj result count",searchResultCount);
		purchaseorderSearchObj.run().each(function(result){
			
			var item = result.getValue('custrecord_ctra_gate_pass_item');
			var quantity = result.getValue('custrecord_ctra_gate_pass_po_quantity');
			
			if (searchResultCount)
			currentRec.selectNewLine({
			  sublistId: 'recmachcustrecord107'
			});
   
			currentRec.setCurrentSublistValue({
			  sublistId: 'recmachcustrecord107',
			  fieldId: 'custrecord_ctra_gate_pass_item',
			  value: item
			});

			currentRec.setCurrentSublistValue({
			  sublistId: 'recmachcustrecord107',
			  fieldId: 'custrecord_ctra_gate_pass_po_quantity',
			  value: quantity
			});

	 currentRec.commitLine({
			  sublistId: 'item'
			});
		   // .run().each has a limit of 4,000 results
		   return true;
		});
		 }
	  }
		  }

	 return {
		fieldChanged: fieldChanged
	  };
	});
