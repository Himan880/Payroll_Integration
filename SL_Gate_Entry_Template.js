/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
 define(['N/record', 'N/render', 'N/search', "N/runtime"], function (record, render, search, runtime) {
    
    function onRequest(context) {
        //var rec_id = context.request.parameters.recordid;
      
 var xmlTemplateFile ='<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
'<pdf>'+
'<head>'+
'	<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
'	<#if .locale == "zh_CN">'+
'		<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
'	<#elseif .locale == "zh_TW">'+
'		<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
'	<#elseif .locale == "ja_JP">'+
'		<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
'	<#elseif .locale == "ko_KR">'+
'		<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
'	<#elseif .locale == "th_TH">'+
'		<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
'	</#if>'+
'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }'+
'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
'td { padding: 4px 6px; }'+
'b { font-weight: bold; color: #333333; }'+
'</style>'+
'</head>'+
'<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">'+
'    <table border="1" style="width:100%; border-color:rgb(0,0,0);border-collapse:collapse;" >'+
'            <tr>'+
'            <td style="border-color: rgb(0,0,0);width: 30%;"><img src="http://6810795-sb1.shop.netsuite.com/core/media/media.nl?id=3489&c=&h=EB-Zc9L5bEhzIA0JV9O21dN9Gf3LCvhu0i4jm85tWaj8FcXg" style="width:130px; height:80px; float: left; margin: 7px;" /></td>'+
'<td style="border-color:rgb(0,0,0);width:20%;margin-center:20px;align:center;font-size:9px;"><br/>${companyinformation.mainaddress_text}</td>'+
'              <td style="border-color:rgb(0,0,0);width:70%;margin-center:25px;margin-top;color:blue;"><span style="font-family:verdana,geneva,sans-serif;font-size:20px;font-color:rgb(70,130,180);"><strong>Material Gate Pass</strong></span><br/>${record.name}</td>'+
'	</tr>  </table>'+
'    <table border="1" style="width:100%; border-collapse:collapse;border-top:0px;">'+
'    <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Purchase Order</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_purchase_order?keep_after(\'Purchase Order\')}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Vehicle Type</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%" >${record.custrecord_vehicle_type}</td></tr>'+
'      <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Po Date</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_po_date}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b> Vehicle Number</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%" >${record.custrecord_vehicle_number}</td></tr>'+
'       <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Date Created</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.created}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b> Material Description</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%" >${record.custrecord_material_description}</td></tr>'+
'        <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Subsidiary</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_subsidiary}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b> Gate pass date</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%"> ${record.custrecord_gate_pass_date}</td></tr>'+
'      <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Vendor</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord163}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b> Invoice No.</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%">${record.custrecord_evage_gatepassvendorinvoice}</td></tr>'+
'      <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Location</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_location}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>  Invoice Date</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%">${record.custrecord_gatevendorinvoicedate}</td></tr>'+
'        <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Remark</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_remark}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b> D.C.No.</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%">${record.custrecord_purchase_order?keep_after(\'Purchase Order\')}</td></tr>'+
'      <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Time In</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_time_in}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" > <b>D.C.Date</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%">${record.custrecord_po_date}</td></tr>'+
'        <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Time Out</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_time_out}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" ></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%"></td></tr>'+
'       <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Contact Number</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.phone}<br/><br/><br/></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" ></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%"></td></tr>'+
'        <tr>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ><b>Contact Person</b></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" >:</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;border-right:1px;" width="29%" >${record.custrecord_contact_person}</td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="20%" ></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="1%" ></td>'+
'      <td style="font-family:verdana,geneva,sans-serif;font-size:11px;border-bottom:0px;" width="29%"></td></tr>'+
'          </table>'+
'  <br/> <br/>'+
'  <table border="1" style="width:100%; border-collapse:collapse;border-top:1px;">'+
' '+
'   <thead>'+
'         <tr>'+
'         <th align="center" border="1"  rowspan="1" width="7%"  style="text-align: center; vertical-align: middle; background-color: rgb(224, 224, 224); border-color: rgb(0,0,0);"><span style="font-family:verdana,geneva,sans-serif;font-size:11px;color:#000000;"><span style="font-family:verdana,geneva,sans-serif;">Item</span></span></th>'+
'   <th align="left" border="1"   rowspan="1" width="30%" style="text-align: center; vertical-align: middle; background-color: rgb(224, 224, 224); border-color: rgb(0,0,0);border-left:0px;"><span style="color:#000000;"><span style="font-family:verd8a,geneva,sans-serif;font-size:11px;"><strong><span style="font-family:verdana,geneva,sans-serif;">Description</span></strong></span></span></th>'+
'    <th align="left" border="1"   rowspan="1" width="10%" style="text-align: center; vertical-align: middle; background-color: rgb(224, 224, 224); border-color: rgb(0,0,0);border-left:0px;"><span style="color:#000000;"><span style="font-family:verd8a,geneva,sans-serif;font-size:11px;"><strong><span style="font-family:verdana,geneva,sans-serif;">PO quantity</span></strong></span></span></th>'+
'  <th align="center" border="1"  rowspan="1"  width="7%"  style="text-align: center; vertical-align: middle; background-color: rgb(224, 224, 224);border-color: rgb(0,0,0);border-left:0px;"><span style="color:#000000;"><span style="font-family:verdana,geneva,sans-serif;font-size:11px;"><strong><span style="font-family:verdana,geneva,sans-serif;">Bill Quantity</span></strong></span></span></th>'+
'    </tr></thead>'+
' <#list record.customrecord_ctra_gate_pass_items as item>'+
'	<tr>'+
'        <td align="center" style="border-right:1px;border-bottom:0px;border-left:1px;"><span style="font-family:verdana,geneva,sans-serif;"><span style="font-family:verdana,geneva,sans-serif;font-size:11px;">${item.custrecord_ctra_gate_pass_item}</span></span></td>'+
'        <td align="left" style="border-right:1px;border-bottom:0px;"><span style="font-family:verdana,geneva,sans-serif;font-size:11px;">Test</span></td>'+
'     <td align="right" style="border-right:1px;border-bottom:0px;border-left:0px;"><span style="font-family:verdana,geneva,sans-serif;font-size:11px;">Test</span></td>'+
'      <td align="center" style="border-right:1px;border-bottom:0px;"><span style="font-family:verdana,geneva,sans-serif;font-size:11px;">Test</span></td>'+
'	  </tr>'+
'   </#list>'+
'    </table>'+
'</body>'+
'</pdf>';
	

        var tpl = xmlTemplateFile;
        var renderer = render.create();
        renderer.templateContent = tpl;
        log.debug({
            title: 'renderer',
            details: renderer
        });
        renderer.addRecord('record', po_rec)
        var invoicePdf = renderer.renderAsPdf();
        context.response.writeFile({
            file: invoicePdf,
            isInline: true
        });
    }
    return {
        onRequest: onRequest
    }
});
