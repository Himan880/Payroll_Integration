/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record','N/search','N/redirect'], function (serverWidget,record,search,redirect) {
  function onRequest(context) {
    if (context.request.method === 'GET') {
      // Create a form
      var form = serverWidget.createForm({
        title: 'Gate Entry Item Qty',
      });
	//  form.clientScriptModulePath = 'SuiteScripts/CS_VENDOR_PO_LIST.js';
	  var poNumberParam = context.request.parameters.ponumber;
	  var vendorId = context.request.parameters.custparam_test;
	  log.debug('vendorId',vendorId);
     var poField = form.addField({
            id: 'custpage_purchaseorder',
            type: serverWidget.FieldType.SELECT,		
            label: 'Purchase Order',
			source : 'purchaseorder'
        });
		poField.defaultValue = poNumberParam;
		  var vendorField = form.addField({
            id: 'custpage_vendor',
            type: serverWidget.FieldType.TEXT,		
            label: 'Vendor'
        });
		vendorField.defaultValue = vendorId;
				var itemSublist = form.addSublist({
                id: 'custpage_polist',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'PO LIST'
            });
			var itemSublistFld =  itemSublist.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.SELECT,
                label: 'ITEM',
				source : 'item'
            });	
			var qtySublistFld = itemSublist.addField({
                id: 'custpage_qty',
                type: serverWidget.FieldType.TEXT,
                label: 'Quantity'
            });	
			var gateEntrySublistFld = itemSublist.addField({
                id: 'custpage_itemgateentry',
                type: serverWidget.FieldType.TEXT,
                label: 'Item Gate Entry Qty'
            });	
var purchaseorderSearchObj = search.create({
   type: "purchaseorder",
   filters:
   [
      ["type","anyof","PurchOrd"], 
      "AND", 
      ["internalid","anyof",vendorId], 
      "AND", 
      ["mainline","is","F"]
   ],
   columns:
   [
      search.createColumn({name: "item", label: "Item"}),
      search.createColumn({name: "quantity", label: "Quantity"}),
      search.createColumn({name: "quantityshiprecv", label: "Quantity Fulfilled/Received"})
   ]
});
var searchResultCount = purchaseorderSearchObj.runPaged().count;
log.debug("purchaseorderSearchObj result count",searchResultCount);
var i = 0;
purchaseorderSearchObj.run().each(function(result){
	var item = result.getValue({
		name : 'item'
	});
	log.debug('item',item);
	var qty = result.getValue({
		name : 'quantity'
	});
	log.debug('qty',qty);
	var qtyRec = result.getValue({
		name: "quantityshiprecv"
	});
	qtyRec = qtyRec?qtyRec:0
	log.debug('qtyRec',qtyRec);
	var finalQty = Number(qty) - Number(qtyRec);
	itemSublist.setSublistValue({
		 id: 'custpage_item',
		line: i,
		value: item 
		
	});
	itemSublist.setSublistValue({
		 id: 'custpage_qty',
		line: i,
		value: finalQty 
		
	});
	i++;
   // .run().each has a limit of 4,000 results
   return true;
});

			
			 form.addSubmitButton({
					label: 'Submit'
					  });
		  context.response.writePage(form);
    }
	else{
		var poInternalId = context.request.parameters.custpage_purchaseorder;
		log.debug('poInternalId',poInternalId);
		var vendorInternalId = context.request.parameters.custpage_vendor;
		// var poRecLoad = record.load({
			// type : "purchaseorder",
			// id : poInternalId
		// });
		// poRecLoad.save();
		redirect.toSuitelet({
    scriptId: 'customscript2239',
    deploymentId: 'customdeploy1',
    parameters: {
        custparam_test: vendorInternalId
    }
});
	}
  }

  return {
    onRequest: onRequest
  };
});