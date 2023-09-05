/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/search', 'N/runtime' , 'N/redirect'], function(currentRecord , search , runtime , redirect){
	 function fieldChanged(context)
    {
        try
        {
            var currentRecord = context.currentRecord;
            var fieldName = context.fieldId;
             var vendorField = currentRecord.getValue({
                    fieldId: 'entity'
                });

				redirect.toSuitelet({
					scriptId: 'customscript2239',
					deploymentId: 'customdeploy1',
					parameters: {
						 'custparam_test': vendorField
					}
				});
			
		}
			catch (e)
        {
            log.error("error", e);
        } 
	}
    return {
        fieldChanged: fieldChanged
    }
});