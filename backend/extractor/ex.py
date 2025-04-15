import pdfplumber
import sys
import json
import re
from datetime import datetime
from groq import Groq

def extract(file):
    """
    Extract text from PDF using pdfplumber with enhanced error handling and text processing.
    """
    try:
        with pdfplumber.open(file) as pdf:
            eText = []
            for i, page in enumerate(pdf.pages):
                # Ensure 'page' is a valid object and extract its text
                if page is not None:
                    text = page.extract_text(x_tolerance=3)  # Adjust tolerance for better word spacing.
                    if text:
                        eText.append(text)
            # Return the joined text with proper encoding handling
            return '\n\n'.join(eText)
    except Exception as e:
        print(f"Error extracting PDF: {str(e)}")
        return ""

def get_mapping_template(program):
    """
    Return the appropriate mapping template based on program.
    Each mapping key is initialized with an empty string.
    """
    if program == 1:  # Computer Science Engineering
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
            "PSO1": "", "PSO2": "", "PSO3": "", "PSO4": ""
        }
    elif program == 2:  # Mechanical Engineering
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
            "PSO1": "", "PSO2": ""
        }
    elif program == 3:  # Electronics and Computer Engineering
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
            "PSO1": "", "PSO2": ""
        }
    elif program == 4:  # BBA
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PSFA1": "", "PSFA2": ""
        }
    elif program == 5:  # BCOM(Hons)
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "", "PO8": ""
        }
    elif program == 6:  # Integrated BBA/MBA
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PSFB1": "", "PSFB2": "", "PSFB3": ""
        }
    elif program == 7:  # BA (Hons) Liberal Arts
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": ""
        }
    elif program == 8:  # BA LLB (Hons)
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "",
            "PSO1": "", "PSO2": ""
        }
    elif program == 9:  # BBA LLB (Hons)
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "",
            "PSO1": "", "PSO2": ""
        }
    elif program == 10:  # BBA LLB (Hons) or similar
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": ""
        }
    else:  # Default to Computer Science Engineering (Program 1)
        return {
            "CO/PO": "",
            "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
            "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
            "PSO1": "", "PSO2": "", "PSO3": "", "PSO4": ""
        }

def create_empty_template():
    # Default to program 1 initially
    program = 1
    
    return {
        "Program": program,
        "Session": "",
        "course_code": "",
        "course_name": "",
        "Module/Semester": "",
        "course_description": "",
        "Course Syllabus": [{
                "srNo": 1,
                "content": "Topic Name with Details",
                "co": "1",
                "sessions": 1
            }
        ],
        "Learning Resources": {
            "textBooks": [],
            "referenceLinks": []
        },
        "internalAssessmentData": {
            "components": {
                "component1": {
                    "component": "",
                    "weightage": "",
                    "evaluationWeek": "",
                    "remarks": ""
                }
            }
        },
        "copoMappingData": {
            "courseOutcomes": {
                "CO1": {
                    "description": "",
                    "bullets": []
                }
            },
            "mappingData": {
                "CO1": get_mapping_template(program)
            }
        },
        "weeklyTimetableData": {
            "Monday": {
                "9:15-10:10": False,
                "10:15-11:10": False,
                "11:15-12:10": False,
                "12:15-13:10": False,
                "13:15-14:10": False,
                "14:15-15:10": False,
                "15:15-16:10": False,
                "16:15-17:10": False,
                "17:15-18:10": False
            },
            "Tuesday": {
                "9:15-10:10": False,
                "10:15-11:10": False,
                "11:15-12:10": False,
                "12:15-13:10": False,
                "13:15-14:10": False,
                "14:15-15:10": False,
                "15:15-16:10": False,
                "16:15-17:10": False,
                "17:15-18:10": False
            },
            "Wednesday": {
                "9:15-10:10": False,
                "10:15-11:10": False,
                "11:15-12:10": False,
                "12:15-13:10": False,
                "13:15-14:10": False,
                "14:15-15:10": False,
                "15:15-16:10": False,
                "16:15-17:10": False,
                "17:15-18:10": False
            },
            "Thursday": {
                "9:15-10:10": False,
                "10:15-11:10": False,
                "11:15-12:10": False,
                "12:15-13:10": False,
                "13:15-14:10": False,
                "14:15-15:10": False,
                "15:15-16:10": False,
                "16:15-17:10": False,
                "17:15-18:10": False
            },
            "Friday": {
                "9:15-10:10": False,
                "10:15-11:10": False,
                "11:15-12:10": False,
                "12:15-13:10": False,
                "13:15-14:10": False,
                "14:15-15:10": False,
                "15:15-16:10": False,
                "16:15-17:10": False,
                "17:15-18:10": False
            }
        },
        "actionsForWeakStudentsData": [""],
        "last_modified": "",
        "par_sem_slowLearner": [[],[]],
        "learnerCategories": [[],[]]
    }

