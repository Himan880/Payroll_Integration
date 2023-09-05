/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget'], function(serverWidget) {
    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var form = context.form;
            
            // Create a custom button named "Inventory Transfer"
            var inventoryTransferButton = form.addButton({
                id: 'custpage_inventory_transfer_button',
                label: 'Inventory Transfer',
                functionName: 'onInventoryTransferButtonClick'
            });
            
            
        }
    }
    
    return {
        beforeLoad: beforeLoad
    };
});
