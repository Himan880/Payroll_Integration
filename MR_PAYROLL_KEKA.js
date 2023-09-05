/** 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript 
 */
define(['N/search', 'N/record', 'N/https'], function(search, record, https) {
    function getInputData() {
        var headerObj = {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        };
        // log.debug('headerObj', headerObj);

        var accessToken1 = [];
        accessToken1.push(headerObj);
        return accessToken1;
    }

    function map(context) {
        var headerObj = {
            "Authorization": "Basic cmlzaGFiaC5nYXVyQGNpbm50cmEuY29tOkFUQVRUM3hGZkdGMDZJeEJ3Mkk0cUZSSnFlc1l4bDlKSzJrZG1TY1dsMTBYZ21lbTBPbUhWYUtSeUh6RXIwWkRlMzdEY0JJVHYxQzNYSUplckxNQ0tRb2NmNjIzMmt1LVRlazhJYnl6MXREOHFkSVVDUTh0ZGlWWlBwSkVxZ1BISTM1NG15d3I3UXF2dXJzYlY5WlBXNW1lRkxJbDlnNmN6VDM1a3JyRHQ4VVN6aWxNbW44UVBkdz1DQ0E3Qjc0Rg==",
            "Content-Type": "application/json;",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Length": "10000"
        };
        var payrollResponse = https.get({
            url: 'https://sattva.keka.com/api/v1/payroll/paygroups',
            headers: headerObj
        });
		log.debug('payrollResponse',payrollResponse);
		 var responseBody = JSON.parse(payrollResponse.body);
        //log.debug('responseBody',responseBody);
        var responseCount = responseBody.length;
        //log.debug('responseCount',responseCount);
		  }

    function reduce(context) {}
    // The summarize stage is a serial stage, so this function is invoked only one time. 
    function summarize(context) {
        // Log details about the script’s execution. 
    }
    // Link each entry point to the appropriate function. 
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});