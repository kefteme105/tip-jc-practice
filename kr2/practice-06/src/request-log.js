// Диагностический режим для воспроизводимой проверки КР2.
if (new URLSearchParams(location.search).has('kr2')) {
  const style=document.createElement('style');
  style.textContent='body{min-width:1100px} main{max-width:1100px} .task-list{display:grid;grid-template-columns:repeat(3,1fr)} .task-card{padding:12px}';
  document.head.append(style);
  const nativeFetch = window.fetch.bind(window);
  const section = document.createElement('section');
  section.style.cssText = 'position:sticky;bottom:0;background:#fff;border-top:2px solid #234;padding:10px 24px;z-index:20;font:14px monospace;max-height:180px;overflow:auto';
  const title=document.createElement('strong'); title.textContent='Журнал фактических HTTP-запросов';
  const clear=document.createElement('button');clear.textContent='Очистить журнал';clear.style.marginLeft='20px';
  const out=document.createElement('pre');out.id='request-log';clear.onclick=()=>out.textContent='';
  section.append(title,clear,out);document.body.append(section);
  window.fetch=async (url,options={})=>{
    const response=await nativeFetch(url,options);
    out.textContent+=`${options.method??'GET'} ${url} → ${response.status}\n`;
    return response;
  };
}
