import json
import sys
import os
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_PARAGRAPH_ALIGNMENT
from docx.oxml import OxmlElement
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx2pdf import convert
from PyPDF2 import PdfMerger

# Open the base document using a context manager to ensure the file is closed promptly
with open('./extractor/sample.docx', 'rb') as f:
    doc = Document(f)

# Read data from command line (expected to be a JSON string)
print(sys.argv[1])
data = json.loads(sys.argv[1])

header = ""

# Helper function to replace placeholders in the document
def rep(doc, key):
    for paragraph in doc.paragraphs:
        placeholder = f'{{{{{key}}}}}'
        if placeholder in paragraph.text:
            value = data.get(key, "")
            paragraph.text = paragraph.text.replace(placeholder, value)

# Replace placeholders if the keys exist
if data.get('Program'):
    rep(doc, "Program")
if data.get('Session'):
    rep(doc, "Session")
if data.get('course_name'):
    rep(doc, "course_name")
    header += data.get("course_name", "") + " ("
if data.get('course_code'):
    rep(doc, "course_code")
    header += data.get("course_code", "") + ") Sem: "
if data.get('Module/Semester'):
    rep(doc, "Module/Semester")
    header += data.get("Module/Semester", "")

#######################################################################################################################
# Code for adding headers to the document

section = doc.sections[0]
section.different_first_page_header_footer = True

# First page header
first_page_header = section.first_page_header
first_page_paragraph = first_page_header.paragraphs[0] if first_page_header.paragraphs else first_page_header.add_paragraph()
first_page_paragraph.text = header
first_page_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
first_page_paragraph.paragraph_format.right_indent = Inches(0.2)

# Header for the rest of the pages
default_header = section.header
default_paragraph = default_header.paragraphs[0] if default_header.paragraphs else default_header.add_paragraph()
default_paragraph.text = header
default_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
default_paragraph.paragraph_format.right_indent = Inches(0.2)

#######################################################################################################################
# Course Description and Objectives
if data.get('course_description'):
    if doc.paragraphs and doc.paragraphs[-1].text.strip():
        doc.add_page_break()
    course_heading = doc.add_heading(level=1)
    course_heading.paragraph_format.left_indent = Inches(0.5)
    course_run = course_heading.add_run('6. Course Description and its objectives')
    course_run.font.name = 'Carlito'
    course_run.font.size = Pt(16)
    course_run.font.color.rgb = RGBColor(28, 132, 196)
    course_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()
    course_description_paragraph = doc.add_paragraph(data['course_description'])
    course_description_paragraph.paragraph_format.left_indent = Inches(0.7)
    course_description_paragraph.paragraph_format.right_indent = Inches(0.5)
    course_description_paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

#######################################################################################################################
# CO-PO Mapping Section
if data.get('copoMappingData'):
    doc.add_page_break()
    co_heading = doc.add_heading(level=1)
    co_run = co_heading.add_run('7. Course Outcomes and CO-PO Mapping')
    co_run.font.name = 'Carlito'
    co_run.font.size = Pt(16)
    co_run.font.color.rgb = RGBColor(28, 132, 196)
    co_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    if data['copoMappingData'].get('courseOutcomes'):
        doc.add_paragraph()
        course_outcomes_heading = doc.add_paragraph()
        course_outcomes_run = course_outcomes_heading.add_run('Course Outcomes:')
        course_outcomes_run.bold = True
        course_outcomes_run.font.size = Pt(12)
        course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
        course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
        course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

        for co_key, co_value in data['copoMappingData']['courseOutcomes'].items():
            if isinstance(co_value, dict):
                doc.add_paragraph()
                paragraph = doc.add_paragraph(f'{co_key}: {co_value["description"]}')
                paragraph.paragraph_format.left_indent = Inches(0.7)
                paragraph.paragraph_format.right_indent = Inches(0.5)
                for bullet in co_value.get('bullets', []):
                    bullet_paragraph = doc.add_paragraph('• ' + bullet)
                    bullet_paragraph.paragraph_format.left_indent = Inches(1)
                    bullet_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
            else:
                doc.add_paragraph()
                paragraph = doc.add_paragraph(f'{co_key}: {co_value}')
                paragraph.paragraph_format.left_indent = Inches(0.7)
                paragraph.paragraph_format.right_indent = Inches(0.5)

    if data['copoMappingData'].get('mappingData'):
        doc.add_paragraph()
        mapping_heading = doc.add_paragraph()
        mapping_run = mapping_heading.add_run('CO/PO Mapping:')
        mapping_run.bold = True
        mapping_run.font.size = Pt(12)
        mapping_heading.paragraph_format.left_indent = Inches(0.7)
        mapping_heading.paragraph_format.right_indent = Inches(0.5)
        mapping_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

        co_po_mapping = data['copoMappingData']['mappingData']
        doc.add_paragraph()

        table = doc.add_table(rows=1, cols=len(co_po_mapping[list(co_po_mapping.keys())[0]]) + 1)
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Course Outcomes (CO)'
        for i, po_key in enumerate(co_po_mapping[list(co_po_mapping.keys())[0]].keys()):
            hdr_cells[i + 1].text = po_key

        for co_key, po_values in co_po_mapping.items():
            row_cells = table.add_row().cells
            row_cells[0].text = co_key
            for i, value in enumerate(po_values.values()):
                row_cells[i + 1].text = str(value) if value != "" else ""

        for row in table.rows:
            for cell in row.cells:
                cell.width = Inches(0.1)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = Pt(10)

        # Set borders for the table cells
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

