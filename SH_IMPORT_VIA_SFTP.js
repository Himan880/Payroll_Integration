var hostKey = 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDERvT6nD5ka2e/sflP9WG9JHV1c6TzSby7i03QbwNJutndUg5C5MGenjxU62AWE2QPXyKyVbgJcEG8MiAK2enG/0TtMrOLrRHPIkNSpU0kNRdi0InKqbmvUV5L/nU4BWh0bqszznYPtPA4Bvm3aj6PGJShFxwIVmbZ10srZYMKtY5Wp3LwtKaJCmNaTOn3BRIowDetDoLR5Ia81syeihZSrmNZsmA2cuGA2csL5oWAO/Aqz/eLThMZh+OPDiwWmZcXf+jALgODJrho/fNNWE/v2TRTiAv0F3MnUqpIonapyCh35nwBHlZ487mMo7eyCDJpGuF330VXwo2nsKNkIJeWsW0tbVjtZpsji5AsDpKQI/+xxgTK1EwL+C0VuOKp9Na0GkB35JPn3kQhpvDneOqkll2sgrpXC+j8wnMk7Y8AvD8WZk9yRlYNxHXCMwzVrMGBaOEnr3koUJBbIszPXPvbnx+tEmF+oQmbU7R7MYmgvg0EyNffgvCooKu7qHbsHO68iPbgWkwPWGLykX8CF22opedvsy4JDPvf2+YBRJtCD3zPpXcR/3YjqJHBn6hDyDh/f1ijyyrKCNloA09mPyZ74/9J9OTISPCc3oZgQ30DiVFPp7RyJMMkV8LkmE1HEAwjbQmrn1Me6OmBuJpZ9ckTH7pir8bErfQ5AiAi+MM55w==';
var passwordGUID = "2a11413c0dd64e89aac1f9ede9d06203";
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(["N/record", "N/log", "N/file", "N/runtime", "N/sftp", "N/search", 'N/email', 'N/xml', './jszip.min.2.7.js'],
    function(record, log, file, runtime, sftp, search, email, xmlMod, JSZip) {
        var MinUsage = 800;
        var startTime = new Date().getTime();

        function execute(context) {
            var allCreatedUpdateRecords = [];
            var currentScript = runtime.getCurrentScript();
            var author = currentScript.getParameter({
                name: 'custscript_sh_author_estimate_export'
            }) ? currentScript.getParameter({
                name: 'custscript_sh_author_estimate_export'
            }) : -5;
            var recipient = currentScript.getParameter({
                name: 'custscript_sh_recipient_estimate_export'
            }) ? currentScript.getParameter({
                name: 'custscript_sh_recipient_estimate_export'
            }) : -5;
            log.debug("author || recipient", author + " || " + recipient);
            try {
                var estimateZipFileDownloadFolderId = 2024;
                var projectZipFileDownloadFolderId = 2653;
                var connection = sftp.createConnection({
                    username: "FleetResponse.test_2020",
                    passwordGuid: passwordGUID,
                    url: "betaftp.g0.xactanalysis.com",
                    directory: '/',
                    hostKey: hostKey,
                    port: 22
                });
                /////////// CREATE PROJECTS ////////////////
                var list1 = connection.list({
                    path: '/OUT/'
                });
                for (var d = 0; currentScript.getRemainingUsage() > MinUsage && d < list1.length; d++) {
                    ////////////// Check Script Usage & Time ///////////////////
                    var timeElapsed = (new Date().getTime() * 0.001) - (startTime * 0.001);
                    if (currentScript.getRemainingUsage() <= MinUsage || timeElapsed > 3500) {
                        break;
                    }
                    ////////////// **END** Check Script Usage & Time ///////////////////
                    var zipFileName = list1[d].name;
                    var directory = list1[d].directory;
                    var index = zipFileName.indexOf("FNOL_");
                    if (index != -1) {
                        log.debug("Remaining Usage || Remaining Time", currentScript.getRemainingUsage() + " || " + timeElapsed);
                        log.debug("list1[" + d + "]", list1[d]);
                        // log.debug("zipFileName || directory || index", zipFileName + " || " + directory + " || " + index);
                        var downloadedFile = connection.download({
                            directory: '/OUT/',
                            filename: zipFileName
                        });
                        downloadedFile.folder = projectZipFileDownloadFolderId;
                        var FNOL_downloadId = downloadedFile.save();
                        log.debug("Project/Assignment FNOL_downloadId", FNOL_downloadId);
                        try {
                            var fileObj = file.load({
                                id: FNOL_downloadId
                            });
                            var xmlData = fileObj.getContents();
                            log.debug("xmlData", xmlData);
                            ////////////// GET LOSS DESCRIPTION FROM XML DATA ////////////////
                            var project_info = xmlData;
                            var lossOfDesc = '';
                            if (project_info.includes("<PROJECT_INFO>")) {
                                var lossOfDescArray = project_info.split("<PROJECT_INFO>")[1];
                                lossOfDesc = lossOfDescArray.split("</PROJECT_INFO>")[0];
                                if (lossOfDesc.includes("<NOTES>")) {
                                    lossOfDesc = lossOfDesc.replace("<NOTES>", '');
                                    lossOfDesc = lossOfDesc.replace("</NOTES>", '');
                                }
                            } else {
                                lossOfDesc = '-';
                            }
                            log.debug("lossOfDesc", lossOfDesc);
                            ////////////// **END** GET LOSS DESCRIPTION FROM XML DATA ////////////////
                            var xmlObj = xmlMod.Parser.fromString({
                                text: xmlData
                            });
                            var jsonObj = c(xmlObj.documentElement);
                            log.debug('jsonObj', jsonObj);
                            var ADM_data = jsonObj.ADM;
                            var COVERAGE_LOSS_data = ADM_data.COVERAGE_LOSS;
                            var uniquedIdProject = jsonObj.XACTNET_INFO.originalTransactionId; //TRANSACTION ID(UNIQUE ID)
                            ////////////// CREATING/UPDATING PROJECT ////////////
                            var jobSearchObj = search.create({
                                type: "job",
                                filters: [
                                    ["custentity_project_unique_id", "is", uniquedIdProject]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "internalid",
                                        sort: search.Sort.DESC,
                                        label: "Internal ID"
                                    })
                                ]
                            });
                            var searchResultCount1 = jobSearchObj.runPaged().count;
                            log.debug("Project Exist result count && uniquedIdProject", searchResultCount1 + " || " + uniquedIdProject);
                            var projectInternalId = '';
                            jobSearchObj.run().each(function(result) {
                                projectInternalId = result.getValue("internalid");
                                return false;
                            });
                            if (jsonObj.CONTACTS.CONTACT.length) {
                                var CONTACT_data = jsonObj.CONTACTS.CONTACT[1];
                            } else {
                                var CONTACT_data = jsonObj.CONTACTS.CONTACT;
                            }
                            var MORTGAGES_data = CONTACT_data.MORTGAGES;
                            if (projectInternalId && searchResultCount1 > 0) {
                                log.debug("Project to Update Id", projectInternalId);
                                var projectObj = record.load({
                                    type: "job",
                                    id: projectInternalId,
                                    isDynamic: true
                                });
                                ////////////// UPDATE/CREATE CUSTOMER ////////////////
                                var companyName = CONTACT_data.name;
                                var emailAddress = CONTACT_data.CONTACTMETHODS.EMAIL;
                                if (emailAddress) {
                                    var isOrNot = "is";
                                    emailAddress = emailAddress.address;
                                } else {
                                    var isOrNot = "isempty";
                                    emailAddress = "";
                                }
                                log.debug("companyName || emailAddress", companyName + " || " + emailAddress);
                                var customerSearchObj = search.create({
                                    type: "customer",
                                    filters: [
                                        ["entityid", "is", companyName],
                                        "AND",
                                        ["email", isOrNot, emailAddress]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            sort: search.Sort.DESC,
                                            label: "Internal ID"
                                        }),
                                        search.createColumn({
                                            name: "altname",
                                            label: "Name"
                                        }),
                                        search.createColumn({
                                            name: "email",
                                            label: "Email"
                                        }),
                                        search.createColumn({
                                            name: "phone",
                                            label: "Phone"
                                        })
                                    ]
                                });
                                var searchResultCount = customerSearchObj.runPaged().count;
                                log.debug("Customer Search Result Count", searchResultCount)
                                var customerInternalId = '';
                                var flagCreateUpdate = "";
                                customerSearchObj.run().each(function(result) {
                                    customerInternalId = result.getValue("internalid");
                                    flagCreateUpdate = "update";
                                    customerInternalId = createUpdateCustomerRcdProject(CONTACT_data, emailAddress, flagCreateUpdate, customerInternalId); //UPDATE CUSTOMER
                                    return false;
                                });
                                if (!customerInternalId) {
                                    flagCreateUpdate = "create";
                                    customerInternalId = createUpdateCustomerRcdProject(CONTACT_data, emailAddress, flagCreateUpdate, customerInternalId); //CREATE CUSTOMER
                                }
                                ////////////// **END** UPDATE/CREATE CUSTOMER ////////////////
                            } else {
                                log.debug("Project to Create", "Project to Create");
                                var projectObj = record.create({
                                    type: "job",
                                    isDynamic: true
                                });
                                projectObj.setValue("companyname", CONTACT_data.name); //NAME
                                ////////////// FIND CUSTOMER ////////////////
                                var companyName = CONTACT_data.name;
                                var emailAddress = CONTACT_data.CONTACTMETHODS.EMAIL;
                                if (emailAddress) {
                                    var isOrNot = "is";
                                    emailAddress = emailAddress.address;
                                } else {
                                    var isOrNot = "isempty";
                                    emailAddress = "";
                                }
                                log.debug("companyName || emailAddress", companyName + " || " + emailAddress);
                                var customerSearchObj = search.create({
                                    type: "customer",
                                    filters: [
                                        ["entityid", "is", companyName],
                                        "AND",
                                        ["email", isOrNot, emailAddress]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            sort: search.Sort.DESC,
                                            label: "Internal ID"
                                        }),
                                        search.createColumn({
                                            name: "altname",
                                            label: "Name"
                                        }),
                                        search.createColumn({
                                            name: "email",
                                            label: "Email"
                                        }),
                                        search.createColumn({
                                            name: "phone",
                                            label: "Phone"
                                        })
                                    ]
                                });
                                var searchResultCount = customerSearchObj.runPaged().count;
                                log.debug("Customer Search Result Count", searchResultCount)
                                var customerInternalId = '';
                                var flagCreateUpdate = "";
                                customerSearchObj.run().each(function(result) {
                                    customerInternalId = result.getValue("internalid");
                                    flagCreateUpdate = "update";
                                    customerInternalId = createUpdateCustomerRcdProject(CONTACT_data, emailAddress, flagCreateUpdate, customerInternalId); //UPDATE CUSTOMER
                                    return false;
                                });
                                if (!customerInternalId) {
                                    flagCreateUpdate = "create";
                                    customerInternalId = createUpdateCustomerRcdProject(CONTACT_data, emailAddress, flagCreateUpdate, customerInternalId); //CREATE CUSTOMER
                                }
                                ////////////// **END** FIND CUSTOMER ////////////////
                                projectObj.setValue("parent", customerInternalId); //CUSTOMER (PARENT)
                                /////////// CREATING ASSET IF NOT AVAILABLE /////////////
                                if (customerInternalId > 0) {
                                    var customrecord_nx_assetSearchObj = search.create({
                                        type: "customrecord_nx_asset",
                                        filters: [
                                            ["custrecord_nx_asset_customer", "anyof", customerInternalId]
                                        ],
                                        columns: [
                                            search.createColumn({
                                                name: "internalid",
                                                label: "Internal ID"
                                            }),
                                            search.createColumn({
                                                name: "name",
                                                sort: search.Sort.ASC,
                                                label: "Name"
                                            }),
                                            search.createColumn({
                                                name: "custrecord_nx_asset_serial",
                                                label: "Serial"
                                            }),
                                            search.createColumn({
                                                name: "custrecord_nx_asset_customer",
                                                label: "Customer"
                                            }),
                                            search.createColumn({
                                                name: "custrecord_nx_asset_address",
                                                label: "Address Select"
                                            }),
                                            search.createColumn({
                                                name: "custrecord_nx_asset_region",
                                                label: "Region"
                                            })
                                        ]
                                    });
                                    var searchResultCount = customrecord_nx_assetSearchObj.runPaged().count;
                                    log.debug("Asset Search Result Count", searchResultCount)
                                    var assetRcdId = '';
                                    customrecord_nx_assetSearchObj.run().each(function(result) {
                                        assetRcdId = result.getValue("internalid");
                                        return false;
                                    });
                                    if (!searchResultCount) {
                                        assetRcdId = createAssetRecord(customerInternalId);
                                    }
                                }
                                // log.debug("Asset ID To Set", assetRcdId)
                                if (assetRcdId) {
                                    projectObj.setValue("custentity_nx_asset", assetRcdId); //ASSET
                                }
                                /////////// **END** CREATING ASSET IF NOT AVAILABLE /////////////
                                ////////// SET OFFICE LOCATION ////////////
                                var subsidiarySelectId = projectObj.getValue("subsidiary");
                                var locationSearchObj = search.create({
                                    type: "location",
                                    filters: [
                                        ["subsidiary", "anyof", subsidiarySelectId],
                                        "AND",
                                        ["isinactive", "is", "F"]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "name",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        }),
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Internal Id"
                                        })
                                    ]
                                });
                                var searchResultCount = locationSearchObj.runPaged().count;
                                log.debug("locationSearchObj result count", searchResultCount);
                                locationSearchObj.run().each(function(result) {
                                    projectObj.setValue("custentity_cp_prj_location", result.getValue("internalid")); //OFFICE LOCATION
                                    return false;
                                });
                                ////////// **END** SET OFFICE LOCATION ////////////
                                log.debug("After Customer && Asset && Office Location Filed", "After Customer && Asset Field && Office Location");
                                //////// MANDATORY FIELD //////////
                                projectObj.setValue("custentity_nx_project_type", 1); //TYPE
                                projectObj.setValue("category", 1); //CATEGORY
                                projectObj.setValue("custentity_cp_project_class_new", 8); //PROJECT CLASS
                                //////// **END** MANDATORY FIELD //////////
                            }
                            projectObj.setValue("custentity_cp_prj_claim_no", COVERAGE_LOSS_data.claimNumber); //CLAIM NUMBER
                            projectObj.setValue("custentity_cp_prj_policy_no", COVERAGE_LOSS_data.policyNumber); //POLICY NUMBER
                            projectObj.setValue("custentity_cp_loss_description_new", lossOfDesc); //LOSS DESCRIPTION
                            projectObj.setText("jobtype", COVERAGE_LOSS_data.TOL.desc); //EVENT TYPE
                            if (MORTGAGES_data) {
                                if (MORTGAGES_data.MORTGAGE) {
                                    if (MORTGAGES_data.MORTGAGE.mortgagee == "Sample Mortgage Company") {
                                        projectObj.setText("custentity_cp_prj_mortgage_co", MORTGAGES_data.MORTGAGE.mortgagee); //MORTGAGE COMPANY
                                    }
                                }
                            }
                            var jobSize = jsonObj.XACTNET_INFO.jobSizeCode;
                            if (jobSize == 1) {
                                jobSize = 1;
                            } else if (jobSize == 2) {
                                jobSize = 2;
                            } else if (jobSize == 4) {
                                jobSize = 3;
                            } else if (jobSize == 8) {
                                jobSize = 4;
                            } else if (jobSize == 16) {
                                jobSize = 5;
                            } else if (jobSize == 32) {
                                jobSize = 6;
                            }
                            projectObj.setValue("custentity_cp_prj_job_size", jobSize); //JOB SIZE
                            if (ADM_data.dateReceived) {
                                projectObj.setText("startdate", sysDate(ADM_data.dateReceived)); //DATE RECEIVED
                            }
                            if (ADM_data.dateOfLoss) {
                                projectObj.setText("custentity_prj_date_of_loss", sysDate(ADM_data.dateOfLoss)); //DATE OF LOSS
                            }
                            var jobType = jsonObj.XACTNET_INFO.rotationTrade;
                            projectObj.setText("custentity_job_type", jobType); //JOB TYPE 
                            projectObj.setValue("projectexpensetype", -2); //PROJECT EXPENSE TYPE -> Direct Labor (Needs To Be Static A/T Client Req)
                            if (uniquedIdProject) {
                                projectObj.setValue("custentity_project_unique_id", uniquedIdProject); //Transaction Id
                            }
                            var projectRcdId = projectObj.save({
                                enableSourcing: true, //enables sourcing during record update
                                ignoreMandatoryFields: true
                            });
                            log.debug("projectRcdId Saved", projectRcdId);
                            ////////////// **END** CREATING/UPDATING PROJECT ////////////
                            if (projectRcdId) {
                                connection.move({
                                    from: '/OUT/' + zipFileName,
                                    to: '/OUT/OUT_ARCHIVE/Assignment/Success/' + zipFileName
                                })
                                log.debug('File moved in Folder :- Success !!');
                                email.send({
                                    author: author,
                                    recipients: recipient,
                                    subject: "Project Export Status",
                                    body: "Project created/updated successfully for the file " + zipFileName + " in Netsuite system. \n Please see the below Details: \n\n Project Internal Id: " + projectRcdId
                                });
                                var createUpdateRcdObj = {
                                    "Project": projectRcdId
                                }
                                allCreatedUpdateRecords.push(createUpdateRcdObj)
                            }
                        } catch (err) {
                            log.debug("ERROR zipFileName", zipFileName);
                            log.debug("RECORD CREATION ERROR", err);
                            if (projectRcdId) {
                                email.send({
                                    author: author,
                                    recipients: recipient,
                                    subject: "Project Export Status",
                                    body: "Project Created in netsuite successfully for file " + zipFileName + ", but get an error when uploading the file into success archive folder: \n" + err.message
                                });
                            } else {
                                connection.move({
                                    from: '/OUT/' + zipFileName,
                                    to: '/OUT/OUT_ARCHIVE/Assignment/Failure/' + zipFileName
                                });
                                log.debug('File moved in Folder :- Failure !!');
                                email.send({
                                    author: author,
                                    recipients: recipient,
                                    subject: "Project Export Status",
                                    body: "Project creation failed for the file " + zipFileName + ", because of following reason: \n" + err.message
                                });
                            }
                            log.debug('File moved in Folder :- Failure !!');
                        }
                    }
                }
                /////////// **END** CREATE PROJECTS ////////////////
                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                var list = connection.list({
                    path: '/OUT/'
                });
                for (var d = 0; currentScript.getRemainingUsage() > MinUsage && d < list.length; d++) {
                    ////////////// Check Script Usage & Time ///////////////////
                    var timeElapsed = (new Date().getTime() * 0.001) - (startTime * 0.001);
                    if (currentScript.getRemainingUsage() <= MinUsage || timeElapsed > 3500) {
                        break;
                    }
                    ////////////// **END** Check Script Usage & Time ///////////////////
                    var zipFileName = list[d].name;
                    var directory = list[d].directory;
                    var index = zipFileName.indexOf("Estimate_");
                    if (index != -1) {
                        log.debug("Remaining Usage || Remaining Time", currentScript.getRemainingUsage() + " || " + timeElapsed);
                        log.debug("list[" + d + "]", list[d]);
                        // log.debug("zipFileName || directory || index", zipFileName + " || " + directory + " || " + index);
                        var downloadedFile = connection.download({
                            directory: '/OUT/',
                            filename: zipFileName
                        });
                        downloadedFile.folder = estimateZipFileDownloadFolderId;
                        var zipFileDownloadId = downloadedFile.save();
                        log.debug("zipFileDownloadId", zipFileDownloadId);
                        var folderId = checkFolderNeedsToBeCreatedOrUpdatedForZipFile(zipFileName, estimateZipFileDownloadFolderId); //Create/Update Folder To Store all Fils Data(ZIP)
                        ///////////////// TO UNZIP ZIP FILE ///////////////////////////
                        let extensionMapping = {
                            'XML': file.Type.XMLDOC,
                            'PDF': file.Type.PDF,
                            'JPG': file.Type.JPGIMAGE
                        };
                        let plainTextTypes = [
                            file.Type.CSV,
                            file.Type.XMLDOC,
                            file.Type.HTMLDOC,
                            file.Type.PLAINTEXT,
                            file.Type.JSON
                        ];
                        let archiveFolder = zipFileDownloadId; //ZIP FILE ID FOR UNZIP
                        let zipFileObj = file.load(archiveFolder);
                        let bin = zipFileObj.getContents();
                        let ZipInstance = new JSZip(bin, {
                            base64: true
                        });
                        let GENERIC_ROUGHDRAFT_FileId = "";
                        let XACTDOC_FileId = "";
                        for (let fullPathFileName in ZipInstance.files) {
                            if (fullPathFileName.indexOf('.' !== -1)) {
                                let fileName = fullPathFileName.split('/').pop();
                                let fileExt = fileName.slice(-3).toUpperCase();
                                let netsuiteExt = extensionMapping[fileExt];
                                if (netsuiteExt) {
                                    let data = ZipInstance.file(fullPathFileName).asBinary();
                                    if (plainTextTypes.includes(netsuiteExt) === false) {
                                        data = JSZip.base64.encode(data);
                                    }
                                    let zippedFile = file.create({
                                        name: fileName,
                                        folder: folderId,
                                        contents: data,
                                        fileType: netsuiteExt
                                    });
                                    let zippedFileSaveId = zippedFile.save();
                                    // log.debug("zippedFileSaveId || fileName || netsuiteExt", zippedFileSaveId + " || " + fileName + " || " + netsuiteExt);
                                    if (fileName.includes("GENERIC_ROUGHDRAFT")) {
                                        GENERIC_ROUGHDRAFT_FileId = zippedFileSaveId;
                                    }
                                    if (fileName.includes("XACTDOC")) {
                                        XACTDOC_FileId = zippedFileSaveId;
                                    }
                                }
                            }
                        }
                        ///////////////// **END** TO UNZIP ZIP FILE ///////////////////////////
                        if (GENERIC_ROUGHDRAFT_FileId) {
                            try {
                                var fileObj = file.load({
                                    id: GENERIC_ROUGHDRAFT_FileId
                                });
                                var fileObj_XACTDOC = file.load({
                                    id: XACTDOC_FileId
                                });
                                var xmlData = fileObj.getContents();
                                var xmlData_XACTDOC = fileObj_XACTDOC.getContents();
                                var xmlObj = xmlMod.Parser.fromString({
                                    text: xmlData
                                });
                                var xmlObj_XACTDOC = xmlMod.Parser.fromString({
                                    text: xmlData_XACTDOC
                                });
                                var jsonObj = xmlToJson(xmlObj.documentElement);
                                var jsonObj_XACTDOC = xmlToJson(xmlObj_XACTDOC.documentElement);
                                var transactionId = jsonObj.transactionId;
                                // log.debug('Unique ID', transactionId);
                                var estimateInfo = jsonObj.COVERSHEET.ESTIMATE_INFO; //ESTIMATE INFO FROM XML DATA
                                /////////////// To Find DUPLICACY For **ESTIMATE** //////////////////
                                var estimateSearchObj = search.create({
                                    type: "estimate",
                                    filters: [
                                        ["type", "anyof", "Estimate"],
                                        "AND",
                                        ["custbody_rs_unique_id", "is", transactionId],
                                        "AND",
                                        ["mainline", "is", "T"]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            sort: search.Sort.DESC,
                                            label: "Internal ID"
                                        }),
                                        search.createColumn({
                                            name: "entity",
                                            label: "Name"
                                        }),
                                        search.createColumn({
                                            name: "tranid",
                                            label: "Document Number"
                                        }),
                                        search.createColumn({
                                            name: "subsidiary",
                                            label: "Subsidiary"
                                        })
                                    ]
                                });
                                var searchResultCount = estimateSearchObj.runPaged().count;
                                log.debug("Estimate searchResultCount || transactionId", searchResultCount + " || " + transactionId);
                                var internal_Id_to_update = '';
                                estimateSearchObj.run().each(function(result) {
                                    internal_Id_to_update = result.getValue("internalid");
                                    return false;
                                });
                                /////////////// ** END ** To Find DUPLICACY For **ESTIMATE** //////////////////
                                if (searchResultCount && internal_Id_to_update) {
                                    var recordObj = record.load({
                                        type: record.Type.ESTIMATE,
                                        id: internal_Id_to_update,
                                        isDynamic: true
                                    });
                                    var lineCount = recordObj.getLineCount({
                                        sublistId: 'item'
                                    });
                                    for (var i = 0; i < lineCount; i++) {
                                        recordObj.removeLine({
                                            sublistId: 'item',
                                            line: 0,
                                            ignoreRecalc: true
                                        });
                                    }
                                } else {
                                    var recordObj = record.create({
                                        type: record.Type.ESTIMATE,
                                        isDynamic: true
                                    });
                                    recordObj.setValue('customform', 210);
                                }
                                /////////////// CREATE/UPDATE CUSTOMER DETAILS //////////////////////////////////////
                                var uniqueForCustomer = estimateInfo.insuredName;
                                log.debug("uniqueForCustomer", uniqueForCustomer);
                                var recId = createUpdateCustomerRecord(uniqueForCustomer, transactionId);
                                recordObj.setValue('entity', recId);
                                /////////////// **END** CREATE/UPDATE CUSTOMER DETAILS //////////////////////////////////////
                                var jobSearchObj = search.create({
                                    type: "job",
                                    filters: [
                                        ["custentity_project_unique_id", "is", transactionId]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            sort: search.Sort.DESC,
                                            label: "Internal ID"
                                        })
                                    ]
                                });
                                var searchResultCount = jobSearchObj.runPaged().count;
                                jobSearchObj.run().each(function(result) {
                                    var projectIntId = result.getValue("internalid");
                                    recordObj.setValue('job', projectIntId); //PROJECT
                                    log.debug("project searchResultCount || projectIntId", searchResultCount + " || " + projectIntId);
                                    return false;
                                });
                                //////////////// CREATE/UPDATE LINE ITEMS OF ESTIMATE ///////////////////
                                log.debug("jsonObj.LINE_ITEM_DETAIL 727", jsonObj.LINE_ITEM_DETAIL);
                                var LINE_ITEM_DETAIL_GROUP = jsonObj.LINE_ITEM_DETAIL.GROUP; //Items
                                log.debug('LINE_ITEM_DETAIL_GROUP', LINE_ITEM_DETAIL_GROUP);
                                if (LINE_ITEM_DETAIL_GROUP.length) {
                                    for (var j = 0; j < LINE_ITEM_DETAIL_GROUP.length; j++) {
                                        var groupDescription = LINE_ITEM_DETAIL_GROUP[j].desc;
                                        log.debug('groupDescription', groupDescription);
                                        if (LINE_ITEM_DETAIL_GROUP[j].ITEMS) {
                                            var LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM = LINE_ITEM_DETAIL_GROUP[j].ITEMS.ITEM; //Items
                                            log.debug('LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM', LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM);
                                            log.debug('LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM length', LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.length);
                                            if (LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.length) {
                                                for (var i = 0; i < LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.length; i++) {
                                                    var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].cat + LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].sel;
                                                    log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                    var itemSearchObj = search.create({
                                                        type: "item",
                                                        filters: [
                                                            ["name", "haskeywords", itemUniqueIdOrName]
                                                        ],
                                                        columns: [
                                                            search.createColumn({
                                                                name: "internalid",
                                                                sort: search.Sort.DESC,
                                                                label: "Internal ID"
                                                            })
                                                        ]
                                                    });
                                                    var searchResultCount = itemSearchObj.runPaged().count;
                                                    log.debug("itemSearchObj result count", searchResultCount);
                                                    var itemId = '';
                                                    itemSearchObj.run().each(function(result) {
                                                        itemId = result.getValue("internalid");
                                                        return false;
                                                    });
                                                    if (!itemId) {
                                                        itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].desc, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].unit, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].act);
                                                    }
                                                    addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i]);
                                                }
                                            } else {
                                                var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.cat + LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.sel;
                                                log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                var itemSearchObj = search.create({
                                                    type: "item",
                                                    filters: [
                                                        ["name", "haskeywords", itemUniqueIdOrName]
                                                    ],
                                                    columns: [
                                                        search.createColumn({
                                                            name: "internalid",
                                                            sort: search.Sort.DESC,
                                                            label: "Internal ID"
                                                        })
                                                    ]
                                                });
                                                var searchResultCount = itemSearchObj.runPaged().count;
                                                log.debug("itemSearchObj result count", searchResultCount);
                                                var itemId = '';
                                                itemSearchObj.run().each(function(result) {
                                                    itemId = result.getValue("internalid");
                                                    return false;
                                                });
                                                if (!itemId) {
                                                    itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.desc, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.unit, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.act);
                                                }
                                                addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM);
                                            }
                                        }
                                        ////////////// IF ONE MORE GROUP IS THERE WITH ITEMS GROUP ////////////
                                        if (LINE_ITEM_DETAIL_GROUP[j].GROUPS) {
                                            var LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP = LINE_ITEM_DETAIL_GROUP[j].GROUPS.GROUP;
                                            if (LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP) {
                                                var LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP.ITEMS;
                                                if (LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS) {
                                                    var LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS.ITEM;
                                                    if (LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.length) {
                                                        for (var i = 0; i < LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.length; i++) {
                                                            var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].cat + LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].sel;
                                                            log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                            var itemSearchObj = search.create({
                                                                type: "item",
                                                                filters: [
                                                                    ["name", "haskeywords", itemUniqueIdOrName]
                                                                ],
                                                                columns: [
                                                                    search.createColumn({
                                                                        name: "internalid",
                                                                        sort: search.Sort.DESC,
                                                                        label: "Internal ID"
                                                                    })
                                                                ]
                                                            });
                                                            var searchResultCount = itemSearchObj.runPaged().count;
                                                            log.debug("itemSearchObj result count", searchResultCount);
                                                            var itemId = '';
                                                            itemSearchObj.run().each(function(result) {
                                                                itemId = result.getValue("internalid");
                                                                return false;
                                                            });
                                                            if (!itemId) {
                                                                itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].desc, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].unit, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].act);
                                                            }
                                                            addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i]);
                                                        }
                                                    } else {
                                                        var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.cat + LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.sel;
                                                        log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                        var itemSearchObj = search.create({
                                                            type: "item",
                                                            filters: [
                                                                ["name", "haskeywords", itemUniqueIdOrName]
                                                            ],
                                                            columns: [
                                                                search.createColumn({
                                                                    name: "internalid",
                                                                    sort: search.Sort.DESC,
                                                                    label: "Internal ID"
                                                                })
                                                            ]
                                                        });
                                                        var searchResultCount = itemSearchObj.runPaged().count;
                                                        log.debug("itemSearchObj result count", searchResultCount);
                                                        var itemId = '';
                                                        itemSearchObj.run().each(function(result) {
                                                            itemId = result.getValue("internalid");
                                                            return false;
                                                        });
                                                        if (!itemId) {
                                                            itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.desc, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.unit, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.act);
                                                        }
                                                        addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    var groupDescription = LINE_ITEM_DETAIL_GROUP.desc;
                                    log.debug('groupDescription', groupDescription);
                                    if (LINE_ITEM_DETAIL_GROUP.ITEMS) {
                                        var LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM = LINE_ITEM_DETAIL_GROUP.ITEMS.ITEM; //Items
                                        log.debug('LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM', LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM);
                                        log.debug('LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM length', LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.length);
                                        if (LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.length) {
                                            for (var i = 0; i < LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.length; i++) {
                                                var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].cat + LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].sel;
                                                log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                var itemSearchObj = search.create({
                                                    type: "item",
                                                    filters: [
                                                        ["name", "haskeywords", itemUniqueIdOrName]
                                                    ],
                                                    columns: [
                                                        search.createColumn({
                                                            name: "internalid",
                                                            sort: search.Sort.DESC,
                                                            label: "Internal ID"
                                                        })
                                                    ]
                                                });
                                                var searchResultCount = itemSearchObj.runPaged().count;
                                                log.debug("itemSearchObj result count", searchResultCount);
                                                var itemId = '';
                                                itemSearchObj.run().each(function(result) {
                                                    itemId = result.getValue("internalid");
                                                    return false;
                                                });
                                                if (!itemId) {
                                                    itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].desc, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].unit, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i].act);
                                                }
                                                addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM[i]);
                                            }
                                        } else {
                                            var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.cat + LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.sel;
                                            log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                            var itemSearchObj = search.create({
                                                type: "item",
                                                filters: [
                                                    ["name", "haskeywords", itemUniqueIdOrName]
                                                ],
                                                columns: [
                                                    search.createColumn({
                                                        name: "internalid",
                                                        sort: search.Sort.DESC,
                                                        label: "Internal ID"
                                                    })
                                                ]
                                            });
                                            var searchResultCount = itemSearchObj.runPaged().count;
                                            log.debug("itemSearchObj result count", searchResultCount);
                                            var itemId = '';
                                            itemSearchObj.run().each(function(result) {
                                                itemId = result.getValue("internalid");
                                                return false;
                                            });
                                            if (!itemId) {
                                                itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.desc, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.unit, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.act);
                                            }
                                            addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM);
                                        }
                                    }
                                    ////////////// IF ONE MORE GROUP IS THERE WITH ITEMS GROUP ////////////
                                    if (LINE_ITEM_DETAIL_GROUP.GROUPS) {
                                        var LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP = LINE_ITEM_DETAIL_GROUP.GROUPS.GROUP;
                                        if (LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP) {
                                            var LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP.ITEMS;
                                            if (LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS) {
                                                var LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS.ITEM;
                                                if (LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.length) {
                                                    for (var i = 0; i < LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.length; i++) {
                                                        var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].cat + LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].sel;
                                                        log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                        var itemSearchObj = search.create({
                                                            type: "item",
                                                            filters: [
                                                                ["name", "haskeywords", itemUniqueIdOrName]
                                                            ],
                                                            columns: [
                                                                search.createColumn({
                                                                    name: "internalid",
                                                                    sort: search.Sort.DESC,
                                                                    label: "Internal ID"
                                                                })
                                                            ]
                                                        });
                                                        var searchResultCount = itemSearchObj.runPaged().count;
                                                        log.debug("itemSearchObj result count", searchResultCount);
                                                        var itemId = '';
                                                        itemSearchObj.run().each(function(result) {
                                                            itemId = result.getValue("internalid");
                                                            return false;
                                                        });
                                                        if (!itemId) {
                                                            itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].desc, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].unit, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i].act);
                                                        }
                                                        addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM[i]);
                                                    }
                                                } else {
                                                    var itemUniqueIdOrName = LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.cat + LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.sel;
                                                    log.debug("itemUniqueIdOrName", itemUniqueIdOrName);
                                                    var itemSearchObj = search.create({
                                                        type: "item",
                                                        filters: [
                                                            ["name", "haskeywords", itemUniqueIdOrName]
                                                        ],
                                                        columns: [
                                                            search.createColumn({
                                                                name: "internalid",
                                                                sort: search.Sort.DESC,
                                                                label: "Internal ID"
                                                            })
                                                        ]
                                                    });
                                                    var searchResultCount = itemSearchObj.runPaged().count;
                                                    log.debug("itemSearchObj result count", searchResultCount);
                                                    var itemId = '';
                                                    itemSearchObj.run().each(function(result) {
                                                        itemId = result.getValue("internalid");
                                                        return false;
                                                    });
                                                    if (!itemId) {
                                                        itemId = createItem(itemUniqueIdOrName, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.desc, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.unit, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM.act);
                                                    }
                                                    addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_GROUPS_GROUP_ITEMS_ITEM);
                                                }
                                            }
                                        }
                                    }
                                }
                                //////////////// **END** CREATE/UPDATE LINE ITEMS OF ESTIMATE ///////////////////
                                if (transactionId) {
                                    recordObj.setValue('custbody_rs_unique_id', transactionId);
                                }
                                var recId = recordObj.save();
                                log.debug('Your record has been CREATED/UPDATED', recId);
                                // allCreatedUpdateRecords.push(recId);
                                if (recId) {
                                    connection.move({
                                        from: '/OUT/' + zipFileName,
                                        to: '/OUT/OUT_ARCHIVE/Estimate/Success/' + zipFileName
                                    })
                                    log.debug('File moved in Folder :- Success !!');
                                    email.send({
                                        author: author,
                                        recipients: recipient,
                                        subject: "Estimate Export Status",
                                        body: "Estimate created/updated successfully for the file " + zipFileName + " in Netsuite system. \n Please see the below Details: \n\n Transaction Id: " + transactionId + "\n Estimate Internal Id: " + recId
                                    });
                                    var createUpdateRcdObj = {
                                        "Estimate": recId
                                    }
                                    allCreatedUpdateRecords.push(createUpdateRcdObj)
                                }
                            } catch (err) {
                                log.debug("ERROR : zipFileName || GENERIC_ROUGHDRAFT_FileId", zipFileName + " || " + GENERIC_ROUGHDRAFT_FileId);
                                log.debug("RECORD CREATION ERROR", err);
                                if (recId) {
                                    email.send({
                                        author: author,
                                        recipients: recipient,
                                        subject: "Estimate Export Status",
                                        body: "Estimate Created in netsuite successfully for file " + zipFileName + ", but get an error when uploading the file into success archive folder: \n" + err.message
                                    });
                                } else {
                                    connection.move({
                                        from: '/OUT/' + zipFileName,
                                        to: '/OUT/OUT_ARCHIVE/Estimate/Failure/' + zipFileName
                                    })
                                    log.debug('File moved in Folder :- Failure !!');
                                    email.send({
                                        author: author,
                                        recipients: recipient,
                                        subject: "Estimate Export Status",
                                        body: "Estimate creation failed for the file " + zipFileName + ", because of following reason: \n" + err.message
                                    });
                                }
                            }
                        }
                    }
                }
                log.debug('allCreatedUpdateRecords', allCreatedUpdateRecords);
            } catch (err) {
                log.debug("ERROR :- ", err);
                log.debug('allCreatedUpdateRecords', allCreatedUpdateRecords);
            }
        }

        function createAssetRecord(customerInternalId) {
            try {
                var assetRcdObj = record.create({
                    type: 'customrecord_nx_asset',
                    isDynamic: true
                });
                assetRcdObj.setValue('custrecord_nx_asset_customer', customerInternalId); //CUSTOMER
                assetRcdObj.setValue('custrecord_nxc_na_asset_type', 1); //ASSET TYPE
                var customerSearchObj = search.create({
                    type: "customer",
                    filters: [
                        ["internalid", "anyof", customerInternalId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "altname",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "email",
                            label: "Email"
                        }),
                        search.createColumn({
                            name: "address",
                            label: "Address"
                        }),
                        search.createColumn({
                            name: "addressinternalid",
                            sort: search.Sort.DESC,
                            label: "Address Internal ID"
                        })
                    ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("ADDRESS ID searchResultCount", searchResultCount);
                customerSearchObj.run().each(function(result) {
                    var addressinternalid = result.getValue('addressinternalid');
                    if (addressinternalid) {
                        assetRcdObj.setValue('custrecord_nx_asset_address', addressinternalid); //ADDRESS SELECT
                        return false;
                    }
                    return true;
                });
                var assetRcdId = assetRcdObj.save();
                log.debug("Asset Created ID :- ", assetRcdId);
                return assetRcdId;
            } catch (err) {
                log.debug("Asset not Created Reason", err.message);
                var assetRcdId = '';
                return assetRcdId;
            }
        }

        function createUpdateCustomerRcdProject(CONTACT_data, emailAddress, flagCreateUpdate, customerInternalId) {
            if (flagCreateUpdate == "update") {
                log.debug("Customer Updating ID", customerInternalId);
                var customerObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerInternalId,
                    isDynamic: true
                }); //CUSTOMER NAME & EMAIL ALREADY THERE i.e, NO NEED TO UPDATE IT.
                if (CONTACT_data.CONTACTMETHODS) {
                    if (CONTACT_data.CONTACTMETHODS.PHONE) {
                        if (CONTACT_data.CONTACTMETHODS.PHONE.length) {
                            var homePhNo = false;
                            var phoneData = CONTACT_data.CONTACTMETHODS.PHONE;
                            for (var e = 0; e < phoneData.length; e++) {
                                if (phoneData[e].type == "Home") {
                                    homePhNo = true;
                                    customerObj.setValue('phone', phoneData[e].number);
                                }
                            }
                            if (homePhNo == false) {
                                customerObj.setValue('phone', phoneData[0].number);
                            }
                        } else {
                            customerObj.setValue('phone', CONTACT_data.CONTACTMETHODS.PHONE.number);
                        }
                    }
                }
            } else {
                log.debug("Customer Creating", "Customer Creating");
                var customerObj = record.create({
                    type: record.Type.CUSTOMER,
                    isDynamic: true
                });
                customerObj.setValue('companyname', CONTACT_data.name);
                if (emailAddress != '') {
                    customerObj.setValue('email', emailAddress);
                }
                // customerObj.setValue('phone', CONTACT_data.CONTACTMETHODS.PHONE[0].number);
                if (CONTACT_data.CONTACTMETHODS) {
                    if (CONTACT_data.CONTACTMETHODS.PHONE) {
                        if (CONTACT_data.CONTACTMETHODS.PHONE.length) {
                            customerObj.setValue('phone', CONTACT_data.CONTACTMETHODS.PHONE[0].number);
                        } else {
                            customerObj.setValue('phone', CONTACT_data.CONTACTMETHODS.PHONE.number);
                        }
                    }
                }
                customerObj.setValue('subsidiary', 1);
                if (CONTACT_data.ADDRESSES) {
                    var addresses = CONTACT_data.ADDRESSES.ADDRESS;
                    for (var l = 0; l < addresses.length; l++) {
                        customerObj.selectNewLine({
                            sublistId: 'addressbook'
                        });
                        var addressSubrecord = customerObj.getCurrentSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress'
                        });
                        addressSubrecord.setValue({
                            fieldId: 'country',
                            value: addresses[l].country
                        });
                        addressSubrecord.setValue({
                            fieldId: 'state',
                            value: addresses[l].state
                        });
                        addressSubrecord.setValue({
                            fieldId: 'city',
                            value: addresses[l].city
                        });
                        addressSubrecord.setValue({
                            fieldId: 'zip',
                            value: addresses[l].postal
                        });
                        addressSubrecord.setValue({
                            fieldId: 'addr1',
                            value: addresses[l].addr1
                        });
                        customerObj.commitLine({
                            sublistId: 'addressbook'
                        });
                    }
                }
            }
            var customerRcdId = customerObj.save({
                enableSourcing: true, //enables sourcing during record update
                ignoreMandatoryFields: true
            });
            log.debug("Customer Created/Updated ID :- ", customerRcdId);
            return customerRcdId;
        }

        function createUpdateCustomerRecord(uniqueForCustomer, transactionId) {
            ////////// DUPLICAY CHECK CUSTOMER ////////
            var customerSearchObj = search.create({
                type: "customer",
                filters: [
                    ["entityid", "is", uniqueForCustomer]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            log.debug("customerSearchObj result count", searchResultCount);
            var internal_Id_to_update = '';
            customerSearchObj.run().each(function(result) {
                internal_Id_to_update = result.getValue("internalid");
                return false;
            });
            // var addresses = customer_data.ADDRESSES.ADDRESS;
            if (searchResultCount && internal_Id_to_update) {
                log.debug("Customer Update ID", internal_Id_to_update);
                var customerObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: internal_Id_to_update,
                    isDynamic: true
                });
            } else {
                log.debug("Customer Creating", "Customer Creating");
                var customerObj = record.create({
                    type: record.Type.CUSTOMER,
                    isDynamic: true
                });
                // customerObj.setValue('custentity_rs_unique_id', transactionId);
                customerObj.setValue('companyname', uniqueForCustomer);
                // customerObj.setValue('phone', phones.phone);
                customerObj.setValue('subsidiary', 1);
            }
            // var addressSubrecord = customerObj.getCurrentSublistSubrecord({
            // sublistId: 'addressbook',
            // fieldId: 'addressbookaddress'
            // });
            // addressSubrecord.setValue({
            // fieldId: 'addr1',
            // value: addresses.street
            // });
            // addressSubrecord.setValue({
            // fieldId: 'state',
            // value: addresses.state
            // });
            // addressSubrecord.setValue({
            // fieldId: 'city',
            // value: addresses.state
            // });
            // addressSubrecord.setValue({
            // fieldId: 'zip',
            // value: addresses.zip
            // });
            // customerObj.commitLine({
            // sublistId: 'addressbook'
            // });
            var recId = customerObj.save();
            log.debug('Customer Record CREATED/UPDATED', recId);
            return recId;
        }

        function checkFolderNeedsToBeCreatedOrUpdatedForZipFile(zipFileName, estimateZipFileDownloadFolderId) {
            //////////////// CHECK FOLDER TO STORE UNZIP FILES //////////////////
            var folderSearchObj = search.create({
                type: "folder",
                filters: [
                    ["name", "is", zipFileName]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });
            var searchResultCount = folderSearchObj.runPaged().count;
            var folderId = '';
            folderSearchObj.run().each(function(result) {
                folderId = result.getValue("internalid");
                return false;
            });
            if (!folderId) {
                var objRecord = record.create({
                    type: record.Type.FOLDER,
                    isDynamic: true
                });
                objRecord.setValue('name', zipFileName);
                objRecord.setValue('parent', estimateZipFileDownloadFolderId);
                var folderId = objRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }
            return folderId;
            //////////////// **END** CHECK FOLDER TO STORE UNZIP FILES //////////////////
        }

        function addLineItems(recordObj, itemId, groupDescription, LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM) {
            recordObj.selectNewLine({
                sublistId: 'item'
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: itemId
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_group_description',
                value: groupDescription
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.desc
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.qty ? LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.qty.replace(",", "") : ''
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: (LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.total / LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.qty).toFixed(2)
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_sales_tax',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.tax ? LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.tax.replace(",", "") : ''
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_rcv',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.rcvTotal ? LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.rcvTotal.replace(",", "") : ''
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_acv',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.acvTotal ? LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.acvTotal.replace(",", "") : ''
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_sel',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.sel
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_category',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.cat
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_labor_total',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.laborTotal ? LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.laborTotal.replace(",", "") : ''
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_re_material',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.material ? LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.material.replace(",", "") : ''
            });
            recordObj.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_rs_act',
                value: LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.act
            });
            ////////////// FIND & SET ACTIVITY CODE //////////////
            var customrecord831SearchObj = search.create({
                type: "customrecord831",
                filters: [
                    ["custrecord_bpmcpa_code", "is", LINE_ITEM_DETAIL_GROUP_ITEMS_ITEM.cat]
                ],
                columns: [
                    search.createColumn({
                        name: "custrecord_bpmcpa_description",
                        sort: search.Sort.ASC,
                        label: "Activity Code"
                    })
                ]
            });
            var searchResultCount = customrecord831SearchObj.runPaged().count;
            log.debug("customrecord831SearchObj result count", searchResultCount);
            var activityCode = "";
            customrecord831SearchObj.run().each(function(result) {
                activityCode = result.getValue("custrecord_bpmcpa_description");
                return false;
            });
            recordObj.setCurrentSublistText({
                sublistId: 'item',
                fieldId: 'cseg_paactivitycode',
                text: activityCode
            });
            ////////////// **END** FIND & SET ACTIVITY CODE //////////////
            recordObj.commitLine({
                sublistId: 'item'
            });
        }

        function createItem(itemUniqueIdOrName, displayNameCode, unit, act) {
            if (act == "+" || act == "R" || act == "&" || act == "F" || act == "M") {
                var itemObj = record.create({
                    type: "noninventoryitem",
                    isDynamic: true
                });
            } else {
                var itemObj = record.create({
                    type: "serviceitem",
                    isDynamic: true
                });
            }
            // itemObj.setValue("customform", -210);
            itemObj.setValue("itemid", itemUniqueIdOrName);
            itemObj.setValue("displayname", displayNameCode);
            itemObj.setText("unitstype", unit);
            itemObj.setValue("subsidiary", 1);
            itemObj.setValue("includechildren", true);
            itemObj.setValue("expenseaccount", 464);
            itemObj.setValue("taxschedule", 2);
            itemObj.setValue("isfulfillable", false);
            var itemId = itemObj.save();
            return itemId;
        }

        function xmlToJson(xmlNode) {
            // Create the return object
            var obj = Object.create(null);
            if (xmlNode.nodeType == xmlMod.NodeType.ELEMENT_NODE) { // element
                // do attributes
                if (xmlNode.hasAttributes()) {
                    obj = Object.create(null);
                    for (var j in xmlNode.attributes) {
                        if (xmlNode.hasAttribute({
                                name: j
                            })) {
                            obj[j] = xmlNode.getAttribute({
                                name: j
                            });
                        }
                    }
                }
            }
            // do children
            if (xmlNode.hasChildNodes()) {
                for (var i = 0, childLen = xmlNode.childNodes.length; i < childLen; i++) {
                    var childItem = xmlNode.childNodes[i];
                    var nodeName = childItem.nodeName;
                    if (nodeName in obj) {
                        if (!Array.isArray(obj[nodeName])) {
                            obj[nodeName] = [
                                obj[nodeName]
                            ];
                        }
                        obj[nodeName].push(xmlToJson(childItem));
                    } else {
                        obj[nodeName] = xmlToJson(childItem);
                    }
                }
            }
            return obj;
        }

        function sysDate(date) {
            try {
                if (date.includes("T")) {
                    var date = date.split("T")[0];
                }
                var dateArr = date.split("-");
                var rtnDate = Number(dateArr[1]) + "/" + Number(dateArr[2]) + "/" + Number(dateArr[0]);
                return rtnDate;
            } catch (err) {
                return '';
            }
        }
        return {
            execute: execute
        };
    });