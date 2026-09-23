import {comparisons} from './comparables.js?v=20260923n';
import {t} from './locale.js?v=20260923n';
export const objects = [
 {id:'bed',name:'Polsterbetten',quantity:2,detail:'Zwei Betten · Gepolstertes Kopfteil',min:null,max:null,state:'safe',platform:'Kleinanzeigen',reason:'Kategorie im 3D-Modell bestätigt. Hersteller, Breite und Material sind nicht belegt.',query:'Polsterbett 90x200 grau',nodes:[3,4,5,22,23,24],anchor:[-11.9533,16.05,.65],icon:'bed',comparables:[]},
 {id:'nightstand',name:'Nachttisch',quantity:1,detail:'Holzoptik · Schubladen',min:null,max:null,state:'safe',platform:'Kleinanzeigen',reason:'Nachttisch im Modell eindeutig. Das Holz und der Hersteller sind nicht bestätigt.',query:'Nachttisch Holz Schubladen',nodes:[41,42,43],anchor:[-10.2533,16.831,.55],icon:'table',comparables:[]},
 {id:'lamp',name:'Tischleuchte',quantity:1,detail:'Grauer Fuß · Heller Stoffschirm',min:null,max:null,state:'safe',platform:'Kleinanzeigen',reason:'Leuchtenkategorie im Modell bestätigt. Material und Modell bleiben ungesichert.',query:'Tischlampe grau Stoffschirm',nodes:[365,366,367],anchor:[-10.2533,16.8765,1.15],icon:'lamp',comparables:[]},
 {id:'chair',name:'Polsterstuhl',quantity:1,detail:'Stuhl am Schreibtisch · Identität offen',min:null,max:null,state:'probable',platform:null,reason:'Ein Stuhl ist im Modell benannt. Ohne hinreichend passenden Vergleich bleibt die Bewertung offen.',query:'Polsterstuhl grau',nodes:[60,61,62],anchor:[-7.0107,12.901,.7],icon:'chair',comparables:[]},
 {id:'ottoman',name:'Polsterbank / Ottoman',quantity:1,detail:'Gepolstertes Möbel am Bettende',min:null,max:null,state:'probable',platform:null,reason:'Formähnliche Zuordnung. Maße, Konstruktion und Produktidentität sind unbestätigt.',query:'Polsterbank grau',nodes:[402,403,404],anchor:[-10.2543,14.5705,.3858],icon:'chair',comparables:[]},
 {id:'desk',name:'Schreibtisch / Konsole',quantity:1,detail:'Holzoptik · Modellgruppe zusammengefasst',min:null,max:null,state:'probable',platform:'Kleinanzeigen',reason:'Schreibtisch und Konsole sind im Modell zusammengefasst. Vergleichsangebote dienen der Orientierung, nicht der Teilsumme.',query:'Schreibtisch Holz Schubladen Metallbeine',nodes:[644,645,646],anchor:[-10.26,13.02,.8],icon:'table',comparables:[]},
 {id:'curtain',name:'Vorhänge',quantity:1,detail:'Fenstertextilien · Maße offen',min:null,max:null,state:'probable',platform:'Kleinanzeigen',reason:'Vorhänge sind als Modellteil zugeordnet. Anzahl, Maße, Material und Zustand bleiben offen.',query:'Vorhänge grau blickdicht 2 Stück',nodes:[79,80,81],anchor:[-13.86,16.33,.61],icon:'unknown',comparables:[]},
 {id:'vase',name:'Dekovase / Gefäß',quantity:1,detail:'Dekoratives Gefäß · Material offen',min:null,max:null,state:'probable',platform:'Kleinanzeigen',reason:'Die Gefäßform ist sichtbar. Material, Größe und mögliche Marke sind nicht gesichert.',query:'Deko Vase grau Keramik',nodes:[313,314,315],anchor:[-4.99,15.11,1.11],icon:'unknown',comparables:[]},
 {id:'ceiling',name:'Deckenleuchte',quantity:1,detail:'Deckenlicht · Stückzahl offen',min:null,max:null,state:'probable',platform:'Kleinanzeigen',reason:'Deckenlicht ist einem Modellteil zugeordnet. Zahl und Bauart der Leuchten sind nicht eindeutig.',query:'Deckenleuchte rund modern grau',nodes:[332,333,334],anchor:[-5.25,15.13,2.85],icon:'lamp',comparables:[]},
 {id:'cabinet',name:'Wandmöbel / Paneel',quantity:1,detail:'Festes Wandelement · Funktion offen',min:null,max:null,state:'unknown',platform:'Kleinanzeigen',reason:'Das Wandelement ist im Modell greifbar; ob es ein separates Möbel ist, bleibt offen. Kein Vergleichswert.',query:'Wandpaneel Kopfteil Schlafzimmer',nodes:[421,422,423],anchor:[-10.25,12.51,1.1],icon:'table',comparables:[]},
 {id:'plant',name:'Topfpflanze',quantity:1,detail:'Pflanze mit Gefäß · Art offen',min:null,max:null,state:'probable',platform:'Kleinanzeigen',reason:'Eine Topfpflanze ist erkennbar. Pflanzenart, Echtheit und Topfmaterial lassen sich nicht belegen.',query:'Topfpflanze Zimmerpflanze mit Übertopf',nodes:[459,460,461,475],anchor:[-7.83,12.78,1.12],icon:'unknown',comparables:[]},
 {id:'unknown',name:'TV / Wandobjekte',quantity:1,detail:'Mehrere Elemente in einem Modellteil',min:null,max:null,state:'unknown',platform:'Kleinanzeigen',reason:'TV, Bilder und Leuchte sind zu einer Modellgruppe verbunden. Eine eindeutige Einzelbewertung ist deshalb nicht möglich.',query:'Fernseher 32 Zoll Wandbild',nodes:[440,441,442],anchor:[-7.57,12.41,2],icon:'unknown',comparables:[]}
];
for(const o of objects){
 o.comparables=comparisons[o.id]??[];
 if(['bed','nightstand','lamp'].includes(o.id)){
   const ranged=o.comparables.filter(c=>c.useInRange!==false);
   o.min=Math.min(...ranged.map(c=>c.price));o.max=Math.max(...ranged.map(c=>c.price));
   o.method=`Min–Max aus ${ranged.length} verlinkten gebrauchten Vergleichsangeboten, jeweils pro Stück. Die Stichprobe ist erweitert, aber nicht repräsentativ; es handelt sich um Angebotspreise und keine statistische Marktwertschätzung.`;
   if(o.id==='bed')o.method+=' Die Spanne verwendet graue Polsterbetten mit 90 × 200 cm Liegefläche, ohne Matratze; die Modellmaße sind nicht bestätigt.';
 }else if(o.id==='ottoman')o.method='Nur ein grob ähnliches Vergleichsangebot. Daraus wird keine Preisspanne berechnet; der Ottoman bleibt außerhalb der bewerteten Teilsumme.';
 else if(o.id==='chair')o.method='Zwei allgemeine Stuhlvergleiche zur Orientierung. Die visuelle Übereinstimmung zum Modell ist unzureichend bestätigt; deshalb bleibt der Stuhl unbewertet.';
}
const indicativeRanges={
 desk:{min:20,max:60,includeInTotal:false},
 curtain:{min:8,max:20},
 vase:{min:9,max:12},
 ceiling:{min:10,max:20},
 plant:{min:20,max:30}
};
for(const [id,range] of Object.entries(indicativeRanges)){
 const o=objects.find(item=>item.id===id);
 o.min=range.min;o.max=range.max;
 if(range.includeInTotal===false)o.includeInTotal=false;
 o.method=`Indicative range from ${o.comparables.filter(c=>c.useInRange!==false).length} linked asking prices. The category is only probable; size, condition and exact identity are unknown.`;
}
for(const o of objects){
 o.priceUnit={bed:'unitPiece',nightstand:'unitPiece',lamp:'unitPiece',chair:'unitPiece',ottoman:'unitPiece',desk:'unitListing',curtain:'unitPairSet',vase:'unitVase',ceiling:'unitFixture',plant:'unitPlantPot'}[o.id]??'unitPiece';
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
export const total = rows => rows.reduce((s,o)=>({min:s.min+(o.min!==null&&o.includeInTotal!==false?o.min*(o.quantity??1):0),max:s.max+(o.max!==null&&o.includeInTotal!==false?o.max*(o.quantity??1):0),count:s.count+(o.min!==null&&o.includeInTotal!==false?(o.quantity??1):0)}),{min:0,max:0,count:0});
export const marketLink = o => o.platform === 'eBay' ? `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(o.query)}` : `https://www.kleinanzeigen.de/s-${encodeURIComponent(o.query.toLowerCase().replaceAll(' ','-'))}/k0`;
export const furniture = {chair:{name:'Lounge 01',type:'Sessel',price:249,size:'78 × 82 × 86 cm',width:.78,depth:.82,height:.86},table:{name:'Circle 02',type:'Beistelltisch',price:89,size:'60 × 60 × 45 cm',width:.6,depth:.6,height:.45},pouf:{name:'Mellow 03',type:'Polsterhocker',price:129,size:'52 × 52 × 44 cm',width:.52,depth:.52,height:.44}};
