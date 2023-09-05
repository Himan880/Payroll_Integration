/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
 define(['N/record', 'N/search', "N/runtime"], function (record, search, runtime){

function onRequest(context) {
    if (request.method === 'GET') {
     
        var form = serverWidget.createForm({
            title: 'BOM Report'
        });

        form.addField({
            id: 'custpage_fgitem',
            type: serverWidget.FieldType.SELECT,
            label: 'FG Item'
        });

        form.addSubmitButton('Generate Report');
        response.writePage(form);
    } else {
  
        var fgItem = request.parameters.custpage_fgitem;
        response.write("BOM Report for FG Item: " + fgItem);
    }
}
return {
        onRequest: onRequest
    }
});

