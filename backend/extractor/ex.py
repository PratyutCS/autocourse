import PyPDF2
from groq import Groq
import sys
import json
import os
import re

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
        "Learning Resources": {
            "textBooks": [],
            "referenceLinks": []
        },
        "internalAssessmentData": {
            "components": {}
        },
        "copoMappingData": {
            "courseOutcomes": {
                "CO1": {
                    "description": "",
                    "bullets": []
                }
            },
            "mappingData": {
                "CO1": {
                    "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "",
                    "PO6": "", "PO7": "", "PO8": "", "PO9": "", "PO10": "",
                    "PO11": "", "PO12": "", "PSO1": "", "PSO2": "", "PSO3": "", "PSO4": ""
                }
            }
        },
        "weeklyTimetableData": "",
        "studentList": "",
        "weakstudent": "",
        "assignmentsTaken": "",
        "marksDetails": "",
        "attendanceReport": "",
        "actionsForWeakStudentsData": [{"id": "1", "text": ""}]
    }

def clean_json_response(response):
    """Extract JSON from response, handling potential text before/after the JSON."""
    try:
        # Find the first { and last } to extract just the JSON part
        start = response.find('{')
        end = response.rstrip().rfind('}') + 1
        if start != -1 and end != -1:
            json_str = response[start:end]
            # Parse to validate and return
            return json.loads(json_str)
    except:
        pass
    return None

def ai(text):
    initial_template = create_empty_template()
    
    prompt = f"""You must respond with ONLY a valid JSON object matching this structure:
{json.dumps(initial_template, indent=2)}

Extract relevant information from this text and fill the template:
{text}

Requirements:
-1. Response must be ONLY the JSON object, no other text
-2. Keep field names exactly as shown
-3. Keep empty fields as shown ("" for strings, [] for arrays)
-4. textBooks objects must have: title, author, publisher, edition, year, isbn
-5. referenceLinks objects must have: title, authors, journal, volume, year, doi
-6. Preserve all existing template fields even if not mentioned in the text
-7. course_description is the Course Overview and Context in the pdf. There can be more than 1 paragraphs inside it, so include all the paragraphs.
-8. In the internal component(component ) it should have component, Duration(duration), Weightage(weightage), Evaluation(evaluation) Week(week) and Remarks(remarks)

"""
    
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-70b-versatile",
            stream=False,
            temperature=0.01
        )
        
        content = response.choices[0].message.content
        cleaned_response = clean_json_response(content)
        if cleaned_response:
            return json.dumps(cleaned_response)
        return json.dumps(initial_template)
    except Exception as e:
        print(f"Error in AI processing: {str(e)}")
        return json.dumps(initial_template)

if __name__ == '__main__':
    try:
        # Extract text from PDF
        eData1 = extract(fn)
        q1 = ""
        for data in eData1:
            q1 += data
        
        # Get AI response
        response = ai(q1)
        
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
            
            if datnum is not None:
                print(f"Updating entry {datnum}")
                
                # Update only non-empty values while preserving existing data
                for key, value in res.items():
                    if isinstance(value, dict):
                        if key not in data[datnum]:
                            data[datnum][key] = value
                        elif isinstance(data[datnum][key], dict):
                            data[datnum][key].update(value)
                    elif value:  # Only update if value is non-empty
                        data[datnum][key] = value
                
                data[datnum]['done'] = 1
            else:
                print(f"Filename {fn} not found in the JSON file.")

            # Save updated data
            with open(jfn, 'w') as f:
                json.dump(data, f, indent=2)
            
        except json.JSONDecodeError as e:
            print("------- Error in parsing AI response ---------")
            print("Response:", response)
            print("Error:", str(e))
            print("Current template:", json.dumps(create_empty_template(), indent=2))
            
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        sys.exit(1)