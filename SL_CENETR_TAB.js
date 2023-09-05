/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record'], function (serverWidget,record) {
  function onRequest(context) {
    if (context.request.method === 'GET') {
      // Create a form
      var form = serverWidget.createForm({
        title: 'Gate Entry Form',
      });
      form.addTab({
        id: 'custpage_custom_tab',
        label: 'Gate Entry'
      });
     var vendorField = form.addField({
            id: 'vendorselect',
            type: serverWidget.FieldType.SELECT,
            label: 'VENDOR',
			source : 'vendor'
        });
      context.response.writePage(form);
    }
  }

  return {
    onRequest: onRequest
  };
});