def clean_json_response(response):
    """Extract JSON from response, handling potential text before/after the JSON."""
    try:
        start = response.find('{')
        end = response.rstrip().rfind('}') + 1
        if start != -1 and end != -1:
            json_str = response[start:end]
            return json.loads(json_str)
    except:
        pass
    return None

def validate_course_code(code):
    """
    Validate course code according to specified rules:
    - Must be exactly 7 characters.
    - First 3 characters must be letters.
    - Last 4 characters must be numbers.
    - If valid, convert first 3 letters to uppercase.
    """
    if not code:
        return ""
        
    # Handle if code is longer than 7 characters.
    if len(code) > 7:
        code = code[:7]
    
    # Return empty if code is less than 7 characters.
    if len(code) < 7:
        return ""
        
    # Check if first 3 characters are letters and last 4 are numbers.
    first_three = code[:3]
    last_four = code[3:]
    
    if re.match(r'^[a-zA-Z]+$', first_three) and re.match(r'^[0-9]+$', last_four):
        return first_three.upper() + last_four
    else:
        return ""

def ai(text):
    initial_template = create_empty_template()

    assessment_format = json.dumps({
        "components": {
            "component1": {
                "component": "",
                "duration": "",
                "weightage": "",
                "evaluationWeek": "",
                "remarks": ""
            }
        }
    })
    syllabus_format = json.dumps({
        "courseSyllabus": [
            {
                "srNo": 1,
                "content": "Topic Name with Details",
                "co": "1",
                "sessions": 1
            }
        ]
    }, indent=2)

    prompt = f"""
You must respond with ONLY a raw JSON object - no markdown, no code blocks, no other text.
All string values must be properly escaped and valid JSON.
The response must exactly match this structure, with no truncation:
{json.dumps(initial_template, indent=2)}

Extract relevant information from this text and fill the template:
{text[:50000]}

Requirements:
-0. Program field must be exactly one of these values:
   * 1 for 'Computer Science Engineering'
   * 2 for 'Mechanical Engineering'
   * 3 for 'Electronics and Computer Engineering'
   * 4 for 'BBA'
   * 5 for 'BCOM(Hons)'
   * 6 for 'Integrated BBA/MBA'
   * 7 for 'BA (Hons) Liberal Arts'
   * 8 for 'BA LLB (Hons)'
   * 9 for 'BBA LLB (Hons)'
   * 10 for 'BBA LLB (Hons)' (if applicable)
   Based on your analysis of the document, determine which program is most appropriate and provide ONLY the number.

-1. Response must be ONLY the JSON object, no other text

-2. Keep field names exactly as shown

-3. Use the default value if not given then keep empty fields as shown ("" for strings, [] for arrays)

-4. textBooks objects must have: title, author, publisher, edition, year, isbn

-5. referenceLinks objects must have: title, authors, journal, volume, year, doi anything related to links given in the learning resources section.

-6. Preserve all existing template fields even if not mentioned in the text

-7. course_description is the Course Overview and Context in the PDF. There can be more than one paragraph inside it, so include all the paragraphs.

-8. In the internal component (component) it should have component, Duration (duration), Weightage (weightage), Evaluation (evaluation) Week (week) and Remarks (remarks) format:{assessment_format}.

-9. If there are paragraphs, add a break or start from a new line.

-10. For referenceLinks, extract links given if any.

-11. For the textBooks and referenceLinks, each should be a simple string in the array and do not include any additional fields or nested objects.

-12. For the mappingData in copoMappingData:
      - First, accurately identify the program type from the document content.
      - Use the following PO/PSO structure based on the identified program:
          * For Program 1 (Computer Science Engineering): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2", "PSO3", "PSO4"]
          * For Program 2 (Mechanical Engineering): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2"]
          * For Program 3 (Electronics and Computer Engineering): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2"]
          * For Program 4 (BBA): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PSFA1", "PSFA2"]
          * For Program 5 (BCOM(Hons)): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"]
          * For Program 6 (Integrated BBA/MBA): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PSFB1", "PSFB2", "PSFB3"]
          * For Program 7 (BA (Hons) Liberal Arts): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7"]
          * For Program 8 (BA LLB (Hons)): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PSO1", "PSO2"]
          * For Program 9 (BBA LLB (Hons)): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PSO1", "PSO2"]
          * For Program 10 (BBA LLB (Hons) or similar): the mapping keys must be:
              ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6"]
          * For any other program, default to Program 1's structure.
      - Extract the exact mapping values from the table.
      - All mapping values must be numerical and must be between 0 and 3 (inclusive). If a mapping value falls outside this range or is non-numerical, treat it as invalid and default to this string "0".
      - Preserve empty cells as empty strings "0". 
      - Ensure the mapping matches the course outcomes exactly as present in the document.
      - The Program field value must match the structure used in the mappingData.

-13. In courseSyllabus, the course content should come in this format:{syllabus_format}

-14. The mapping data must match course outcomes

-15. Ensure consistency between the Program field and the corresponding copoMappingData structure.

-16. For course_code field, apply the following validation rules:
      - The course code must be exactly 7 characters long.
      - The first 3 characters must be letters (alphabetical characters only).
      - The last 4 characters must be numbers (digits only).
      - If these conditions are met, convert the first 3 characters to uppercase.
      - If the extracted course code doesn't meet these requirements, try to:
        * If longer than 7 characters, use only the first 7 that follow the pattern.
        * If shorter than 7 characters, leave as empty string.
        * If the pattern doesn't match (first 3 letters, last 4 numbers), leave as empty string.
      - Example of valid course codes: CSC1234, MAT5678, PHY9012 (3 letters followed by 4 numbers).

-17. Add a field "last_modified" that records the date and time when the details were extracted. The format must be 12-hour (en-IN) with the time in front followed by the date, without seconds. For example: "08:30 AM, 22/03/2025".

Additional Extraction and Validation Restrictions:
- For **course_name** (courseTitle): If the extracted string is longer than 128 characters, truncate it to 128 characters.
- For **Module/Semester** (module): If the value is longer than 10 characters, truncate it to 10 characters.
- For **Session**: If the value is longer than 12 characters, truncate it to 12 characters.
- For **course_description**: If the value is longer than 4096 characters, truncate it to 4096 characters.
- For **feedbackData.quantitativeFeedback**: 
     - Parse the value as a float.
     - If it is not a valid number, set it to 0.00.
     - If it is greater than 5.00, set it to 5.00.
     - If it is less than 0.00, set it to 0.00.
     - Format the value to two decimal places.
- For **feedbackData.qualitativeFeedback**: If the value is longer than 4096 characters, truncate it to 4096 characters.
- For **facultyCourseReview**: If the value is longer than 4096 characters, truncate it to 4096 characters.
"""

    # Initialize Groq client (replace with your actual API key)
    client = Groq(api_key="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")

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            top_p=1,
            stream=False,
            stop=None
        )

        response_content = completion.choices[0].message.content
        cleaned_response = clean_json_response(response_content)
        
        if cleaned_response:
            # Update the mapping template based on the identified program.
            program = cleaned_response.get("Program", 1)
            if "copoMappingData" in cleaned_response and "mappingData" in cleaned_response["copoMappingData"]:
                for co in cleaned_response["copoMappingData"]["mappingData"]:
                    mapping_template = get_mapping_template(program)
                    for po, value in cleaned_response["copoMappingData"]["mappingData"][co].items():
                        if po in mapping_template:
                            mapping_template[po] = value
                    cleaned_response["copoMappingData"]["mappingData"][co] = mapping_template

            # Validate and format course code.
            if "course_code" in cleaned_response:
                course_code = cleaned_response["course_code"]
                validated_code = validate_course_code(course_code)
                cleaned_response["course_code"] = validated_code

            # Add the last_modified field with the current timestamp in the required format.
            current_timestamp = datetime.now().strftime("%I:%M %p, %d/%m/%Y")
            cleaned_response["last_modified"] = current_timestamp

            return json.dumps(cleaned_response, ensure_ascii=False)
        # If no cleaned response, just update the template with last_modified.
        initial_template["last_modified"] = datetime.now().strftime("%I:%M %p, %d/%m/%Y")
        return json.dumps(initial_template, ensure_ascii=False)

    except Exception as e:
        print(f"Error in AI processing: {str(e)}")
        initial_template["last_modified"] = datetime.now().strftime("%I:%M %p, %d/%m/%Y")
        return json.dumps(initial_template, ensure_ascii=False)

