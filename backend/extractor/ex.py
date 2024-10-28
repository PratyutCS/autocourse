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
    # prompt = f"""
    # You are a precise course information extraction system. Your task is to carefully analyze the following course handout and extract specific information into a structured JSON format. 

    #     Rules:
    #     - Make sure there are no changes in the words or sequence; extract as it is
    #     - Extract only factual information present in the text
    #     - Use exact numbers and text from the source
    #     - If information is not found, leave the field null
    #     - Return only valid JSON without any other text
    #     - Do not add something of your own or correct the language 
    #     - NO buffer text No explaination only JSON

    #     Extract this information into the following structure:
    #     "Course_details": {{
    #         "Program": "",
    #         "Session": "",
    #         "course_code": "",
    #         "course_name": "",
    #         "credits": "",
    #         "Module/Semester": ""
    #     }},

    #     Course handout text:
    #     {text[:1000]}
    #     """
    prompt = f"""
        Extract the following course information from the document:
        "Course_details": {{
            "Program": "",
            "Session": "",
            "course_code": "",
            "course_name": "",
            "credits": "",
            "Module/Semester": ""
        }},

        Here is the text: {text[:1000]}
        Make sure there are no changes in the words or sequence; extract as it is. If you can't find anything, keep it as null.
        No explanation is needed.
        Output the result in JSON format only without any buffer text.
        NO buffer text No Output should only contain only JSON format
        """
    
    response = llm1.invoke(prompt)
    return response

if __name__ == '__main__':
    eData1 = extract(fn)
    q1 = ""
    for data in eData1:
        q1 += data

    response = ai(q1)
    response = response.strip()

    with open(jfn, 'r') as file:
        data = json.load(file)

    datnum = None
    for i, dat in enumerate(data):
        if dat['filename'] in fn:
            datnum = i
            break
    
    # cd = os.getcwd()
    # print("Current Directory:", cd)
    print(fn)

    try :
        res = json.loads(response)
    except:
        print("------- error in parsing ai response ---------")
        print(response)
        os.remove(fn)
        if datnum != (len(data) - 1):
            data[datnum] = data[-1]
        data.pop()
        print(data)
        with open(jfn, 'w') as f:
            json.dump(data, f)
        sys.exit(1)

    if datnum is not None:
        print("datnum is: {}".format(datnum))
        data[datnum].update(res)
        data[datnum]['done'] = 1
    else:
        print(f"Filename {fn} not found in the JSON file.")

    with open(jfn, 'w') as f:
        json.dump(data, f)
