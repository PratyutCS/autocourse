import json
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx2pdf import convert
import sys
import os


doc = Document('./extractor/sample.docx')

# with open('../json/1.json', 'r') as f:
#     data = json.load(f)
#     data = data[0]

print(sys.argv[1])
data = json.loads(sys.argv[1])


# replace placeholders with actual data
def replace_placeholders(doc, data):
    for paragraph in doc.paragraphs:
        for key in data.keys():
            placeholder = f'{{{{{key}}}}}'
            if placeholder in paragraph.text:
                value = data.get(key, 'null')
                if(value == None):
                    value = ""
                paragraph.text = paragraph.text.replace(placeholder, value)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for key in data.keys():
                    placeholder = f'{{{{{key}}}}}'
                    if placeholder in cell.text:
                        value = data.get(key, 'null')
                        if(value == None):
                            value = ""
                        cell.text = cell.text.replace(placeholder, value)

# if data.get('Course_details'):
#     details = data["Course_details"]
#     replace_placeholders(doc, details)

def rep(doc, key):
    for paragraph in doc.paragraphs:
        placeholder = f'{{{{{key}}}}}'
        if placeholder in paragraph.text:
                value = data.get(key, "")
                paragraph.text = paragraph.text.replace(placeholder, value)

if data.get('Session'):
    rep(doc,"Session")

if data.get('course_code'):
    rep(doc,"course_code")

if data.get('course_name'):
    rep(doc,"course_name")

if data.get('Module/Semester'):
    rep(doc,"Module/Semester")

if data.get('Program'):
    rep(doc,"Program")



#  PEOs and POs & PSOs of the Program
def add_bullet_section(title, content):
    doc.add_paragraph()

    title_paragraph = doc.add_paragraph()
    title_run = title_paragraph.add_run(f"{title}:")
    title_run.bold = True
    title_run.font.size = Pt(12)
    title_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title_paragraph.paragraph_format.left_indent = Inches(0.7)

    for key, value in content.items():
        bullet_paragraph = doc.add_paragraph(style='Normal')
        bullet_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        bullet_paragraph.paragraph_format.left_indent = Inches(1.2)
        bullet_paragraph.paragraph_format.right_indent = Inches(0.5)
        bullet_paragraph.add_run(f"{key}: {value}")

        p = bullet_paragraph._element
        pPr = p.get_or_add_pPr()
        numPr = pPr.get_or_add_numPr()
        ilvl = numPr.get_or_add_ilvl()
        ilvl.val = 0
        numId = numPr.get_or_add_numId()
        numId.val = 1


if data.get('Program Educational Objectives (PEO)') and \
   data.get('Program Outcomes (PO)') and \
   data.get('Program Specific Outcomes (PSO)'):

    heading = doc.add_heading(level=1)
    heading_run = heading.add_run('5. PEOs and POs & PSOs of the Program')
    heading_run.font.name = 'Carlito'
    heading_run.font.size = Pt(16)
    heading_run.font.color.rgb = RGBColor(28, 132, 196)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    add_bullet_section('Program Educational Objectives (PEO)',
                   data['Program Educational Objectives (PEO)'])
    add_bullet_section('Program Outcomes (PO)', data['Program Outcomes (PO)'])
    doc.add_paragraph()
    add_bullet_section('Program Specific Outcomes (PSO)',
                   data['Program Specific Outcomes (PSO)'])

#######################################################################################################


# Course Description and its objectives
if data.get('course_description'):
    doc.add_page_break()

    course_heading = doc.add_heading(level=1)
    course_run = course_heading.add_run(
        '6. Course Description and its objectives')
    course_run.font.name = 'Carlito'
    course_run.font.size = Pt(16)
    course_run.font.color.rgb = RGBColor(28, 132, 196)
    course_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()
    course_description_paragraph = doc.add_paragraph(
        data['course_description'])
    course_description_paragraph.paragraph_format.left_indent = Inches(0.7)
    course_description_paragraph.paragraph_format.right_indent = Inches(0.5)
    course_description_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT

#######################################################################################################


