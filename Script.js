window.myCPP = window.myCPP || {};
// document.getElementById("callerId").style.display = "none";
var _calltype="";
var _callcontactid="";
var _callernumber = "";
var _agentname = "";
var _tableintervalid = null;
var _customername = null;
var _customeraddress = null;

//replace with the CCP URL for the current Amazon Connect instance

var containerdiv = document.getElementById("containerdiv");
var callerid = document.getElementById("calleridselect").value;
var DispositionNotes = document.getElementById("DispositionNotes").value;
var DispositionCode = document.getElementById("DispositionCode").value;
console.log("disp notes :", DispositionNotes);
console.log("disp code :", DispositionCode);

var toggleswitch = document.querySelector(".switch");
var togglebutton = document.querySelector(".togglebutton");
var togglebutton2 = document.getElementById("togglebutton");

console.log("toggleswitch value", toggleswitch);
console.log("togglebutton value", togglebutton);
console.log("togglebutton value 2", togglebutton2);



console.log("caller id is", callerid)

var ccpUrl = "https://gnsvccteam.my.connect.aws/ccp-v2";
connect.core.initCCP(containerdiv, {
    ccpUrl: ccpUrl,
    loginPopup: true,
    loginPopupAutoClose: true,
    loginOptions: {
        autoClose: true
    },
    softphone: {
        allowFramedSoftphone: true
    },
    pageOptions: { //optional
        enableAudioDeviceSettings: true, //optional, defaults to 'false'
        enablePhoneTypeSettings: true //optional, defaults to 'true' 
    }
});

connect.contact(subscribeToContactEvents);

connect.agent(function (agent) {
    const w = window.open('', connect.MasterTopics.LOGIN_POPUP);
    if (w) {
        w.close()
    }
});

var contactidnew = "";
var callernumbernew = "";


function subscribeToContactEvents(contact) {
    window.myCPP.contact = contact;
    contact.onConnected(handledonConnected);
    // contact.onEnded(handleOnEnded);
    contact.onACW(handleACW);

    if (contact.isInbound() === false) {
        let setContactId = contact.getContactId();
        let status = contact.getContactId().status;
        console.log("status is: ", status);
        console.log("inside contact : ", contact);
        _callcontactid = setContactId;
        contactidnew = setContactId;
        _calltype = "Outbound";
		let callerNumber = contact.getActiveInitialConnection().getEndpoint().phoneNumber;
        console.log("callerNumber : " +callerNumber);
        callerNumber = callerNumber.replace(' ', '');
        _callernumber = ""+callerNumber;
        callernumbernew = ""+callerNumber;
        console.log("Entering IF statement");
        getcustomername(_callernumber,"Outgoing - Missed");
		// insertoutcallhistory(setContactId,_agentname,callerNumber,"Outgoing - Missed");
    }
    else{
        _calltype = "Inbound";
        let setContactId = contact.getContactId();
        _callcontactid = setContactId;
        contactidnew = setContactId;
		let callerNumber = contact.getActiveInitialConnection().getEndpoint().phoneNumber;
        callerNumber = callerNumber.replace(' ', '');
        _callernumber = callerNumber;
        callernumbernew = ""+callerNumber;
        console.log("Else statement")
        getcustomername(_callernumber,"Incoming - Missed");
        // insertoutcallhistory(setContactId,_agentname,callerNumber,"Incoming - Missed");
    }
        var callerid = document.getElementById("calleridselect").value;
        console.log("outside function callernumber2", callerid);
        getcallerid(callerid,_callcontactid);
      
}



