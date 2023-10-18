/** 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript 
 */
define(['N/search', 'N/record', 'N/https', 'N/format'], function(search, record, https, format) {
    function getInputData() {
        var headerObj = {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        };
        //log.debug('headerObj', headerObj);
        var bodyObj = {
            grant_type: 'kekaapi',
            scope: 'kekaapi',
            client_id: '5d1db292-22b9-4321-9a7d-989c3d0e3e6d',
			//'e715c088-100a-4add-996f-702012e86ec4',
            client_secret: 'AsQ9e4dgV8NT69eg2w2r',
//			'5ObUdzFJHIxUg9xTNaLj',
            api_key: 'MMQKWqUBNMaOC3f2KWG7dRCj9I+sZsLgquqV7qA91ew='
			//'jq0yD6b2eioNOG8gqs+pBvgm44AwBrDOxEikZ188ao0='
        };
        // log.debug('bodyObj', bodyObj);
        var response = https.post({
            url: 'https://login.keka.com/connect/token',
			//'https://login.kekademo.com/connect/token',
            body: bodyObj,
            headers: headerObj
        });
        //log.debug('response', response);
        //log.debug('response body', response.body);
        var responseBody = JSON.parse(response.body);
        var accessToken1 = [];
        var accessToken = responseBody.access_token;
        // log.debug('accessToken', accessToken);
        accessToken1.push(accessToken);
        return accessToken1;
    }

    function map(context) {
		try{
        // log.debug('in map', context);
        var accessTokenNumber = context.value;
        //log.debug('accessTokenNumber', accessTokenNumber);
        var headerObj = {
            accept: 'application/json',
            authorization: 'Bearer' + ' ' + accessTokenNumber
            // eyJhbGciOiJSUzI1NiIsImtpZCI6IjFBRjQzNjk5RUE0NDlDNkNCRUU3NDZFMjhDODM5NUIyMEE0MUNFMTgiLCJ4NXQiOiJHdlEybWVwRW5HeS01MGJpaklPVnNncEJ6aGciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xvZ2luLmtla2EuY29tIiwibmJmIjoxNjg1NTM1NjExLCJpYXQiOjE2ODU1MzU2MTEsImV4cCI6MTY4NTYyMjAxMSwiYXVkIjpbImtla2FhcGkiLCJodHRwczovL2xvZ2luLmtla2EuY29tL3Jlc291cmNlcyJdLCJzY29wZSI6WyJrZWthYXBpIl0sImFtciI6WyJrZWthYXBpIl0sImNsaWVudF9pZCI6IjVkMWRiMjkyLTIyYjktNDMyMS05YTdkLTk4OWMzZDBlM2U2ZCIsInN1YiI6IjE1MWUxOGY5LTE2NWYtNDcwNC1iMTUyLWI4YWNiYzZiOWE2OSIsImF1dGhfdGltZSI6MTY4NTUzNTYxMSwiaWRwIjoibG9jYWwiLCJqdGkiOiI3NkJFNjQ2RjE3RjdFOThDREI5N0VFNzMzN0U3MjkyRCJ9.ArwLmTpV1azGS3Z1Hi4NS9RbSjJKm4iqvAunBSQpBXyAODTdp8xmNpYvheSVoF2NwsAWkEXXEk6BdDJ44MgJJ00FazxIAy7fwmxf2no5hFhplckfiUvKquFzWZ40OlKo6Q_yVI2QjLugpcjvWSfx0oFTQG0RfGshIvOyc0SV8OVRUmeHwQAVnGdpFDCNZL-Opz_ZjkoPwUHUbTAh2WYDaZRPjEo03DM8EJ5e5ckgc36ZPW2Anyy_5NiJiCvU2dgINArcaz9mu4zqRmwB1IBf1wCXYt4tK296l8WvRS8kqDEDQdk9h13ldHLBz6E6fJJyPX3LWXBth2f18lzG3B8SLg'
        };
        //log.debug('map headerObj',headerObj);
        var response = https.get({
            url: 'https://sattva.keka.com/api/v1/hris/employees?inProbation=false&inNoticePeriod=false',
            headers: headerObj
        });
        log.debug('map response', response);
        var responseBody = JSON.parse(response.body);
        log.debug('responseBody', responseBody);
        var employeeCount = responseBody.data.length;
        log.debug('employeeCount', employeeCount);
        var pageCount = responseBody.totalPages;
        log.debug('pageCount', pageCount);
        var pageNumber = responseBody.pageNumber;
        log.debug('pageNumber', pageNumber);
        var nextPageUrl = responseBody.nextPage;
        log.debug('nextPageUrl', nextPageUrl);
        for (var i = 1; i < pageCount + 1; i++) {
            var response = https.get({
                url: 'https://sattva.keka.com/api/v1/hris/employees?pageNumber=' + i + '&pageSize=100',

                headers: headerObj
            });
            log.debug('map response', response);
            var responseBody = JSON.parse(response.body);
            log.debug('responseBody', responseBody);
            var employeeCount = responseBody.data.length;
            log.debug('employeeCount', employeeCount);
            var pageCount = responseBody.totalPages;
            log.debug('pageCount', pageCount);
            var pageNumber = responseBody.pageNumber;
            log.debug('pageNumber', pageNumber);
            for (var count = 0; count < employeeCount; count++) {
                var employeeId = responseBody.data[count].employeeNumber;
                log.audit('employeeId', employeeId);
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters: [
                        ["entityid", "is", employeeId],
						 "AND", 
						["isinactive","is","F"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = employeeSearchObj.runPaged().count;
                log.debug("employeeSearchObj result count",searchResultCount);
                if (searchResultCount == 0) {
					var empRec = record.create({
                        type: "employee"
                    });
                    log.debug('empRec', empRec);
					var kekalogsCreated = record.create({
						type : 'customrecord_keka_logs'
					});
                    var empFirstName = responseBody.data[count].firstName;
                    log.debug('empFirstName', empFirstName);
                    var empMiddleName = responseBody.data[count].middleName;
                    log.debug('empMiddleName', empMiddleName);
                    var empLastName = responseBody.data[count].lastName;
                    log.debug('empLastName', empLastName);
					var fullName = empFirstName + empMiddleName + empLastName;
                    var empEmail = responseBody.data[count].email;
                    log.debug('empEmail', empEmail);
                    if (responseBody.data[count].jobTitle) {
                        var jobTitle = responseBody.data[count].jobTitle.title;
                        log.debug('jobTitle', jobTitle);
                    }
                    var empMartialStatus = responseBody.data[count].maritalStatus;
                    log.debug('empMartialStatus', empMartialStatus);
                    var empGender = responseBody.data[count].gender;
                    log.debug('empGender', empGender);
                    var empHireDate = responseBody.data[count].joiningDate;
                    log.debug('empHireDate', empHireDate);
                    var homePhoneNo = responseBody.data[count].homePhone;
                    log.debug('homePhoneNo', homePhoneNo);
                    var mobilePhoneNo = responseBody.data[count].mobilePhone;
                    log.debug('mobilePhoneNo', mobilePhoneNo);
                    var currAddress = responseBody.data[count].currentAddress;
                    log.debug('currAddress', currAddress);
                    let yyyyHire = empHireDate.slice(0, 4);
                    let mmHire = empHireDate.slice(5, 7);
                    let ddHire = empHireDate.slice(8, 10);
                    var empBirthDate = responseBody.data[count].dateOfBirth;
                    log.debug('empBirthDate', empBirthDate);
                    let yyyybirth = empBirthDate.slice(0, 4);
                    let mmbirth = empBirthDate.slice(5, 7);
                    let ddbirth = empBirthDate.slice(8, 10);
                    if (responseBody.data[count].customFields[7]) {
                        var empProjectResource = responseBody.data[count].customFields[7].value;
                        log.debug('empProjectResource', empProjectResource);
                    }
                    if (responseBody.data[count].customFields[8]) {
                        var empProjectManager = responseBody.data[count].customFields[8].value;
                        log.debug('empProjectManager', empProjectManager);
                    }
                    var empExitDatefull = responseBody.data[count].exitDate;
                    log.debug('empExitDatefull', empExitDatefull);
					if(empExitDatefull){
					  let yyyyExit = empExitDatefull.slice(0, 4);
                    let mmExit = empExitDatefull.slice(5, 7);
                    let ddExit = empExitDatefull.slice(8, 10);
					var empExitDate = ddExit + '/' + mmExit + '/' +yyyyExit 
					  if (empExitDate) {
                    var empExitDateValue = format.parse({
                    value: empExitDate,
                    type: format.Type.DATE
                    })
                    empRec.setValue({
                    fieldId: 'releasedate',
                    value: empExitDateValue
                    });
                    }
					}
                    var empWorkType = responseBody.data[count].workerType;
                    log.debug('empWorkType', empWorkType);
                    var empStatus = responseBody.data[count].employmentStatus;
                    log.debug('empStatus', empStatus);

                   
                   
                    empRec.setValue({
                        fieldId: 'autoname',
                        value: false
                    });

                    empRec.setValue({
                        fieldId: 'entityid',
                        value: employeeId
                    });
                    empRec.setValue({
                        fieldId: 'firstname',
                        value: empFirstName
                    });
                    if (empMiddleName) {
                        empRec.setValue({
                            fieldId: 'middlename',
                            value: empMiddleName
                        });
                    }
                    if (empLastName) {
                        empRec.setValue({
                            fieldId: 'lastname',
                            value: empLastName
                        });
                    }
                    empRec.setValue({
                        fieldId: 'email',
                        value: empEmail
                    });
                    if (jobTitle) {
                        empRec.setValue({
                            fieldId: 'title',
                            value: jobTitle
                        });
                    }
                    if (homePhoneNo) {
                        empRec.setValue({
                            fieldId: 'homePhone',
                            value: homePhoneNo
                        });
                    }
                    if (mobilePhoneNo) {
                        empRec.setValue({
                            fieldId: 'mobilephone',
                            value: mobilePhoneNo
                        });
                    }
                    if (currAddress) {
                        empRec.setValue({
                            fieldId: 'currentAddress',
                            value: currAddress
                        });
                    }
                    if (empMartialStatus) {
                        if (empMartialStatus != 0) {
                            empRec.setValue({
                                fieldId: 'maritalstatus',
                                value: empMartialStatus
                            });
                        }
                    }
                    if (empGender == 0) {
                        empRec.setValue({
                            fieldId: 'gender',
                            value: 'ns'
                        });
                    } else if (empGender == 1) {
                        empRec.setValue({
                            fieldId: 'gender',
                            value: 'm'
                        });
                    } else if (empGender == 2) {
                        empRec.setValue({
                            fieldId: 'gender',
                            value: 'f'
                        });
                    } else if (empGender == 3) {
                        empRec.setValue({
                            fieldId: 'gender',
                            value: 'nb'
                        });
                    }

                    var finalHireDate = ddHire + '/' + mmHire + '/' + yyyyHire;
                    log.debug('finalHireDate', finalHireDate);
                    var hiredateValue = format.parse({
                    value: finalHireDate,
                    type: format.Type.DATE
                    })
                    empRec.setValue({
                    fieldId: 'hiredate',
                    value: hiredateValue //28/06/2023
                    });
                    var birthHireDate = ddbirth + '/' + mmbirth + '/' + yyyybirth;
                    log.debug('birthHireDate', birthHireDate);
                    var birthdateValue = format.parse({
                    value: birthHireDate,
                    type: format.Type.DATE
                    })
                    empRec.setValue({
                    fieldId: 'birthdate',
                    value: birthdateValue
                    });
                  
                    if (empProjectResource) {
                        empRec.setValue({
                            fieldId: 'isjobresource',
                            value: empProjectResource
                        });
                    }
                    if (empProjectManager) {
                        empRec.setValue({
                            fieldId: 'isjobmanager',
                            value: empProjectManager
                        });
                    }
                    if (empProjectManager) {
                        empRec.setValue({
                            fieldId: 'isjobmanager',
                            value: empProjectManager
                        });
                    }
                    if (empWorkType == 1) {
                        empRec.setValue({
                            fieldId: 'employeetype',
                            value: 1
                        });

                    }
                    if (empWorkType == 2) {
                        empRec.setValue({
                            fieldId: 'employeetype',
                            value: 3
                        });
                    }
                    if (empStatus == 0) {
                        empRec.setValue({
                            fieldId: 'employeestatus',
                            value: 2
                        });
                    }
					var edulength = responseBody.data[count].educationDetails.length;
                    log.debug('edulength', edulength);
                    if (edulength > 0) {
                        for (var eduCount = 0; eduCount < edulength; eduCount++) {
                            log.debug('inside Loop')
                            if (responseBody.data[count].educationDetails) {
                                var empEducationDetails = responseBody.data[count].educationDetails[eduCount].degree;
                                log.debug('empEducationDetails', empEducationDetails);
                                var empEducationCompletion = responseBody.data[count].educationDetails[eduCount].yearOfCompletion;
                                log.debug('empEducationCompletion', empEducationCompletion);
                                if (empEducationDetails) {
                                    var degreeValue = empRec.setSublistValue({
                                        sublistId: 'hreducation',
                                        fieldId: 'degree',
                                        line: eduCount,
                                        value: empEducationDetails

                                    });
                                }
                                if (empEducationCompletion) {
                                    let yyyyedu = empEducationCompletion.slice(0, 4);
                                    let mmedu = empEducationCompletion.slice(5, 7);
                                    let ddedu = empEducationCompletion.slice(8, 10);
                                    var datefinal = ddedu + '/' + mmedu + '/' + yyyyedu;
                                    var finalempEducationCompletion = format.parse({
                                        value: datefinal,
                                        type: format.Type.DATE
                                    })
                                    var empdegreeDate = empRec.setSublistValue({
                                        sublistId: 'hreducation',
                                        fieldId: 'degreedate',
                                        line: eduCount,
                                        value: finalempEducationCompletion

                                    });

                                }
                            }
                        }
                    }
                    var groupLength = responseBody.data[count].groups.length;
                    log.debug('groupLength', groupLength);
                    for (var grpCount = 0; grpCount < groupLength; grpCount++) {
                        var groupType = responseBody.data[count].groups[grpCount].groupType;
                        if (groupType == 2) {

                            var groupTitle2 = responseBody.data[count].groups[grpCount].title;
                            log.debug('groupTitle2', groupTitle2);
							if(groupType == 1){
								var groupTitle1 = responseBody.data[count].groups[grpCount].title;
								var finalgroupTitle12 = groupTitle1 + ':' + groupTitle2;
								log.debug('finalgroupTitle12',finalgroupTitle12);
                            var classificationSearchObj = search.create({
                                type: "classification",
                                filters: [
                                    ["name", "is", finalgroupTitle12]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "name",
                                        sort: search.Sort.ASC,
                                        label: "Name"
                                    }),
                                    search.createColumn({
                                        name: "internalid",
                                        label: "Internal ID"
                                    })
                                ]
                            });
                            var searchResultCount = classificationSearchObj.runPaged().count;
                            log.debug("classificationSearchObj result count", searchResultCount);
                            classificationSearchObj.run().each(function(result) {
                                var groupId = result.getValue({
                                    name: "internalid"
                                });
                                log.debug('groupId', groupId);
                                if (groupId) {
                                    empRec.setValue({
                                        fieldId: 'class',
                                        value: groupId
                                    });
                                }

                                return true;
                            });


							}
                        }
                        if (groupType == 9) {
                            var groupTitle9 = responseBody.data[count].groups[grpCount].title;
							if(groupType == 4){
							var groupTitle4 = responseBody.data[count].groups[grpCount].title;
							var finalgroupTitle = groupTitle4 +':'+ groupTitle9;
                            var departmentSearchObj = search.create({
                                type: "department",
                                filters: [
                                    ["name", "is", finalgroupTitle]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "name",
                                        sort: search.Sort.ASC,
                                        label: "Name"
                                    }),
                                    search.createColumn({
                                        name: "internalid",
                                        label: "Internal ID"
                                    })
                                ]
                            });
                            var searchResultCount = departmentSearchObj.runPaged().count;
                            log.debug("departmentSearchObj result count", searchResultCount);
                            departmentSearchObj.run().each(function(result) {
                                var groupIddep = result.getValue({
                                    name: "internalid"
                                });
                                log.debug('groupIddep', groupIddep);
                                if (groupIddep) {
                                    empRec.setValue({
                                        fieldId: 'department',
                                        value: groupIddep

                                    });
                                }

                                return true;
                            });
							}
                        }
                    }
					
				var createdDate = new Date();
			    var day = createdDate.getDate(); //Date of the month: 2 in our example
				var month = createdDate.getMonth()+1; //Month of the Year: 0-based index, so 1 in our example
				var year = createdDate.getFullYear()
				var fullday = day+"/"+month+"/"+year
				var createdDateKeka = format.parse({
                    value: fullday,
                    type: format.Type.DATE
                    })
				var empRecID = empRec.save({
					enableSourcing: true
				});
				log.debug('empRecID',empRecID);
					kekalogsCreated.setValue({
					fieldId : 'custrecord_keka_log_created',
					value : createdDateKeka
				});
					kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord_emp_name',
						line : 0,
						value : fullName
					});
					kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord_emp_id',
						line : 0,
						value : employeeId
					});
					kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord_date_created',
						line : 0,
						value : createdDateKeka
					});
					if(empRecID){
						kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord38',
						line : 0,
						value : "Created"
					});
					}
					else{
						kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord38',
						line : 0,
						value : "Not Created"
					});
					}
					
					var kekaLogsID = kekalogsCreated.save({
					enableSourcing: true,
					ignoreMandatoryFields : true
				});
                }
            }
        }
	}
	catch(ex){
	               	var createdDate = new Date();
					var day = createdDate.getDate(); //Date of the month: 2 in our example
					var month = createdDate.getMonth()+1; //Month of the Year: 0-based index, so 1 in our example
					var year = createdDate.getFullYear()
					var fullday = day+"/"+month+"/"+year
					 var createdDateKeka = format.parse({
                    value: fullday,
                    type: format.Type.DATE
                    })
					kekalogsCreated.setValue({
					fieldId : 'custrecord_keka_log_created',
					value : createdDateKeka
				});
					kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord_emp_name',
						line : 0,
						value : fullName
					});
					kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord_emp_id',
						line : 0,
						value : employeeId
					});
					kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord_date_created',
						line : 0,
						value : createdDateKeka
					});
						kekalogsCreated.setSublistValue({
						sublistId : 'recmachcustrecord_both_record_relationship',
						fieldId : 'custrecord38',
						line : 0,
						value : "Not Created Reason : " + ex.message
					});
					
		log.error('Error In Map Function',ex);
		var kekaLogsID = kekalogsCreated.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});
	}

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
