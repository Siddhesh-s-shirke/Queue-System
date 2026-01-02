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
  queue[current].finalWait=Date.now()-queue[current].arrival;
  queue[current].status="Done";
 }
 let next=queue.findIndex(q=>q.status==="Waiting"&&q.priority==="Priority");
 if(next===-1) next=queue.findIndex(q=>q.status==="Waiting");
 if(next!==-1){
  current=next;
  queue[current].status="Serving";
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
 let csv="Token,Name,Service,Priority,Date,Time,Waited,Estimated,Status\n";
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
 let q=search.value.toLowerCase();

 queue.forEach((x,i)=>{
  if(q && !(x.name.toLowerCase().includes(q) || String(x.token).includes(q))) return;

  let d=new Date(x.arrival);
  let waited=x.status==="Done"?format(x.finalWait):format(Date.now()-x.arrival);

  table.innerHTML+=`
   <tr>
    <td>${x.token}</td>
    <td>${x.name}</td>
    <td>${x.service}</td>
    <td class="${x.priority==="Priority"?"priority":""}">${x.priority}</td>
    <td>${d.toLocaleDateString()}</td>
    <td>${d.toLocaleTimeString()}</td>
    <td>${waited}</td>
    <td>${estimated(i)}</td>
    <td class="status-${x.status.toLowerCase()}">${x.status}</td>
   </tr>`;
 });

 currentText.innerText =
  current>=0 ? `${queue[current].name} (Token ${queue[current].token})` : "None";
}

setInterval(render,1000);
render();