# Course Outcomes and co-po mapping
if data.get('Course Outcomes (CO)'):
    doc.add_page_break()

    co_heading = doc.add_heading(level=1)
    co_run = co_heading.add_run('7. Course Outcomes and CO-PO Mapping')
    co_run.font.name = 'Carlito'
    co_run.font.size = Pt(16)
    co_run.font.color.rgb = RGBColor(28, 132, 196)
    co_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()
    course_outcomes_heading = doc.add_paragraph()
    course_outcomes_run = course_outcomes_heading.add_run('Course Outcomes:')
    course_outcomes_run.bold = True
    course_outcomes_run.font.size = Pt(12)
    course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
    course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
    course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    for co_key, co_value in data['Course Outcomes (CO)'].items():
        if isinstance(co_value, dict):
            doc.add_paragraph()
            paragraph = doc.add_paragraph(
                f'{co_key}: {co_value["description"]}')
            paragraph.paragraph_format.left_indent = Inches(0.7)
            paragraph.paragraph_format.right_indent = Inches(0.5)

            for bullet in co_value['bullets']:
                doc.add_paragraph()
                bullet_paragraph = doc.add_paragraph('• ' + bullet)
                bullet_paragraph.paragraph_format.left_indent = Inches(1)
                bullet_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        else:
            doc.add_paragraph()
            paragraph = doc.add_paragraph(f'{co_key}: {co_value}')
            paragraph.paragraph_format.left_indent = Inches(0.7)
            paragraph.paragraph_format.right_indent = Inches(0.5)


# Check if 'CO_PO_Mapping' is present in the data
if data.get('CO_PO_Mapping'):
    doc.add_paragraph()

    course_outcomes_heading = doc.add_paragraph()
    course_outcomes_run = course_outcomes_heading.add_run('CO/PO Mapping:')
    course_outcomes_run.bold = True
    course_outcomes_run.font.size = Pt(12)
    course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
    course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
    course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    co_po_mapping = data['CO_PO_Mapping']

    doc.add_paragraph()

    table = doc.add_table(rows=1, cols=len(
        co_po_mapping[list(co_po_mapping.keys())[0]]) + 1)  # +1 for CO column

    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Course Outcomes (CO)'
    for i, po_key in enumerate(co_po_mapping[list(co_po_mapping.keys())[0]].keys()):
        hdr_cells[i + 1].text = po_key

    for co_key, po_values in co_po_mapping.items():
        row_cells = table.add_row().cells
        row_cells[0].text = co_key  # CO column
        for i, value in enumerate(po_values.values()):
            # Add values, convert int to str
            row_cells[i + 1].text = str(value) if value != "" else ""

    for row in table.rows:
        for cell in row.cells:
            cell.width = Inches(1.0)
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    def set_cell_border(cell, border_type, border_size, border_color):
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()

        border = OxmlElement(f'w:{border_type}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), str(border_size))
        border.set(qn('w:color'), border_color)

        element = tcPr.xpath(f"./w:{border_type}")
        if element:
            element[0].getparent().replace(element[0], border)
        else:
            tcPr.append(border)

    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)


#############################################################################################################


# 8. Course Syllabus
if data.get('sessions') or data.get('Textbooks') or data.get('ReferenceLinks'):
    
    doc.add_page_break()
    co_heading = doc.add_heading(level=1)
    co_run = co_heading.add_run(
        '8. Course Syllabus (including Course Content with Module-wise teaching hours allocated; Readings, Activities, Teaching Strategy, and Module mapped to COs, Text Book(s), Reference Books, Other learning resources)')
    co_run.font.name = 'Carlito'
    co_run.font.size = Pt(16)
    co_run.font.color.rgb = RGBColor(28, 132, 196)
    co_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    course_outcomes_heading = doc.add_paragraph()
    course_outcomes_run = course_outcomes_heading.add_run(
        'Course Syllabus & Detailed Session wise Plan:')
    course_outcomes_run.bold = True
    course_outcomes_run.font.size = Pt(12)
    course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
    course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
    course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    if data.get('sessions'):
        sessions_data = data['sessions']

        doc.add_paragraph()

        table = doc.add_table(rows=1, cols=4)
        hdr_cells = table.rows[0].cells

        hdr_cells[0].text = 'Sr. No'
        hdr_cells[1].text = 'Content'
        hdr_cells[2].text = 'CO'
        hdr_cells[3].text = 'No of Sessions'

        for cell in hdr_cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(10)

        for session in sessions_data:
            row_cells = table.add_row().cells
            row_cells[0].text = str(session['Sr_No'])
            row_cells[1].text = session['Content']
            row_cells[2].text = ', '.join(session['CO'])
            row_cells[3].text = str(session['No_of_sessions'])

            for cell in row_cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = Pt(10)

        for row in table.rows:
            for cell in row.cells:
                cell.width = Inches(1.5)

        for row in table.rows:
            for cell in row.cells:
                set_cell_border(cell, 'top', 4, '000000')
                set_cell_border(cell, 'bottom', 4, '000000')
                set_cell_border(cell, 'left', 4, '000000')
                set_cell_border(cell, 'right', 4, '000000')

        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for row in table.rows:
            tr = row._tr
            trPr = tr.get_or_add_trPr()
            cantSplit = OxmlElement('w:cantSplit')
            trPr.append(cantSplit)

    if data.get('Textbooks'):
        textbooks = data['Textbooks']

        doc.add_paragraph()
        course_outcomes_heading = doc.add_paragraph()
        course_outcomes_run = course_outcomes_heading.add_run('Textbooks:')
        course_outcomes_run.bold = True
        course_outcomes_run.font.size = Pt(12)
        course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
        course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
        course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

        doc.add_paragraph()
        for textbook in textbooks:
            bullet_paragraph = doc.add_paragraph('• ' + textbook)
            bullet_paragraph.paragraph_format.left_indent = Inches(1)
            bullet_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT

    if data.get('ReferenceLinks'):
        reference_links = data['ReferenceLinks']

        doc.add_paragraph()
        course_outcomes_heading = doc.add_paragraph()
        course_outcomes_run = course_outcomes_heading.add_run('Reference Links:')
        course_outcomes_run.bold = True
        course_outcomes_run.font.size = Pt(12)
        course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
        course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
        course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

        doc.add_paragraph()
        for reference in reference_links:
            bullet_paragraph = doc.add_paragraph('• ' + reference)
            bullet_paragraph.paragraph_format.left_indent = Inches(1)
            bullet_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT



