// Native selects retain the existing settings flow; visible buttons expose it.
export function createChoiceButtons(select,choices,label){
 const group=document.createElement('div');group.className='choice-buttons';group.setAttribute('role','radiogroup');group.setAttribute('aria-label',label);
 select.hidden=true;select.after(group);
 for(const choice of choices){const button=document.createElement('button');button.type='button';button.textContent=choice.label;button.dataset.value=String(choice.value);button.setAttribute('role','radio');button.addEventListener('click',()=>{if(select.disabled)return;select.value=String(choice.value);select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));sync();});group.append(button);}
 function sync(){for(const button of group.children){const checked=button.dataset.value===select.value;button.setAttribute('aria-checked',String(checked));button.classList.toggle('selected',checked);button.disabled=select.disabled;}}
 select.addEventListener('input',sync);select.addEventListener('change',sync);sync();return {group,sync};
}