#######################################################################################################################
# Course Syllabus Section
if data.get('Course Syllabus'):
    doc.add_page_break()
    syllabus_heading = doc.add_heading(level=1)
    syllabus_run = syllabus_heading.add_run('8. Course Syllabus')
    syllabus_run.font.name = 'Carlito'
    syllabus_run.font.size = Pt(16)
    syllabus_run.font.color.rgb = RGBColor(28, 132, 196)
    syllabus_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    table = doc.add_table(rows=1, cols=4)
    hdr_cells = table.rows[0].cells
    headers = ['Sr. No.', 'Content', 'CO', 'Sessions']
    for i, header_text in enumerate(headers):
        hdr_cells[i].text = header_text
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header_text)
        run.bold = True
        run.font.size = Pt(10)

    for item in data['Course Syllabus']:
        row_cells = table.add_row().cells
        row_cells[0].text = str(item.get('srNo', ''))
        row_cells[1].text = str(item.get('content', ''))
        row_cells[2].text = str(item.get('co', ''))
        row_cells[3].text = str(item.get('sessions', ''))
        for cell in row_cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    widths = [Inches(0.8), Inches(3.5), Inches(0.8), Inches(0.8)]
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(widths):
                cell.width = widths[idx]

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

#######################################################################################################################
# Learning Resources Section
def create_learning_resources_doc(data):
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('9. Learning Resources')
    timetable_run.font.name = 'Carlito'
    timetable_run.font.size = Pt(16)
    timetable_run.font.color.rgb = RGBColor(28, 132, 196)
    timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    textbooks_heading = doc.add_heading('Text Books:', level=2)
    textbooks_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    textbooks_run = textbooks_heading.runs[0]
    textbooks_run.bold = True
    textbooks_run.font.size = Pt(12)
    
    if data.get('textBooks'):
        for book in data['textBooks']:
            para = doc.add_paragraph()
            para.paragraph_format.left_indent = Inches(1)
            bullet = para.add_run("✓ ")
            bullet.font.size = Pt(12)
            text = para.add_run(book)
            text.font.size = Pt(12)

    doc.add_paragraph()
    
    ref_heading = doc.add_heading('Reference Links:', level=2)
    ref_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    ref_run = ref_heading.runs[0]
    ref_run.bold = True
    ref_run.font.size = Pt(12)
    
    if data.get('referenceLinks'):
        for link in data['referenceLinks']:
            para = doc.add_paragraph()
            para.paragraph_format.left_indent = Inches(1)
            bullet = para.add_run("• ")
            bullet.font.size = Pt(12)
            link_run = para.add_run(link)
            link_run.font.size = Pt(12)
            link_run.font.color.rgb = RGBColor(0, 0, 255)
            link_run.underline = True

create_learning_resources_doc(data["Learning Resources"])

#######################################################################################################################
# Weekly Timetable Section
if data.get('weeklyTimetableData'):
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('10. Weekly Timetable')
    timetable_run.font.name = 'Carlito'
    timetable_run.font.size = Pt(16)
    timetable_run.font.color.rgb = RGBColor(28, 132, 196)
    timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()
    time_slots = list(data['weeklyTimetableData']['Monday'].keys())
    days = list(data['weeklyTimetableData'].keys())
    table = doc.add_table(rows=len(time_slots) + 1, cols=len(days) + 1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    header_cells = table.rows[0].cells
    header_cells[0].text = 'Time'
    for i, day in enumerate(days):
        header_cells[i + 1].text = day
        paragraph = header_cells[i + 1].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(day)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    time_paragraph = header_cells[0].paragraphs[0]
    time_run = time_paragraph.runs[0] if time_paragraph.runs else time_paragraph.add_run('Time')
    time_run.bold = True
    time_run.font.size = Pt(10)
    time_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for i, time_slot in enumerate(time_slots):
        row_cells = table.rows[i + 1].cells
        row_cells[0].text = time_slot
        for j, day in enumerate(days):
            is_available = data['weeklyTimetableData'][day][time_slot]
            cell = row_cells[j + 1]
            cell.text = data['course_name'] + " (" + data['course_code'] + ")" if is_available else ''
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                run.font.size = Pt(10)

    column_widths = [Inches(1.1)] + [Inches(1)] * len(days)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

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

    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

#######################################################################################################################
# Updated Actions Taken for Weak Students Section (create_actions_doc)
def create_actions_doc(data):
    if data.get('actionsForWeakStudentsData'):
        # Add the main heading with a page break.
        doc.add_page_break()
        timetable_heading = doc.add_heading(level=1)
        timetable_run = timetable_heading.add_run('14. Actions taken for weak students')
        timetable_run.font.name = 'Carlito'
        timetable_run.font.size = Pt(16)
        timetable_run.font.color.rgb = RGBColor(28, 132, 196)
        timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        # Loop through each action and add as a bullet.
        for action in data['actionsForWeakStudentsData']:
            para = doc.add_paragraph()
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            para.paragraph_format.left_indent = Pt(0)
            para.paragraph_format.first_line_indent = Pt(0)
            bullet_run = para.add_run("• ")
            bullet_run.font.size = Pt(12)
            action_run = para.add_run(action)
            action_run.font.size = Pt(12)

create_actions_doc(data)

#######################################################################################################################
# Saving the Document and Converting to PDF
output_doc = './download/' + data['filename'][:-4] + '_del' + '.docx'
doc.save(output_doc)
print("Document updated and saved.")
convert(output_doc)
os.remove(output_doc)

if(data.get('mergePDF')):
    pdf_list = [output_doc.replace('.docx', '.pdf'), "./data/1/" + data['mergePDF']]

pdf_list = [output_doc.replace('.docx', '.pdf')]
merger = PdfMerger()
for pdf in pdf_list:
    print(pdf)
    merger.append(pdf)

# Optionally remove the temporary PDF file:
# os.remove(output_doc.replace('.docx', '.pdf'))

merger.write("./download/" + data['filename'])
merger.close()