/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/error'], function (record, search, error) {
    function afterSubmit(context) {
        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
            var customRecord = context.newRecord;
            var customRecordType = customRecord.type;
            var customRecordId = customRecord.id;

            // Get the Purchase Order ID from the custom record. Replace 'custrecord_purchase_order' with the actual field ID on the custom record.
            var purchaseOrderId = customRecord.getValue({ fieldId: 'custrecord_purchase_order' });

            // If the Purchase Order ID is not found, exit the script.
            if (!purchaseOrderId) {
                log.debug("No Purchase Order ID found on the custom record.", "Exiting script.");
                return;
            }

            // Load the Purchase Order record to retrieve the associated Item Receipt ID.
            var purchaseOrder = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: purchaseOrderId
            });

            // Get the Item Receipt ID from the Purchase Order. Replace 'custbody_item_receipt_id' with the actual field ID on the Purchase Order record.
            var itemReceiptId = purchaseOrder.getValue({ fieldId: 'custbody_item_receipt_id' });

            // If the Item Receipt ID is not found, exit the script.
            if (!itemReceiptId) {
                log.debug("No Item Receipt ID found on the Purchase Order.", "Exiting script.");
                return;
            }

            // Load the Item Receipt record.
            var itemReceipt = record.load({
                type: record.Type.ITEM_RECEIPT,
                id: itemReceiptId
            });

            // Get the line count from the custom record sublist. Replace 'recmachcustrecord107' with the actual sublist ID on the custom record.
            var lineCount = customRecord.getLineCount({ sublistId: 'recmachcustrecord107' });

            // Loop through each line of the custom record sublist and set the bill quantity on the corresponding line of the Item Receipt.
            for (var i = 0; i < lineCount; i++) {
                var itemId = customRecord.getSublistValue({
                    sublistId: 'recmachcustrecord107',
                    fieldId: 'custrecord_ctra_gate_pass_item',
                    line: i
                });
                var billQty = customRecord.getSublistValue({
                    sublistId: 'recmachcustrecord107',
                    fieldId: 'custrecord_ctra_gate_pass_quantity',
                    line: i
                });

                // Find the line number on the Item Receipt where the item matches the one on the custom record sublist.
                var lineNumber = itemReceipt.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });

                // If the item is found on the Item Receipt, set the bill quantity.
                if (lineNumber >= 0) {
                    itemReceipt.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: lineNumber,
                        value: billQty
                    });
                }
            }

            // Save the changes to the Item Receipt.
            itemReceipt.save();
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