if __name__ == '__main__':
    try:
        fn = sys.argv[1]
        jfn = sys.argv[2]
        extracted_text = extract(fn)
        if extracted_text:
            print(f"Extracted Text Length: {len(extracted_text)} characters")
        else:
            print("No text could be extracted from the PDF.")
            
        # Handle encoding issues by forcing UTF-8 with replacement of problematic characters
        extracted_text = extracted_text.encode("utf-8", "ignore").decode("utf-8")
        response = ai(extracted_text)

        # Open JSON file with UTF-8 encoding
        with open(jfn, 'r', encoding="utf-8") as file:
            data = json.load(file)
        datnum = None
        for i, dat in enumerate(data):
            if dat['filename'] in fn:
                datnum = i
                break
        print(f"Processing file: {fn}")

        try:
            res = json.loads(response)
            print("AI Response processed successfully")
            if datnum is not None:
                print(f"Updating entry {datnum}")
                for key, value in res.items():
                    if isinstance(value, dict):
                        if key not in data[datnum]:
                            data[datnum][key] = value
                        elif isinstance(data[datnum][key], dict):
                            data[datnum][key].update(value)
                    elif value:
                        data[datnum][key] = value
                data[datnum]['done'] = 1
            else:
                print(f"Filename {fn} not found in the JSON file.")

            # Write to JSON file with UTF-8 encoding and ensure_ascii=False
            with open(jfn, 'w', encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

        except json.JSONDecodeError as e:
            print("------- Error in parsing AI response ---------")
            print(f"Error: {str(e)}")
            print("Current template:", json.dumps(create_empty_template(), indent=2))

    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        sys.exit(1)
########################################################################################################################################
# import pdfplumber
# import sys
# import json
# import re
# from datetime import datetime
# from openai import OpenAI

# # Initialize OpenAI client
# client = OpenAI(api_key="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")

# fn = sys.argv[1]
# jfn = sys.argv[2]

# def extract(file):
#     """
#     Extract text from PDF using pdfplumber with enhanced error handling and text processing.
#     """
#     try:
#         with pdfplumber.open(file) as pdf:
#             eText = []
#             for page in pdf.pages:
#                 # Extract text with better handling of whitespace and formatting.
#                 text = page.extract_text(x_tolerance=3)  # Adjust tolerance for better word spacing.
#                 eText.append(text)
#             return '\n\n'.join(filter(None, eText))
#     except Exception as e:
#         print(f"Error extracting PDF: {str(e)}")
#         return ""

# def get_mapping_template(program):
#     """
#     Return the appropriate mapping template based on program.
#     Each mapping key is initialized with an empty string.
#     """
#     if program == 1:  # Computer Science Engineering
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
#             "PSO1": "", "PSO2": "", "PSO3": "", "PSO4": ""
#         }
#     elif program == 2:  # Mechanical Engineering
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
#             "PSO1": "", "PSO2": ""
#         }
#     elif program == 3:  # Electronics and Computer Engineering
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
#             "PSO1": "", "PSO2": ""
#         }
#     elif program == 4:  # BBA
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PSFA1": "", "PSFA2": ""
#         }
#     elif program == 5:  # BCOM(Hons)
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "", "PO8": ""
#         }
#     elif program == 6:  # Integrated BBA/MBA
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PSFB1": "", "PSFB2": "", "PSFB3": ""
#         }
#     elif program == 7:  # BA (Hons) Liberal Arts
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": ""
#         }
#     elif program == 8:  # BA LLB (Hons)
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "",
#             "PSO1": "", "PSO2": ""
#         }
#     elif program == 9:  # BBA LLB (Hons)
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "",
#             "PSO1": "", "PSO2": ""
#         }
#     elif program == 10:  # BBA LLB (Hons) or similar
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": ""
#         }
#     else:  # Default to Computer Science Engineering (Program 1)
#         return {
#             "CO/PO": "",
#             "PO1": "", "PO2": "", "PO3": "", "PO4": "", "PO5": "", "PO6": "",
#             "PO7": "", "PO8": "", "PO9": "", "PO10": "", "PO11": "", "PO12": "",
#             "PSO1": "", "PSO2": "", "PSO3": "", "PSO4": ""
#         }

# def create_empty_template():
#     # Default to program 1 initially
#     program = 1
    
#     return {
#         "Program": program,
#         "Session": "",
#         "course_code": "",
#         "course_name": "",
#         "Module/Semester": "",
#         "course_description": "",
#         "Course Syllabus": [{
#                 "srNo": 1,
#                 "content": "Topic Name with Details",
#                 "co": "1",
#                 "sessions": 1
#             }
#         ],
#         "Learning Resources": {
#             "textBooks": [],
#             "referenceLinks": []
#         },
#         "internalAssessmentData": {
#             "components": {
#                 "component1": {
#                     "component": "",
#                     "weightage": "",
#                     "evaluationWeek": "",
#                     "remarks": ""
#                 }
#             }
#         },
#         "copoMappingData": {
#             "courseOutcomes": {
#                 "CO1": {
#                     "description": "",
#                     "bullets": []
#                 }
#             },
#             "mappingData": {
#                 "CO1": get_mapping_template(program)
#             }
#         },
#         "weeklyTimetableData": {
#             "Monday": {
#                 "9:15-10:10": False,
#                 "10:15-11:10": False,
#                 "11:15-12:10": False,
#                 "12:15-13:10": False,
#                 "13:15-14:10": False,
#                 "14:15-15:10": False,
#                 "15:15-16:10": False,
#                 "16:15-17:10": False,
#                 "17:15-18:10": False
#             },
#             "Tuesday": {
#                 "9:15-10:10": False,
#                 "10:15-11:10": False,
#                 "11:15-12:10": False,
#                 "12:15-13:10": False,
#                 "13:15-14:10": False,
#                 "14:15-15:10": False,
#                 "15:15-16:10": False,
#                 "16:15-17:10": False,
#                 "17:15-18:10": False
#             },
#             "Wednesday": {
#                 "9:15-10:10": False,
#                 "10:15-11:10": False,
#                 "11:15-12:10": False,
#                 "12:15-13:10": False,
#                 "13:15-14:10": False,
#                 "14:15-15:10": False,
#                 "15:15-16:10": False,
#                 "16:15-17:10": False,
#                 "17:15-18:10": False
#             },
#             "Thursday": {
#                 "9:15-10:10": False,
#                 "10:15-11:10": False,
#                 "11:15-12:10": False,
#                 "12:15-13:10": False,
#                 "13:15-14:10": False,
#                 "14:15-15:10": False,
#                 "15:15-16:10": False,
#                 "16:15-17:10": False,
#                 "17:15-18:10": False
#             },
#             "Friday": {
#                 "9:15-10:10": False,
#                 "10:15-11:10": False,
#                 "11:15-12:10": False,
#                 "12:15-13:10": False,
#                 "13:15-14:10": False,
#                 "14:15-15:10": False,
#                 "15:15-16:10": False,
#                 "16:15-17:10": False,
#                 "17:15-18:10": False
#             }
#         },
#         "actionsForWeakStudentsData": [""],
#         "last_modified": "",
#         "par_sem_slowLearner": [[],[]],
#         "learnerCategories": [[],[]]
#     }

# def clean_json_response(response):
#     """Extract JSON from response, handling potential text before/after the JSON."""
#     try:
#         start = response.find('{')
#         end = response.rstrip().rfind('}') + 1
#         if start != -1 and end != -1:
#             json_str = response[start:end]
#             return json.loads(json_str)
#     except:
#         pass
#     return None

# def ai(text):
#     initial_template = create_empty_template()

#     assessment_format = json.dumps({
#         "components": {
#             "component1": {
#                 "component": "",
#                 "duration": "",
#                 "weightage": "",
#                 "evaluationWeek": "",
#                 "remarks": ""
#             }
#         }
#     })
#     syllabus_format = json.dumps({
#         "courseSyllabus": [
#             {
#                 "srNo": 1,
#                 "content": "Topic Name with Details",
#                 "co": "1",
#                 "sessions": 1
#             }
#         ]
#     }, indent=2)
    
#     # Instruction added for last_modified field.
#     prompt = f"""
# You must respond with ONLY a raw JSON object - no markdown, no code blocks, no other text.
# All string values must be properly escaped and valid JSON.
# The response must exactly match this structure, with no truncation:
# {json.dumps(initial_template, indent=2)}

# Extract relevant information from this text and fill the template:
# {text[:50000]}

# Requirements:
# -0. Program field must be exactly one of these values:
#    * 1 for 'Computer Science Engineering'
#    * 2 for 'Mechanical Engineering'
#    * 3 for 'Electronics and Computer Engineering'
#    * 4 for 'BBA'
#    * 5 for 'BCOM(Hons)'
#    * 6 for 'Integrated BBA/MBA'
#    * 7 for 'BA (Hons) Liberal Arts'
#    * 8 for 'BA LLB (Hons)'
#    * 9 for 'BBA LLB (Hons)'
#    * 10 for 'BBA LLB (Hons)' (if applicable)
#    Based on your analysis of the document, determine which program is most appropriate and provide ONLY the number.

# -1. Response must be ONLY the JSON object, no other text

# -2. Keep field names exactly as shown

# -3. Use the default value if not given then keep empty fields as shown ("" for strings, [] for arrays)

# -4. textBooks objects must have: title, author, publisher, edition, year, isbn

# -5. referenceLinks objects must have: title, authors, journal, volume, year, doi anything related to links given in the learning resources section.

# -6. Preserve all existing template fields even if not mentioned in the text

# -7. course_description is the Course Overview and Context in the PDF. There can be more than one paragraph inside it, so include all the paragraphs.

# -8. In the internal component (component) it should have component, Duration (duration), Weightage (weightage), Evaluation (evaluation) Week (week) and Remarks (remarks) format:{assessment_format}.

# -9. If there are paragraphs, add a break or start from a new line.

# -10. For referenceLinks, extract links given if any.

# -11. For the textBooks and referenceLinks, each should be a simple string in the array and do not include any additional fields or nested objects.

# -12. For the mappingData in copoMappingData:
#       - First, accurately identify the program type from the document content.
#       - Use the following PO/PSO structure based on the identified program:
#           * For Program 1 (Computer Science Engineering): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2", "PSO3", "PSO4"]
#           * For Program 2 (Mechanical Engineering): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2"]
#           * For Program 3 (Electronics and Computer Engineering): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2"]
#           * For Program 4 (BBA): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PSFA1", "PSFA2"]
#           * For Program 5 (BCOM(Hons)): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"]
#           * For Program 6 (Integrated BBA/MBA): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PSFB1", "PSFB2", "PSFB3"]
#           * For Program 7 (BA (Hons) Liberal Arts): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7"]
#           * For Program 8 (BA LLB (Hons)): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PSO1", "PSO2"]
#           * For Program 9 (BBA LLB (Hons)): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PSO1", "PSO2"]
#           * For Program 10 (BBA LLB (Hons) or similar): the mapping keys must be:
#               ["CO/PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6"]
#           * For any other program, default to Program 1's structure.
#       - Extract the exact mapping values from the table.
#       - All mapping values must be numerical and must be between 0 and 3 (inclusive). If a mapping value falls outside this range or is non-numerical, treat it as invalid and default to this string "0".
#       - Preserve empty cells as empty strings "0". 
#       - Ensure the mapping matches the course outcomes exactly as present in the document.
#       - The Program field value must match the structure used in the mappingData.

# -13. In courseSyllabus, the course content should come in this format:{syllabus_format}

# -14. The mapping data must match course outcomes

# -15. Ensure consistency between the Program field and the corresponding copoMappingData structure.

# -16. For course_code field, apply the following validation rules:
#       - The course code must be exactly 7 characters long.
#       - The first 3 characters must be letters (alphabetical characters only).
#       - The last 4 characters must be numbers (digits only).
#       - If these conditions are met, convert the first 3 characters to uppercase.
#       - If the extracted course code doesn't meet these requirements, try to:
#         * If longer than 7 characters, use only the first 7 that follow the pattern.
#         * If shorter than 7 characters, leave as empty string.
#         * If the pattern doesn't match (first 3 letters, last 4 numbers), leave as empty string.
#       - Example of valid course codes: CSC1234, MAT5678, PHY9012 (3 letters followed by 4 numbers).

# -17. Add a field "last_modified" that records the date and time when the details were extracted. The format must be 12-hour (en-IN) with the time in front followed by the date, without seconds. For example: "08:30 AM, 22/03/2025".

# Additional Extraction and Validation Restrictions:
# - For **course_name** (courseTitle): If the extracted string is longer than 128 characters, truncate it to 128 characters.
# - For **Module/Semester** (module): If the value is longer than 10 characters, truncate it to 10 characters.
# - For **Session**: If the value is longer than 12 characters, truncate it to 12 characters.
# - For **course_description**: If the value is longer than 4096 characters, truncate it to 4096 characters.
# - For **feedbackData.quantitativeFeedback**: 
#      - Parse the value as a float.
#      - If it is not a valid number, set it to 0.00.
#      - If it is greater than 5.00, set it to 5.00.
#      - If it is less than 0.00, set it to 0.00.
#      - Format the value to two decimal places.
# - For **feedbackData.qualitativeFeedback**: If the value is longer than 4096 characters, truncate it to 4096 characters.
# - For **facultyCourseReview**: If the value is longer than 4096 characters, truncate it to 4096 characters.
# """

#     try:
#         # Use the OpenAI client to create a chat completion.
#         completion = client.chat.completions.create(
#             model="gpt-4o",
#             messages=[{"role": "user", "content": prompt}]
#         )

#         # Get the response content from the completion object.
#         response_content = completion.choices[0].message.content
#         cleaned_response = clean_json_response(response_content)
        
#         if cleaned_response:
#             # Update the mapping template based on the identified program.
#             program = cleaned_response.get("Program", 1)
#             if "copoMappingData" in cleaned_response and "mappingData" in cleaned_response["copoMappingData"]:
#                 for co in cleaned_response["copoMappingData"]["mappingData"]:
#                     # Replace the mapping template with the appropriate one for the detected program.
#                     mapping_template = get_mapping_template(program)
#                     # Preserve any values from the cleaned response.
#                     for po, value in cleaned_response["copoMappingData"]["mappingData"][co].items():
#                         if po in mapping_template:
#                             mapping_template[po] = value
#                     cleaned_response["copoMappingData"]["mappingData"][co] = mapping_template
            
#             # Validate and format course code.
#             if "course_code" in cleaned_response:
#                 course_code = cleaned_response["course_code"]
#                 validated_code = validate_course_code(course_code)
#                 cleaned_response["course_code"] = validated_code
            
#             # Add the last_modified field with the current timestamp in the required format.
#             # Format: "hh:mm AM/PM, dd/mm/yyyy" (12-hour format without seconds, en-IN locale)
#             current_timestamp = datetime.now().strftime("%I:%M %p, %d/%m/%Y")
#             cleaned_response["last_modified"] = current_timestamp

#             return json.dumps(cleaned_response)
#         # If no cleaned response, update the template with last_modified.
#         initial_template["last_modified"] = datetime.now().strftime("%I:%M %p, %d/%m/%Y")
#         return json.dumps(initial_template)

#     except Exception as e:
#         print(f"Error in AI processing: {str(e)}")
#         return json.dumps(initial_template)

# def validate_course_code(code):
#     """
#     Validate course code according to specified rules:
#     - Must be exactly 7 characters.
#     - First 3 characters must be letters.
#     - Last 4 characters must be numbers.
#     - If valid, convert first 3 letters to uppercase.
#     """
#     if not code:
#         return ""
        
#     # Handle if code is longer than 7 characters.
#     if len(code) > 7:
#         code = code[:7]
    
#     # Return empty if code is less than 7 characters.
#     if len(code) < 7:
#         return ""
        
#     # Check if first 3 characters are letters and last 4 are numbers.
#     first_three = code[:3]
#     last_four = code[3:]
    
#     if re.match(r'^[a-zA-Z]+$', first_three) and re.match(r'^[0-9]+$', last_four):
#         return first_three.upper() + last_four
#     else:
#         return ""

# if __name__ == '__main__':
#     try:
#         extracted_text = extract(fn)
#         if not extracted_text:
#             print("Error: No text extracted from PDF")
#         # Ensure text is properly encoded.
#         extracted_text = extracted_text.encode("utf-8", "ignore").decode("utf-8")
#         response = ai(extracted_text)
#         with open(jfn, 'r', encoding="utf-8") as file:
#             data = json.load(file)
#         datnum = None
#         for i, dat in enumerate(data):
#             if dat['filename'] in fn:
#                 datnum = i
#                 break
#         print(f"Processing file: {fn}")
#         try:
#             res = json.loads(response)
#             print("AI Response:", json.dumps(res, indent=2))
#             if datnum is not None:
#                 print(f"Updating entry {datnum}")
#                 for key, value in res.items():
#                     if isinstance(value, dict):
#                         if key not in data[datnum]:
#                             data[datnum][key] = value
#                         elif isinstance(data[datnum][key], dict):
#                             data[datnum][key].update(value)
#                     elif value:
#                         data[datnum][key] = value
#                 data[datnum]['done'] = 1
#             else:
#                 print(f"Filename {fn} not found in the JSON file.")
#             with open(jfn, 'w', encoding="utf-8") as f:
#                 json.dump(data, f, indent=2)
#         except json.JSONDecodeError as e:
#             print("------- Error in parsing AI response ---------")
#             print("Response:", response)
#             print("Error:", str(e))
#             print("Current template:", json.dumps(create_empty_template(), indent=2))
#     except Exception as e:
#         print(f"Error in main execution: {str(e)}")
#         sys.exit(1)