async function getcallerid(callerid,_callcontactid)
{
    var requestOptions = {
        method: 'POST',
        redirect: 'follow'       
    };

    console.log("callerid", this.callerid);
    console.log("contactid",_callcontactid);

    await fetch("https://o2aso9zauc.execute-api.us-east-1.amazonaws.com/Latest/calleridupdate?callerid="+encodeURIComponent(callerid)+"&contactid="+encodeURIComponent(_callcontactid), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ updated Callerid --> "+result)} )
        .catch(error => console.log("@@ Error in callerid --> ", error));
        
        var calleriddropdown = document.getElementById("calleridselect");
        calleriddropdown.selectedIndex = 0;
}


function handledonConnected(contact) {
    if(_calltype == "Outbound"){
        //Createagentinteraction("Outgoing - Connected");
        Createcustomerinteraction("Outgoing - Connected");
        record();
        disposition();
        var attributeMap = contact.getAttributes();
        var custnum = JSON.stringify(attributeMap["Customer Number"]["value"]);
        var channel = JSON.stringify(attributeMap["Channel"]["value"]);
        var queuename = JSON.stringify(attributeMap["queuename"]["value"]);
        var contactid = JSON.stringify(attributeMap["contactid"]["value"]);
        var calltype = JSON.stringify(attributeMap["calltype"]["value"]);
        window.alert("Customer's Number: " + custnum + "\nCustomer's Channel : " + channel + "\nContact ID : "+ contactid + "\nQueue Name: "+queuename+ "\nCall Type :"+calltype);
    }
    else if(_calltype == "Inbound" )
    {
        //Createagentinteraction("Incoming - Connected");
        Createcustomerinteraction("Incoming - Connected");
        record();
        disposition();
        var attributeMap = contact.getAttributes();
        var custnum = JSON.stringify(attributeMap["Customer Number"]["value"]);
        var channel = JSON.stringify(attributeMap["Channel"]["value"]);
        var queuename = JSON.stringify(attributeMap["queuename"]["value"]);
        var contactid = JSON.stringify(attributeMap["contactid"]["value"]);
        var calltype = JSON.stringify(attributeMap["calltype"]["value"]);
        window.alert("Customer's Number: " + custnum + "\nCustomer's Channel : " + channel + "\nContact ID : "+ contactid + "\nQueue Name: "+queuename+ "\nCall Type :"+calltype);
    
    }
}


function handleACW(contact) {
    console.log("[contact.onEnded] Call has ended. Contact status is " + contact.getStatus().type);
    console.log("[contact.onEnded] Call has ended. Contact state is " + contact.getState().type);
    var status = contact.getStatus().type;
    document.getElementById("_toggle").style.display = "none";
    document.getElementById("_disposition").style.display = "block";
    
}


connect.agent(subscribeToAgentEvents);
function subscribeToAgentEvents(agent) {
    
    window.myCPP.agent = agent;
    let conf = agent.getConfiguration();
    
    _agentname = conf.username;
    // GetagentInteraction(_agentname);

    GetCustomerInteraction(_callernumber);

    ActivateDeactivateInterval(1);
    document.getElementById("_default").style.display = "none";
    document.getElementById("_callhistory").style.display = "block";
    
}


function custom_sort(a, b) {
    return new Date(b.CallDateTime).getTime() - new Date(a.CallDateTime).getTime();
}

function ActivateDeactivateInterval(_nextinterval){
    if(_nextinterval == 1)
    {
        //GetagentInteraction(_agentname);
        GetCustomerInteraction(_callernumber);
        if(_tableintervalid === null)
        { 
            _tableintervalid = setInterval(() => {
                //GetagentInteraction(_agentname);
                GetCustomerInteraction(_callernumber);
            }, 15000);
        }
    }
    if(_nextinterval == 0)
    {
        _tableintervalid = null;
        clearInterval(_tableintervalid);
    }
}



// New Functions for Demo Instance
/*
async function GetagentInteraction(_agentname)
{
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
        
    };
	
    await fetch("https://79sb2d0j4e.execute-api.us-east-1.amazonaws.com/CustomCCP/getagenthistory?agentname="+encodeURIComponent(_agentname), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ Captured Call History --> "+result); MakeRowandData(result)} )
        .catch(error => console.log("@@ Error while fecthing call history --> ", error));   
}
*/
/*
function MakeRowandData(_data){
    var elem = document.getElementById("callhisttabid");
	elem.innerHTML = "";
    _data = JSON.parse(_data);
	_data = _data.Items.sort(custom_sort);
    _data.forEach(element => {
        var node = document.createElement("tr");
        elem.appendChild(node);
        node.innerHTML +="<td>"+element.customername.toString()+"</td><td>"+element.phonenumber.toString()+"</td><td>"+element.address.toString()+"</td><td>"+element.calltype.toString()+"</td><td>"+(new Date (element.CallDateTime.toString()+ " UTC")).toLocaleString()+"</td>";

    });
}
*/

async function getcustomername(_phonenumber,_calltype)
{
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
        
    };
	
    await fetch("https://lchb977xie.execute-api.us-east-1.amazonaws.com/CustomCCP/getcustomername?phonenumber="+encodeURIComponent(_phonenumber), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ Captured customer name and address --> "+result);
            let resp = JSON.parse(result);
            _customername = resp.Items[0].customername.toString();
            _customeraddress = resp.Items[0].address.toString();
            // Createagentinteraction(_calltype);
  
            Createcustomerinteraction(_calltype);
        } )
        .catch(error => console.log("@@ Error while fecthing customer name and address --> ", error));   
}
/*
async function Createagentinteraction(_calltype)
{
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
        
    };
	
    await fetch("https://79sb2d0j4e.execute-api.us-east-1.amazonaws.com/CustomCCP/createinteraction?agentname="+encodeURIComponent(_agentname)+"&customername="+encodeURIComponent(_customername)+"&address="+encodeURIComponent(_customeraddress)+"&phonenumber="+encodeURIComponent(_callernumber)+"&calltype="+encodeURIComponent(_calltype)+"&contactid="+encodeURIComponent(_callcontactid), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ Captured Call History --> "+result);} )
        .catch(error => console.log("@@ Error while fecthing call history --> ", error));   
}
*/


