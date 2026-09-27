/**
 * AL-AQSA BURMESE SHOP — Google Apps Script backend
 * Deploy as Web App: Execute as Me, Who has access: Anyone.
 * IMPORTANT: Keep this Apps Script project private. Do not paste secrets into frontend code.
 * Run initialize() once after creating the Google Sheet.
 */
const DEFAULT_USER='mtausif004';
const DEFAULT_PASS='fkfk004';
const SESSION_TTL=21600; // 6 hours
function props_(){return PropertiesService.getScriptProperties();}
function json_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function sha_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8).map(b=>(b<0?b+256:b).toString(16).padStart(2,'0')).join('');}
function initialize(){
  const p=props_();
  if(!p.getProperty('ADMIN_USER_HASH')) p.setProperty('ADMIN_USER_HASH',sha_(DEFAULT_USER));
  if(!p.getProperty('ADMIN_PASS_HASH')) p.setProperty('ADMIN_PASS_HASH',sha_(DEFAULT_PASS));
  if(!p.getProperty('SHEET_ID')) throw new Error('Set SHEET_ID in Script Properties first.');
  const ss=SpreadsheetApp.openById(p.getProperty('SHEET_ID'));
  const names=['Orders','Order Items','Logs'];
  const headers={Orders:['Order ID','Timestamp','Customer Name','Phone','Address','Zone','Note','Subtotal','Discount','Delivery','Grand Total','Status','Updated'], 'Order Items':['Order ID','Product ID','Product Name','Qty','Unit Price','Discount','Line Total'],'Logs':['Timestamp','Event','Details']};
  names.forEach(n=>{let sh=ss.getSheetByName(n)||ss.insertSheet(n);if(sh.getLastRow()===0)sh.appendRow(headers[n]);});
  return 'Initialized';
}
function doPost(e){try{const b=JSON.parse(e.postData.contents||'{}');switch(b.action){case'login':return login_(b);case'createOrder':return createOrder_(b);case'listOrders':return auth_(b,()=>listOrders_());case'updateOrder':return auth_(b,()=>updateStatus_(b));case'editOrder':return auth_(b,()=>editOrder_(b));case'changeCredentials':return auth_(b,()=>changeCreds_(b));default:return json_({ok:false,message:'Unknown action'});}}catch(err){return json_({ok:false,message:String(err.message||err)});}}
function login_(b){const p=props_();if(sha_(b.userId)!==p.getProperty('ADMIN_USER_HASH')||sha_(b.password)!==p.getProperty('ADMIN_PASS_HASH'))return json_({ok:false,message:'Invalid User ID or Password'});const token=Utilities.getUuid()+'-'+Utilities.getUuid();CacheService.getScriptCache().put('sess_'+token,b.userId,SESSION_TTL);return json_({ok:true,sessionToken:token});}
function auth_(b,fn){const token=b.sessionToken||'',user=CacheService.getScriptCache().get('sess_'+token);if(!user)throw new Error('Session expired. Please login again.');return fn();}
function ss_(){return SpreadsheetApp.openById(props_().getProperty('SHEET_ID'));}
function createOrder_(b){
  if(!b.customer||!b.customer.name||!b.customer.phone||!b.customer.address)throw new Error('Customer information incomplete');
  const sh=ss_().getSheetByName('Orders'), itemsSh=ss_().getSheetByName('Order Items');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const tz=Session.getScriptTimeZone()||'Asia/Dhaka', now=new Date(), date=Utilities.formatDate(now,tz,'yyyyMMdd');
    const prefix='AQ-'+date+'-'; let seq=1; const last=sh.getLastRow(); if(last>1){const ids=sh.getRange(2,1,last-1,1).getValues().flat().filter(Boolean);const nums=ids.filter(x=>String(x).startsWith(prefix)).map(x=>Number(String(x).slice(prefix.length))).filter(n=>n>0);if(nums.length)seq=Math.max.apply(null,nums)+1;}
    const orderId=prefix+String(seq).padStart(4,'0'); const items=b.items||[]; const subtotal=items.reduce((a,i)=>a+Number(i.lineTotal||0),0);const discount=Number(b.discount||0),delivery=Number(b.deliveryCharge||0),total=Math.max(0,subtotal-discount+delivery);const stamp=Utilities.formatDate(now,tz,'yyyy-MM-dd HH:mm:ss');
    sh.appendRow([orderId,stamp,b.customer.name,b.customer.phone,b.customer.address,b.customer.zone||'',b.customer.note||'',subtotal,discount,delivery,total,'New',stamp]);
    items.forEach(i=>itemsSh.appendRow([orderId,i.productId||'',i.productName||'',Number(i.qty||0),Number(i.unitPrice||0),Number(i.discount||0),Number(i.lineTotal||0)]));
    log_('CREATE_ORDER',orderId);telegram_(orderId,b.customer,items,subtotal,discount,delivery,total);return json_({ok:true,orderId});
  }finally{lock.releaseLock();}
}
function listOrders_(){const ss=ss_(),sh=ss.getSheetByName('Orders'),it=ss.getSheetByName('Order Items');if(sh.getLastRow()<2)return json_({ok:true,orders:[]});const vals=sh.getRange(2,1,sh.getLastRow()-1,13).getValues();const iv=it&&it.getLastRow()>1?it.getRange(2,1,it.getLastRow()-1,7).getValues():[];const orders=vals.map(r=>({orderId:r[0],timestamp:r[1],customerName:r[2],phone:r[3],address:r[4],zone:r[5],note:r[6],subtotal:r[7],discount:r[8],delivery:r[9],grandTotal:r[10],status:r[11],updated:r[12],items:iv.filter(x=>x[0]===r[0]).map(x=>({productId:x[1],productName:x[2],qty:x[3],unitPrice:x[4],discount:x[5],lineTotal:x[6]}))}));return json_({ok:true,orders});}
function updateStatus_(b){const sh=ss_().getSheetByName('Orders'),row=findRow_(sh,b.orderId);if(row<2)throw new Error('Order not found');sh.getRange(row,12).setValue(b.status);sh.getRange(row,13).setValue(new Date());log_('STATUS',b.orderId+' -> '+b.status);return json_({ok:true});}
function editOrder_(b){const sh=ss_().getSheetByName('Orders'),row=findRow_(sh,b.orderId);if(row<2)throw new Error('Order not found');const p=b.patch||{};if(p.note!==undefined)sh.getRange(row,7).setValue(p.note);if(p.deliveryCharge!==undefined)sh.getRange(row,10).setValue(Number(p.deliveryCharge||0));if(p.discount!==undefined)sh.getRange(row,9).setValue(Number(p.discount||0));const subtotal=Number(sh.getRange(row,8).getValue()||0),discount=Number(sh.getRange(row,9).getValue()||0),delivery=Number(sh.getRange(row,10).getValue()||0);sh.getRange(row,11).setValue(Math.max(0,subtotal-discount+delivery));sh.getRange(row,13).setValue(new Date());return json_({ok:true});}
function changeCreds_(b){const p=props_();if(sha_(b.currentPassword)!==p.getProperty('ADMIN_PASS_HASH'))throw new Error('Current Password is incorrect');if(b.newUserId)p.setProperty('ADMIN_USER_HASH',sha_(b.newUserId));if(b.newPassword)p.setProperty('ADMIN_PASS_HASH',sha_(b.newPassword));return json_({ok:true});}
function findRow_(sh,id){const vals=sh.getRange(2,1,Math.max(0,sh.getLastRow()-1),1).getValues().flat();const i=vals.findIndex(x=>String(x)===String(id));return i<0?-1:i+2;}
function log_(event,details){const sh=ss_().getSheetByName('Logs');if(sh)sh.appendRow([new Date(),event,details]);}
function telegram_(orderId,c,items,subtotal,discount,delivery,total){const p=props_(),token=p.getProperty('TELEGRAM_BOT_TOKEN'),chat=p.getProperty('TELEGRAM_CHAT_ID');if(!token||!chat)return;const lines=['🛒 NEW ORDER','Order ID: '+orderId,'','Customer: '+c.name,'Phone: '+c.phone,'Zone: '+c.zone,'Address: '+c.address,'','Items:',...items.map(i=>'• '+i.productName+' ['+i.productId+'] × '+i.qty+' = ৳'+Number(i.lineTotal||0).toLocaleString('en-BD')),'','Subtotal: ৳'+subtotal.toLocaleString('en-BD'),'Discount: ৳'+discount.toLocaleString('en-BD'),'Delivery: ৳'+delivery.toLocaleString('en-BD'),'TOTAL: ৳'+total.toLocaleString('en-BD'),'Status: New'];if(c.note)lines.push('','Note: '+c.note);UrlFetchApp.fetch('https://api.telegram.org/bot'+encodeURIComponent(token)+'/sendMessage',{method:'post',contentType:'application/json',payload:JSON.stringify({chat_id:chat,text:lines.join('\n')}),muteHttpExceptions:true});}
