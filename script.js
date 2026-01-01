const AVG_SERVICE_MIN = 3;

let queue = [];
let current = -1;

function addToken(){
 let n=pName.value.trim(), s=pService.value.trim();
 if(!n||!s) return alert("Fill all fields");

 queue.push({
  token:queue.length+1,
  name:n,
  service:s,
  priority:pPriority.value,
  arrival:Date.now(),
  finalWait:null,
  status:"Waiting"
 });

 pName.value=pService.value="";
 render();
}

function nextToken(){
 if(current>=0 && queue[current]){
  queue[current].finalWait = Date.now()-queue[current].arrival;
  queue[current].status="Done";
 }

 let next = queue.findIndex(q=>q.status==="Waiting" && q.priority==="Priority");
 if(next===-1) next = queue.findIndex(q=>q.status==="Waiting");

 if(next!==-1){
  current=next;
  queue[current].status="Serving";
  document.getElementById("beep").play();
 }

 render();
}

function skipToken(){
 if(current>=0) queue[current].status="Waiting";
 nextToken();
}

function resetQueue(){
 if(!confirm("Reset queue?")) return;
 queue=[]; current=-1; render();
}

function format(ms){
 let m=Math.floor(ms/60000), s=Math.floor(ms%60000/1000);
 return `${m}m ${s}s`;
}

function estimated(i){
 let ahead=queue.slice(0,i).filter(q=>q.status!=="Done").length;
 return `${ahead*AVG_SERVICE_MIN} min`;
}

function exportCSV(){
 let csv="Token,Name,Service,Priority,Arrival Date,Arrival Time,Waited,Estimated,Status\n";
 queue.forEach((q,i)=>{
  let d=new Date(q.arrival);
  let waited=q.status==="Done"?format(q.finalWait):format(Date.now()-q.arrival);
  csv+=`${q.token},${q.name},${q.service},${q.priority},${d.toLocaleDateString()},${d.toLocaleTimeString()},${waited},${estimated(i)},${q.status}\n`;
 });
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
 a.download="queue_report.csv";
 a.click();
}

function exportPDF(){
 window.print();
}

function render(){
 table.innerHTML="";
 queue.forEach((q,i)=>{
  let d=new Date(q.arrival);
  let waited=q.status==="Done"?format(q.finalWait):format(Date.now()-q.arrival);
  table.innerHTML+=`
   <tr>
    <td>${q.token}</td>
    <td>${q.name}</td>
    <td>${q.service}</td>
    <td class="${q.priority==="Priority"?"priority":""}">${q.priority}</td>
    <td>${d.toLocaleDateString()}</td>
    <td>${d.toLocaleTimeString()}</td>
    <td>${waited}</td>
    <td>${estimated(i)}</td>
    <td class="status-${q.status.toLowerCase()}">${q.status}</td>
   </tr>`;
 });

 currentText.innerText =
  current>=0 ? `${queue[current].name} (Token ${queue[current].token})` : "None";
}

setInterval(render,1000);
render();
