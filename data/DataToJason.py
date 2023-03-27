import pandas as pd
import json as js

def ReadData(path):
    df = pd.read_table(path) 
    
    links = df.set_index('Type de Lien').to_dict()['Couleur du Lien']
    houses = df.set_index('Type de Maison').to_dict()['Couleur de la Maison']
    return (links, houses)

def ReadLinks(path, links):
    df = pd.read_table(path)   
    df.rename(columns={"Personnage 1": "source", "Personnage 2": "target", "Type de Lien" : "type"}, inplace=True)
    df.replace(links, inplace = True)

    return df.to_dict(orient='records')
    
def ReadNodes(path, houses):
    df = pd.read_table(path)  
    df.rename(columns={"Nom du Perso": "name"
                       ,"Lien vers un avatar" : "avatar"
                       ,"Maison" : "house"}, inplace = True)
    df = df.iloc[: , 1:]
    df.replace(houses, inplace = True)
    
    return df.to_dict(orient='records')
    
(links, houses) = ReadData("HAK - LiensPersos - Data.tsv")  

link = ReadLinks("HAK - LiensPersos - Links.tsv", links)
node = ReadNodes("HAK - LiensPersos - Characters.tsv", houses)

json = '{"nodes" : ' + js.dumps(node,  indent = 2) + ',\n"links" : ' + js.dumps(link, indent = 2) + '}'
print(json)
f = open("data.json", "w")
f.write(json)
f.close()