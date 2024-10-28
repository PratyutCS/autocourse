import PyPDF2
from langchain_ollama import OllamaLLM
import sys
import json
import os

fn = sys.argv[1]
jfn = sys.argv[2]

llm1 = OllamaLLM(model="gemma2")

def extract(file):
    with open(file, 'rb') as pdf:
        reader = PyPDF2.PdfReader(pdf, strict=False)
        eText = []

        for page in reader.pages:
            content = page.extract_text()
            eText.append(content)

        return eText

def ai(text):
    prompt = f"""Extract the following course information from the document:
{{
    "Session": null,
    "course_code": null,
    "course_name": null,
    "Module/Semester": null
}}

Here is the text: {text[:1000]}

Make sure there are no changes in the words or sequence; extract as it is. If you can't find anything, keep it as null.
No explanation is needed.
Output the result in JSON format only without any buffer text."""
    
    response = llm1.invoke(prompt)
    return response

if __name__ == '__main__':
    eData1 = extract(fn)
    q1 = ""
    for data in eData1:
        q1 += data
    
    # cd = os.getcwd()
    # print("Current Directory:", cd)

    with open('./extractor/mainData.json', 'r') as file:
        mainData = json.load(file)

    response = ai(q1)
    response = response.strip()

    with open(jfn, 'r') as file:
        data = json.load(file)

    datnum = None
    for i, dat in enumerate(data):
        if dat['filename'] in fn:
            datnum = i
            break
    
    print(fn)
    print(mainData)

    try :
        res = json.loads(response)
        mainData["Session"] = res["Session"]
        mainData["course_code"] = res["course_code"]
        mainData["course_name"] = res["course_name"]
        mainData["Module/Semester"] = res["Module/Semester"]
    except:
        print("------- error in parsing ai response ---------")
        print(response)
        print(mainData)

    if datnum is not None:
        print("datnum is: {}".format(datnum))
        data[datnum].update(mainData)
        data[datnum]['done'] = 1
    else:
        print(f"Filename {fn} not found in the JSON file.")

    with open(jfn, 'w') as f:
        json.dump(data, f)
