"""Reproduce verified Wikimedia assets and attribution. Network access required. No runtime API dependency."""
import json,urllib.request,urllib.parse,pathlib,time,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
headers={'User-Agent':'DeccanTableDemo/1.0 (local educational demo)'}
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=45) as r:return r.read()
def api(params):return json.loads(get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(dict(params,format='json'))))
def credit(id,filename,info):
 ext=info.get('extmetadata',{});lic=ext.get('LicenseShortName',{}).get('value','')
 if not any(x in lic for x in ['CC','Public domain']):raise Exception('Unapproved license '+lic)
 return {'id':id,'file':id+'.jpg','source':info.get('descriptionurl',''),'original':filename,'license':lic,'artist':ext.get('Artist',{}).get('value',''),'licenseUrl':ext.get('LicenseUrl',{}).get('value',''),'verified':False}
if '--restore-alfredo' in sys.argv:
 data=api({'action':'query','titles':'File:Fettuccine Alfredo originals.jpg','prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':'500'})
 info=next(iter(data['query']['pages'].values()))['imageinfo'][0]
 (ROOT/'public/images/dishes/alfredo.jpg').write_bytes(get(info.get('thumburl',info['url'])))
 entries=json.loads((ROOT/'public/images/dishes/credits.json').read_text(encoding='utf-8'));entries=[e for e in entries if e['id']!='alfredo'];entries.append(credit('alfredo','Fettuccine Alfredo originals.jpg',info));(ROOT/'public/images/dishes/credits.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2),encoding='utf-8');print('Restored white-sauce Alfredo photograph');sys.exit()

existing={'alfredo':'Fettuccine_Alfredo_originals.jpg','dosa':'Masala_Dosa_2023.jpg','idli':'Idli_Sambar.JPG','uttapam':'Mini_Uttappam.jpg','pizza':'Neapolitan_pizza_at_Trappica_(48701940197).jpg','arrabbiata':'Penne_Arrabbiata.jpg','garlicbread':'Garlicbread.jpg','chole':'Chana_masala.jpg','naan':'Annapurna_Naan.jpg','sandwich':'Classic_Grilled_Cheese_Sandwich_(25791331763)_(cropped).jpg','brownie':'Chocolatebrownie.JPG','icecream':'Vanilla_Ice_Cream_Cone_at_Camp_Manitoulin.jpg','gulab':'Gulab-jamun-wallpaper-1.jpg'}
choices={'podi':('Ghee podi idli',0),'hakka':('Veg Hakka noodles',2),'chillipaneer':('Chilli paneer',0),'dal':('Dal tadka',0),'vegbiryani':('Hyderabadi vegetable biryani',2),'chickenbiryani':('Hyderabadi chicken biryani',2),'jeerarice':('Jeera rice',1),'punugulu':('Punugulu',0),'fries':('Peri peri fries',2),'chai':('Irani chai',1),'coffee':('Cold coffee milk',1),'lemonade':('Fresh lime soda',0),'salad':('Mediterranean salad',0),'paneer':('Paneer butter masala',0),'friedrice':('Schezwan rice -egg -triple',2),'burger':('Vegetarian burger',3),'manchurian':('Veg Manchurian',2)}
if '--final-assets' not in sys.argv:
 print('Run python scripts/fetch-images.py --final-assets to rebuild source assets. Then run node scripts/prepare-images.mjs after visual review.');sys.exit()
credits=[]
pages=api({'action':'query','titles':'|'.join('File:'+f for f in existing.values()),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':'500'})['query']['pages']
byname={p['title'].replace('File:','').replace('_',' '):p for p in pages.values()}
for id,filename in existing.items():
 try:
  info=byname[filename.replace('_',' ')]['imageinfo'][0];credits.append(credit(id,filename,info))
  if not (ROOT/'public/images/dishes'/(id+'.jpg')).exists():(ROOT/'public/images/dishes'/(id+'.jpg')).write_bytes(get(info.get('thumburl',info['url'])))
 except Exception as e:print(id,str(e),flush=True)
for id,(query,index) in choices.items():
 try:
  entry=json.loads((ROOT/'scripts'/(query.replace(' ','-')+'.json')).read_text(encoding='utf-8'))[index];info=entry['info'];c=credit(id,entry['file'],info)
  if id in ['coffee','vegbiryani','alfredo','friedrice','manchurian'] or not (ROOT/'public/images/dishes'/(id+'.jpg')).exists():
   (ROOT/'public/images/dishes'/(id+'.jpg')).write_bytes(get(info.get('thumburl',info['url'])))
  credits.append(c);print('Recorded',id,flush=True)
 except Exception as e:print('PLACEHOLDER',id,str(e),flush=True)
 (ROOT/'public/images/dishes/credits.json').write_text(json.dumps(credits,ensure_ascii=False,indent=2),encoding='utf-8');time.sleep(2)
