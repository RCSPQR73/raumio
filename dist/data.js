import {comparisons} from './comparables.js?v=20260923c';
import {t} from './locale.js?v=20260923c';
export const objects = [
 {id:'bed',name:'Polsterbetten',quantity:2,detail:'Zwei Betten · Gepolstertes Kopfteil',min:null,max:null,state:'safe',platform:'Kleinanzeigen',reason:'Kategorie im 3D-Modell bestätigt. Hersteller, Breite und Material sind nicht belegt.',query:'Polsterbett 90x200 grau',nodes:[3,4,5,22,23,24],anchor:[-11.9533,16.05,.65],icon:'bed',comparables:[]},
 {id:'nightstand',name:'Nachttisch',quantity:1,detail:'Holzoptik · Schubladen',min:null,max:null,state:'safe',platform:'Kleinanzeigen',reason:'Nachttisch im Modell eindeutig. Das Holz und der Hersteller sind nicht bestätigt.',query:'Nachttisch Holz Schubladen',nodes:[41,42,43],anchor:[-10.2533,16.831,.55],icon:'table',comparables:[]},
 {id:'lamp',name:'Tischleuchte',quantity:1,detail:'Grauer Fuß · Heller Stoffschirm',min:null,max:null,state:'safe',platform:'Kleinanzeigen',reason:'Leuchtenkategorie im Modell bestätigt. Material und Modell bleiben ungesichert.',query:'Tischlampe grau Stoffschirm',nodes:[365,366,367],anchor:[-10.2533,16.8765,1.15],icon:'lamp',comparables:[]},
 {id:'chair',name:'Polsterstuhl',quantity:1,detail:'Stuhl am Schreibtisch · Identität offen',min:null,max:null,state:'probable',platform:null,reason:'Ein Stuhl ist im Modell benannt. Ohne hinreichend passenden Vergleich bleibt die Bewertung offen.',query:'Polsterstuhl grau',nodes:[60,61,62],anchor:[-7.0107,12.901,.7],icon:'chair',comparables:[]},
 {id:'ottoman',name:'Polsterbank / Ottoman',quantity:1,detail:'Gepolstertes Möbel am Bettende',min:null,max:null,state:'probable',platform:null,reason:'Formähnliche Zuordnung. Maße, Konstruktion und Produktidentität sind unbestätigt.',query:'Polsterbank grau',nodes:[402,403,404],anchor:[-10.2543,14.5705,.3858],icon:'chair',comparables:[]},
 {id:'unknown',name:'TV / Wandobjekte',quantity:1,detail:'Mehrere Elemente in einem Modellteil',min:null,max:null,state:'unknown',platform:null,reason:'TV, Bilder und Lampe sind zu einer Modellgruppe verbunden. Eine eindeutige Einzelbewertung ist deshalb nicht möglich.',query:'',nodes:[440,441,442,644,645,646],anchor:[-9.4,12.45,1.5],icon:'unknown',comparables:[]}
];
for(const o of objects){
 o.comparables=comparisons[o.id]??[];
 if(['bed','nightstand','lamp'].includes(o.id)){
   const ranged=o.comparables.filter(c=>c.useInRange!==false);
   o.min=Math.min(...ranged.map(c=>c.price));o.max=Math.max(...ranged.map(c=>c.price));
   o.method=`Min–Max aus ${ranged.length} verlinkten gebrauchten Vergleichsangeboten, jeweils pro Stück. Die Stichprobe ist erweitert, aber nicht repräsentativ; es handelt sich um Angebotspreise und keine statistische Marktwertschätzung.`;
   if(o.id==='bed')o.method+=' Beide Vergleichsangebote ohne Matratze. Bettwäsche und Matratzen des Modellraums sind nicht bewertet.';
 }else if(o.id==='ottoman')o.method='Nur ein grob ähnliches Vergleichsangebot. Daraus wird keine Preisspanne berechnet; der Ottoman bleibt außerhalb der bewerteten Teilsumme.';
 else if(o.id==='chair')o.method='Zwei allgemeine Stuhlvergleiche zur Orientierung. Die visuelle Übereinstimmung zum Modell ist unzureichend bestätigt; deshalb bleibt der Stuhl unbewertet.';
}
for(const o of objects.filter(o=>o.id==='chair'||o.id==='ottoman')){
 const ranged=o.comparables.filter(c=>c.useInRange!==false);
 o.min=Math.min(...ranged.map(c=>c.price));o.max=Math.max(...ranged.map(c=>c.price));o.platform='Kleinanzeigen';
 o.method=`Orientierungsspanne aus ${ranged.length} ähnlichen Kleinanzeigen-Angeboten. Die Möbelkategorie ist nur wahrscheinlich zugeordnet; Form, Maße, Zustand und Hersteller können abweichen.`;
 o.reason=o.id==='chair'?'Wahrscheinlicher Polsterstuhl am Schreibtisch. Vergleichspreise dienen nur als grobe Orientierung; die konkrete Identität bleibt offen.':'Wahrscheinliche Polsterbank beziehungsweise Ottoman am Bettende. Vergleichspreise dienen nur als grobe Orientierung; Maße und Konstruktion bleiben offen.';
}
export const euro = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export const price = o => o.min === null ? t('valuationOpen') : `${o.min}–${o.max} €`;
export const stateLabel = o => o.state === 'safe' ? t('categorySafe') : o.state === 'probable' ? t('probable') : t('identityOpen');
export const total = rows => rows.reduce((s,o)=>({min:s.min+(o.min??0)*(o.quantity??1),max:s.max+(o.max??0)*(o.quantity??1),count:s.count+(o.min!==null?(o.quantity??1):0)}),{min:0,max:0,count:0});
export const marketLink = o => o.platform === 'eBay' ? `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(o.query)}` : `https://www.kleinanzeigen.de/s-${encodeURIComponent(o.query.toLowerCase().replaceAll(' ','-'))}/k0`;
export const furniture = {chair:{name:'Lounge 01',type:'Sessel',price:249,size:'78 × 82 × 86 cm',width:.78,depth:.82,height:.86},table:{name:'Circle 02',type:'Beistelltisch',price:89,size:'60 × 60 × 45 cm',width:.6,depth:.6,height:.45}};
