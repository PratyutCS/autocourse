import PyPDF2
from groq import Groq
import sys
import json
import os

fn = sys.argv[1]
jfn = sys.argv[2]

# Initialize Groq client with API key
client = Groq(api_key="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")

def extract(file):
    with open(file, 'rb') as pdf:
        reader = PyPDF2.PdfReader(pdf, strict=False)
        eText = []

        for page in reader.pages:
            content = page.extract_text()
            eText.append(content)

        return eText

def create_empty_template():
    return {
        "Program": "",
        "Session": "",
        "course_code": "",
        "course_name": "",
        "Module/Semester": "",
        "course_description": "",
        "courseSyllabus": "",
        
    }

def ai(text):
    # Create a minimal template for initial extraction
    initial_template = {
        "Session": "",
        "course_code": "",
        "course_name": "",
        "Module/Semester": "",
        "Program": "",
        "course_description": "",
        "courseSyllabus": "",
    }
    
    prompt = f"""Extract the following course information from the document into this exact structure:
{json.dumps(initial_template, indent=2)}

Here is the text: {text}

Instructions:
1. Extract all available information that matches the fields in the template
2. Keep the exact field names as shown
3. If information isn't found, leave the field as an empty string ("")
4. Maintain the exact structure
5. Extract text exactly as it appears in the document
6. Output only valid JSON without any additional text or explanations

Your response should be only the JSON object."""
    
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
            stream=False,
            temperature=0.01  # Lower temperature for more consistent extraction
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in AI processing: {str(e)}")
        return json.dumps(initial_template)

if __name__ == '__main__':
    # Extract text from PDF
    try:
        eData1 = extract(fn)
        q1 = ""
        for data in eData1:
            q1 += data
        
        # Load or create template
        try:
            with open('./extractor/mainData.json', 'r') as file:
                mainData = json.load(file)
        except FileNotFoundError:
            mainData = create_empty_template()
        
        # Get AI response
        response = ai(q1)
        response = response.strip()
        
        # Load existing JSON data
        with open(jfn, 'r') as file:
            data = json.load(file)

        # Find matching document
        datnum = None
        for i, dat in enumerate(data):
            if dat['filename'] in fn:
                datnum = i
                break
        
        print(f"Processing file: {fn}")
        
        try:
            res = json.loads(response)
            print("AI Response:", json.dumps(res, indent=2))
            
            # Update main data with AI response
            for key in res:
                if key in mainData and res[key]:  # Only update if value isn't empty
                    mainData[key] = res[key]
                    
        except json.JSONDecodeError as e:
            print("------- Error in parsing AI response ---------")
            print("Response:", response)
            print("Error:", str(e))
            print("Current template:", json.dumps(mainData, indent=2))

        if datnum is not None:
            print(f"Updating entry {datnum}")
            data[datnum].update(mainData)
            data[datnum]['done'] = 1
        else:
            print(f"Filename {fn} not found in the JSON file.")

        # Save updated data
        with open(jfn, 'w') as f:
            json.dump(data, f, indent=2)
            
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        sys.exit(1)