	  /**
	   * @NApiVersion 2.1
	   * @NScriptType Suitelet
	   */
	  define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/url'], function(
	      serverWidget, record, search, url)
	  {
	      function onRequest(context)
	      {
	          if (context.request.method === 'GET')
	          {
	              // Create a form
	              var form = serverWidget.createForm(
	              {
	                  title: 'Quality Result',
	              });
	            
              }
          }
              
				   return {
	          onRequest: onRequest
	      };
	  });