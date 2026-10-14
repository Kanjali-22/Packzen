import { mockupCategories } from './categories';
import { getTemplateIdForCategory } from './templates/boxTemplates';
const palettes=['#c8a77b','#efb6b7','#beded1','#c5b4e8','#eccf8c','#b6d9ec','#f2cf55','#a3d9cb','#e9b6d1','#d5b272','#9dbde8','#b395d8'];
const labels=['Studio','Minimal','Premium','Natural','Everyday'];
export const mockups=Array.from({length:72},(_,i)=>{const c=mockupCategories[i%mockupCategories.length];const n=i+1;return {id:n,slug:`${c.slug}-${n}-mockup`,title:`${labels[i%5]} ${c.name} mockup`,category:c.slug,type:i%3===0?'3D':'Product',premium:i%4===0,rating:(4.5+(i%5)/10).toFixed(1),tags:[c.name.toLowerCase(),'packaging',i%2?'branding':'retail'],color:palettes[i%palettes.length],editorTemplateId:getTemplateIdForCategory(c.slug)}});