async function GetCustomerInteraction(_customerphonenumber)
{
    
    console.log("number is :",_customerphonenumber);
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
        
    };
    console.log("cust num ", _customerphonenumber)
	var url_string = encodeURI("https://nn1iknxfz5.execute-api.us-east-1.amazonaws.com/default/getcustomer_callhistory?customerphonenumber='"+_customerphonenumber+"'")
    console.log("url string 2 - ", url_string)
    await fetch("https://nn1iknxfz5.execute-api.us-east-1.amazonaws.com/default/getcustomer_callhistory?customerphonenumber="+encodeURIComponent(_customerphonenumber), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ Captured Call History --> "+result); MakeRowandDataTwo(result)} )
        .catch(error => console.log("@@ Error while fecthing call history --> ", error));   
}


function MakeRowandDataTwo(_data){
    var elem = document.getElementById("callhisttabid");
	elem.innerHTML = "";
    _data = JSON.parse(_data);
	_data = _data.Items.sort(custom_sort);
    _data.forEach(element => {
        var node = document.createElement("tr");
        elem.appendChild(node);
        node.innerHTML +="<td>"+element.customername.toString()+"</td><td>"+element.customerphonenumber.toString()+"</td><td>"+element.address.toString()+"</td><td>"+element.calltype.toString()+"</td><td>"+(new Date (element.CallDateTime.toString()+ " UTC")).toLocaleString()+"</td>";

    });

}

// function showcustdetails(_customerphonenumber)
// {
//     var custnum = document.getElementById("custnum");
// 	elem.innerHTML = "";
//     _data = JSON.parse(_data);
//     console.log("hello from showcustdetails "+_data);
//     console.log(element.customerphonenumber);
// 	_data = _data.Items.sort(custom_sort);
//     _data.forEach(element => {
//         var node = document.createElement("td");
//         elem.appendChild(node);
//         node.innerHTML +="<td>"+element.customerphonenumber.toString()+"</td>";

//     });

// }


async function Createcustomerinteraction(_calltype)
{
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
        
    };
	
    await fetch("https://nn1iknxfz5.execute-api.us-east-1.amazonaws.com/default/createcustomerintercation?customerphonenumber="+encodeURIComponent(_callernumber)+"&customername="+encodeURIComponent(_customername)+"&address="+encodeURIComponent(_customeraddress)+"&calltype="+encodeURIComponent(_calltype)+"&contactid="+encodeURIComponent(_callcontactid), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ Captured Call History --> "+result)} )
        .catch(error => console.log("@@ Error while fecthing call history --> ", error));   
}

