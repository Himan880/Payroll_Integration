	/**
	 * @NApiVersion 2.x
	 * @NScriptType ClientScript
	 */
	define(['N/currentRecord', 'N/url'], function(currentRecord, url) {
	  function pageInit(context) {
		// Your initialization code here, if needed.
	  }

	  function itemR(context) {
		var currentRec = context.currentRecord;
		var internalId = currentRec.getValue({
		  fieldId: 'custrecord_purchase_order'
		});

		var url = "https://6810795-sb1.app.netsuite.com/app/accounting/transactions/itemrcpt.nl?e=T&memdoc=0&whence=&transform=purchord&id=" + internalId;
		window.open(url);
	  }

	  return {
		pageInit: pageInit,
		itemR : itemR
	  };
	});
