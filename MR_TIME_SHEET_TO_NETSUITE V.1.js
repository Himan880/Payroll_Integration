/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/https', 'N/log'], function(search, record, https, log) {

    function getInputData() {
        var headerObj = {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        };
        log.debug('headerObj', headerObj);

        // Return the input data
        return {};
    }

    function map(context) {
        var headerObj = {
            "Authorization": "pk_50174829_4HDATRI6L1I4W61ESK7RGWXSXVFYZK6N",
            // "Content-Type": "application/json;",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br"
            // "Content-Length": "10000"
        };
        var timeEntryResponse = https.get({
            url: 'https://api.clickup.com/api/v2/team/team_id/view',
            headers: headerObj
        });
        log.debug('timeEntryResponse', timeEntryResponse);

        var responseBody = JSON.parse(timeEntryResponse.body);
        log.debug('responseBody', responseBody);

        var responseCount = responseBody.length;
        var issueKey;
        for (var i = 0; i < responseCount; i++) {
            var empID = responseBody[i].teams.members.id;
            log.debug('empID', empID);
            var empName = responseBody[i].teams.members.username;
            log.debug('empName', empName);

            var timeResponse = https.get({
                url: 'https://rishabhgaur.atlassian.net/rest/api/2/search?jql=project=' + empName + '&maxResults=1000',
                headers: headerObj
            });
            var taskresponseBody = JSON.parse(timeResponse.body);
            log.debug('taskresponseBody', taskresponseBody);

            var taskIssues = taskresponseBody.issues;
            var taskIssuesLength = taskresponseBody.issues.length;
            log.debug('taskIssuesLength', taskIssuesLength);

            for (var taskCount = 0; taskCount < taskIssuesLength; taskCount++) {
                issueKey = taskresponseBody.issues[taskCount].key;
                log.debug('issueKey', issueKey);

                // Rest of your existing logic for fetching project, task, employee, etc.

                var timeSheet = https.get({
                    url: 'https://rishabhgaur.atlassian.net/rest/api/2/issue/' + issueKey + '/worklog',
                    headers: headerObj
                });

                var timesheetresponseBody = JSON.parse(timeSheet.body);
                log.debug('timesheetresponseBody', timesheetresponseBody);

                var sheetLength = timesheetresponseBody.worklogs.length;
                for (var xi = 0; xi < sheetLength; xi++) {
                    var timeSpentInsec = timesheetresponseBody.worklogs[xi].timeSpentSeconds;
                    var convert = Number(timeSpentInsec) / Number(3600);

                    // Rest of your existing logic for updating resource allocation record.

                }
            }
        }
    }

    function reduce(context) {
        // Implement your reduce logic if needed
    }

    function summarize(context) {
        // Implement your summarize logic if needed
    }

    // Link each entry point to the appropriate function.
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});