function disposition()
{
    document.getElementById("_disposition").style.display = "none";
    
}

function record()
{
    document.getElementById("_toggle").style.display = "block";
}


async function SubmitDisposition(DispositionNotes,DispositionCode)
{

    var requestOptions = {
        method: 'POST',
        redirect: 'follow'       
    };
	
    await fetch("https://ydub0ibiik.execute-api.us-east-1.amazonaws.com/Latest/updatedispositions?contactid="+encodeURIComponent(this.contactidnew)+"&callernumber="+encodeURIComponent(this.callernumbernew)+"&DispositionNotes="+encodeURIComponent(DispositionNotes)+"&DispositionCode="+encodeURIComponent(DispositionCode),requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log("@@ disposition inserted --> "+result)
            alert ("disposition entered successfully")
        } )
        .catch(error => 
            {
                console.log("@@ Error while insert disposition --> ", error)
                alert("disposition not inserted")
            }
            );   

    document.getElementById("DispositionNotes").value = "";
    var dropDown = document.getElementById("DispositionCode");
    dropDown.selectedIndex = 0;
    document.getElementById("_disposition").style.display = "none";
}

async function recordingstop()
{
    contactidnew = this.contactidnew
    console.log("testing recording button")
    console.log("contact id is", this.contactidnew);
    

    togglebutton2.addEventListener("change", async function (event) 
    {
        if (event.target.checked)  
        {
            contactidnew = contactidnew
            console.log("contactidnew", contactidnew)
            console.log("Checked");


            var requestOptions = {
                method: 'POST',
                redirect: 'follow'       
            };
                        
        await fetch("https://jgln0nmltb.execute-api.us-east-1.amazonaws.com/latest/resumecallrecording?contactid="+encodeURIComponent(contactidnew),requestOptions)
            .then(response => response.text())
            .then(result => {
                 console.log("@@ call recording stopped --> "+result)
            } )
            .catch(error => 
                {
                console.log("@@ call recording not stopped --> ", error)
                }
            );   
        } 
        
        else 
        {
            contactidnew = contactidnew
            console.log("Not checked");
            console.log("inside else recording condition");
        
                var requestOptions = {
                    method: 'POST',
                    redirect: 'follow'       
                };
                
            await fetch("https://jgln0nmltb.execute-api.us-east-1.amazonaws.com/latest/stopcallrecording?contactid="+encodeURIComponent(contactidnew),requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        console.log("@@ call recording resumed --> "+result)
                    } )
                    .catch(error => 
                        {
                            console.log("@@ call recording not resumed --> ", error)
                        }
                        );   
        }
    });

}

async function getsentiments(contactidnew)
{
    contactidnew = this.contactidnew
    console.log("sentiment contact id is ", contactidnew)
    console.log("testing sentiments button")

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
        
    };
	
    await fetch("https://ctg1796a97.execute-api.us-east-1.amazonaws.com/Latest/getsentiments?customerphonenumber&contactId="+encodeURIComponent(contactidnew), requestOptions)
        .then(response => response.text())
        .then(result => {console.log("@@ Captured sentiments --> "+result); sentidisplay(result)})
        .catch(error => console.log("@@ Error while fecthing sentiments --> ", error));   
}

function sentidisplay(_data){
    console.log("inside sentidisplay")
    var elem = document.getElementById("sentisummary");
	elem.innerHTML = "";
    _data = JSON.parse(result);
    console.log("result is ", _data)
	_data = _data.Items.sort(custom_sort);
    _data.forEach(element => {
        var node = document.createElement("tr");
        elem.appendChild(node);
        node.innerHTML +="<td>ContactID</td><td>"+element.contactidnew.toString()+"</td><td>Customer sentiment</td><td>"+element.calltype.toString()+"</td>";

    });

}

 