def create_dynamic_table(doc, headers, data, title):
    """
    Creates a dynamic table in the provided Document object with the given data and headers.

    Args:
    - doc: Document object where the table will be added.
    - headers: List of column headers for the table.
    - data: List of lists containing the table data (rows).
    """
    doc.add_page_break()

    table_heading = doc.add_heading(level=1)
    heading_run = table_heading.add_run(title)
    heading_run.font.name = 'Carlito'
    heading_run.font.size = Pt(16)
    heading_run.font.color.rgb = RGBColor(28, 132, 196)
    table_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    num_rows = len(data) + 1
    num_cols = len(headers)

    doc.add_paragraph()
    table = doc.add_table(rows=num_rows, cols=num_cols)

    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        for paragraph in hdr_cells[i].paragraphs:
            for run in paragraph.runs:
                run.font.size = Pt(12)
                run.font.bold = True

    for row_index, row_data in enumerate(data):
        row_cells = table.rows[row_index + 1].cells
        for col_index, value in enumerate(row_data):
            row_cells[col_index].text = str(value)
            for paragraph in row_cells[col_index].paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(12)

    for row in table.rows:
        for cell in row.cells:
            cell.width = Inches(1.2)

    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    table.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)


if data.get('students'):
    students = data['students']  
    headers = ['Sr. No', 'Roll No', 'Student Name'] 
    student_data = [[student['Sr_No'], student['Roll_No'], student['Student_Name']] for student in students]
    create_dynamic_table(doc, headers, student_data, "9. Registered Student List")


############################################################################

if data.get('Details'):
    details = data['Details']
    
    headers = ["Component", "Duration", "Weightage (%)", "Evaluation", "Week", "Remarks"]
    
    details_data = [[detail['Component'], detail['Duration'], detail['Weightage (%)'],
                     detail['Evaluation'], detail['Week'], detail['Remarks']] for detail in details]

    create_dynamic_table(doc, headers, details_data,
                         "10. Details of Internal Assessments; weightages, due dates")

###################################################

if data.get('Weak_Students'):
    weak_students = data['Weak_Students']
    
    headers = ["Sr_No", "Roll_No", "Student_Name", "Mid_Term_Examination"]
    
    weak_students_details = [[student['Sr_No'], student['Roll_No'], student['Student_Name'],
                              student['Mid_Term_Examination']] for student in weak_students]
    
    create_dynamic_table(doc, headers, weak_students_details,
                         "11. Identification of weak students and actions taken")

doc.add_paragraph()

if data.get('Actions_Taken'):
    actions_taken = data['Actions_Taken']

    actions_heading = doc.add_heading(level=1)
    actions_run = actions_heading.add_run('Actions Taken')
    actions_run.font.name = 'Carlito'
    actions_run.font.size = Pt(12)
    actions_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    for action in actions_taken:
        step_text = f"Step {action['Step']}: {action['Description']}"
        action_paragraph = doc.add_paragraph(step_text)
        action_paragraph.paragraph_format.left_indent = Inches(0.7)
        action_paragraph.paragraph_format.right_indent = Inches(0.5)

doc.save('./download/'+data['filename'][:-4]+'.docx')

print("Document updated and saved.")

convert('./download/'+data['filename'][:-4]+'.docx')
os.remove('./download/'+data['filename'][:-4]+'.docx')