import json
import sys
import os
import uuid
from filelock import FileLock, Timeout
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx2pdf import convert
from PyPDF2 import PdfMerger
import matplotlib.pyplot as plt
import numpy as np
import io
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn



input_data = sys.stdin.read()
data = json.loads(input_data)

if data.get('Program'):
    program_value = data.get("Program", "0")
    proram_number = str(program_value)
    if program_value == "0" or program_value > 10:
        with open('./extractor/sample.docx', 'rb') as f:
            doc = Document(f)
    else:
        with open('./extractor/'+proram_number+'.docx', 'rb') as f:
            doc = Document(f)
else:
    with open('./extractor/sample.docx', 'rb') as f:
        doc = Document(f)

header = ""

def rep(doc, key):
    for paragraph in doc.paragraphs:
        placeholder = f'{{{{{key}}}}}'
        if placeholder in paragraph.text:
            if key == "Program":
                program_options = {
                    "1": "Computer Science Engineering",
                    "2": "Mechanical Engineering", 
                    "3": "Electronics and Computer Engineering",
                    "4": "BBA",
                    "5": "BCOM (Hons)",
                    "6": "Integrated BBA MBA",
                    "7": "BA (Hons) Liberal Arts",
                    "8": "BA LLB (Hons)",
                    "9": "BBA LLB (Hons)",
                    "10":"MBA",
                }
                program_value = data.get(key, "0")
                program_number = str(program_value)
                program_name = program_options.get(program_number, f"Unknown Program: {program_value}")
                paragraph.text = paragraph.text.replace(placeholder, program_name)
            else:
                value = data.get(key, "")
                paragraph.text = paragraph.text.replace(placeholder, value)

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


section = doc.sections[0]
section.different_first_page_header_footer = True

first_page_header = section.first_page_header
first_page_paragraph = first_page_header.paragraphs[0] if first_page_header.paragraphs else first_page_header.add_paragraph()
first_page_paragraph.text = header
first_page_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
first_page_paragraph.paragraph_format.right_indent = Inches(0.2)

default_header = section.header
default_paragraph = default_header.paragraphs[0] if default_header.paragraphs else default_header.add_paragraph()
default_paragraph.text = header
default_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
default_paragraph.paragraph_format.right_indent = Inches(0.2)


def set_table_column_widths(table, widths):
    """Set column widths for a table"""
    for i, width in enumerate(widths):
        for row in table.rows:
            if i < len(row.cells):
                row.cells[i].width = width
                
def prevent_table_row_breaks(table):
    """Ensure table rows don't split across pages"""
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)



################################################### 1-6 ####################################################################
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
    course_description = data['course_description'].encode('utf-8', 'ignore').decode('utf-8')
    course_description_paragraph = doc.add_paragraph(course_description)
    # course_description_paragraph = doc.add_paragraph(data['course_description'])
    course_description_paragraph.paragraph_format.left_indent = Inches(0.7)
    course_description_paragraph.paragraph_format.right_indent = Inches(0.5)
    course_description_paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

##################################################### 7  COPO MAPPING##################################################################
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
        mapping_run.font.size = Pt(10)
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
                cell.width = Inches(0.06)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = Pt(8)

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

################################################ 8,9. Course Syllabus#######################################################################
# Course Syllabus Section
if data.get('Course Syllabus'):
    doc.add_page_break()
    syllabus_heading = doc.add_heading(level=1)
    syllabus_run = syllabus_heading.add_run('8, 9. Course Syllabus')
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

############################################# Learning Resources##########################################################################
def create_learning_resources_doc(data):
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('Learning Resources')
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
            safe_book = book.encode('utf-8', 'replace').decode('utf-8')
            text = para.add_run(safe_book)
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
            safe_link = link.encode('utf-8', 'replace').decode('utf-8')
            link_run = para.add_run(safe_link)
            link_run.font.size = Pt(12)
            link_run.font.color.rgb = RGBColor(0, 0, 255)
            link_run.underline = True

create_learning_resources_doc(data["Learning Resources"])



###############################################10. Weekly Time Table########################################################################
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
    
    if 'entries' in data['weeklyTimetableData']:
        entries = data['weeklyTimetableData'].get('entries', [])
        
        if entries:
            days_order = {
                'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 
                'Friday': 5, 'Saturday': 6, 'Sunday': 7
            }
            
            sorted_entries = sorted(entries, key=lambda x: (
                days_order.get(x.get('day', ''), 999),
                0 if x.get('period', '') == 'AM' else 1,
                x.get('hour', 0)
            ))
            
            table = doc.add_table(rows=len(sorted_entries) + 1, cols=4)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            
            header_cells = table.rows[0].cells
            headers = ['Day', 'Start Time', 'End Time', 'Duration (hrs)']
            
            for i, header in enumerate(headers):
                header_cells[i].text = header
                paragraph = header_cells[i].paragraphs[0]
                run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
                run.bold = True
                run.font.size = Pt(11)
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            def get_end_time(start_hour, period, duration):
                hour = start_hour
                end_period = period
                
                hour_part = int(duration)
                minute_part = int((duration - hour_part) * 60)
                
                hour += hour_part
                minutes = minute_part
                
                if hour >= 12:
                    if hour > 12:
                        hour = hour - 12
                    if period == 'AM':
                        end_period = 'PM'
                
                return f"{hour}:{minutes:02d} {end_period}"
            
            for i, entry in enumerate(sorted_entries):
                row_cells = table.rows[i + 1].cells
                day = entry.get('day', '')
                hour = entry.get('hour', 0)
                period = entry.get('period', 'AM')
                duration = entry.get('duration', 1)
                
                start_time = f"{hour}:00 {period}"
                end_time = get_end_time(hour, period, duration)
                
                row_cells[0].text = day
                row_cells[1].text = start_time
                row_cells[2].text = end_time
                row_cells[3].text = str(duration)
                
                for j, cell in enumerate(row_cells):
                    paragraph = cell.paragraphs[0]
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    for run in paragraph.runs:
                        run.font.size = Pt(10)
            
            column_widths = [Inches(1.5), Inches(1.2), Inches(1.2), Inches(1)]
            for row in table.rows:
                for idx, cell in enumerate(row.cells):
                    if idx < len(column_widths):
                        cell.width = column_widths[idx]
            
            doc.add_paragraph().add_run().add_break()
            overview_para = doc.add_paragraph()
            overview_run = overview_para.add_run("Weekly Overview")
            overview_run.bold = True
            overview_run.font.size = Pt(12)
            
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            overview_table = doc.add_table(rows=1, cols=len(days))
            overview_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            
            header_cells = overview_table.rows[0].cells
            for i, day in enumerate(days):
                header_cells[i].text = day
                paragraph = header_cells[i].paragraphs[0]
                run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(day)
                run.bold = True
                run.font.size = Pt(10)
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            class_row = overview_table.add_row()
            class_cells = class_row.cells
            
            day_entries = {}
            for day in days:
                day_entries[day] = [e for e in sorted_entries if e.get('day') == day]
            
            for i, day in enumerate(days):
                cell = class_cells[i]
                entries_for_day = day_entries[day]
                
                if entries_for_day:
                    for entry in entries_for_day:
                        start_time = f"{entry.get('hour', 0)}:00 {entry.get('period', 'AM')}"
                        end_time = get_end_time(entry.get('hour', 0), entry.get('period', 'AM'), entry.get('duration', 1))
                        
                        paragraph = cell.add_paragraph()
                        run = paragraph.add_run(f"{start_time} - {end_time}")
                        run.font.size = Pt(9)
                        run.bold = True
                        
                        detail_para = cell.add_paragraph()
                        detail_run = detail_para.add_run(f"{data['course_code']} ({entry.get('duration')}hr)")
                        detail_run.font.size = Pt(8)
                        detail_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        
                        if entry != entries_for_day[-1]:
                            cell.add_paragraph()
                else:
                    paragraph = cell.add_paragraph()
                    run = paragraph.add_run("No class")
                    run.font.size = Pt(9)
                    run.italic = True
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            column_width = Inches(1.1)
            for row in overview_table.rows:
                for cell in row.cells:
                    cell.width = column_width
                    
    else:
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

    for table in doc.tables[-2:]:  
        for row in table.rows:
            for cell in row.cells:
                set_cell_border(cell, 'top', 4, '000000')
                set_cell_border(cell, 'bottom', 4, '000000')
                set_cell_border(cell, 'left', 4, '000000')
                set_cell_border(cell, 'right', 4, '000000')

            tr = row._tr
            trPr = tr.get_or_add_trPr()
            cantSplit = OxmlElement('w:cantSplit')
            trPr.append(cantSplit)  


##################################################11.  Registered Student List  ########################################################

if data.get('studentData'):
    doc.add_page_break()
    reg_students_heading = doc.add_heading(level=1)
    reg_students_run = reg_students_heading.add_run('11. Registered Students List')
    reg_students_run.font.name = 'Carlito'
    reg_students_run.font.size = Pt(16)
    reg_students_run.font.color.rgb = RGBColor(28, 132, 196)
    reg_students_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    doc.add_paragraph()
    
    student_data = data['studentData']['data']
    all_keys = list(student_data[0].keys())
    
    student_info_keys = all_keys[:3]  
    all_headers = student_info_keys 
    table = doc.add_table(rows=1, cols=len(all_headers))
    
    # Set header row
    header_cells = table.rows[0].cells
    for i, header_text in enumerate(all_headers):
        header_cells[i].text = header_text
        paragraph = header_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header_text)
        run.bold = True
        run.font.size = Pt(9)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add student rows
    for student in student_data:
        row_cells = table.add_row().cells
        for i, key in enumerate(student_info_keys):
            row_cells[i].text = str(student.get(key, ''))
        
        for cell in row_cells:
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                run.font.size = Pt(9)
    
    total_width = Inches(6.3)  
    column_width = total_width / len(all_headers)
    
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = column_width
    
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
            set_cell_border(cell, 'top', 3, '000000')
            set_cell_border(cell, 'bottom', 3, '000000')
            set_cell_border(cell, 'left', 3, '000000')
            set_cell_border(cell, 'right', 3, '000000')
    
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)
        
        
        
        
############################################################## 12. Internal Assessment Data#####################################################################
        
if data.get('internalAssessmentData') and data['internalAssessmentData'].get('components'):

    doc.add_page_break()
    assessment_heading = doc.add_heading(level=1)
    assessment_run = assessment_heading.add_run('12. Internal Assessment Data')
    assessment_run.font.name = 'Carlito'
    assessment_run.font.size = Pt(16)
    assessment_run.font.color.rgb = RGBColor(28, 132, 196)
    assessment_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    components = data['internalAssessmentData']['components']
    headers = list(next(iter(components.values())).keys())
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header.capitalize()  
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for component_id, component_data in components.items():
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(component_data.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    column_widths = [Inches(1) for _ in range(len(headers) - 1)] + [Inches(2.5)]
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
        
def format_cell(cell, bold=False, alignment=WD_ALIGN_PARAGRAPH.LEFT):
    """Format a table cell"""
    paragraph = cell.paragraphs[0]
    paragraph.alignment = alignment
    
    for run in paragraph.runs:
        run.font.bold = bold
        run.font.size = Pt(10)
    
    if not paragraph.runs:
        run = paragraph.add_run(cell.text)
        run.font.bold = bold
        run.font.size = Pt(10)
        cell.text = ""  


def create_learner_categorization_partial_sem(doc, data):
    doc.add_page_break()
    heading = doc.add_heading(level=1)
    run = heading.add_run('13. Student Learning Categories for Partial Semester')
    run.font.name = 'Carlito'
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(28, 132, 196)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    doc.add_paragraph()
    
    student_data = data.get("studentData", {}).get("data", [])
    par_sem = data.get("par_sem_slowLearner", [])
    advanced_ids = {stud["id"] for stud in par_sem[0]} if len(par_sem) > 0 else set()
    slow_ids = {stud["id"] for stud in par_sem[1]} if len(par_sem) > 1 else set()
    
    advanced_learners = []
    slow_learners = []
    medium_learners = []
    for student in student_data:
        unique_id = student.get("Unique Id.")
        if unique_id in advanced_ids:
            advanced_learners.append(student)
        elif unique_id in slow_ids:
            slow_learners.append(student)
        else:
            medium_learners.append(student)
            
    summary_heading = doc.add_heading('Learner Categories Summary for Partial Semester', level=2)
    summary_heading.runs[0].font.size = Pt(14)
    doc.add_paragraph()
    
    summary_table = doc.add_table(rows=4, cols=2)
    summary_table.autofit = False

    header_cells = summary_table.rows[0].cells
    header_cells[0].text = "Learner Category"
    header_cells[1].text = "Number of Students"
    format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    format_cell(header_cells[1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    
    categories = [
        ("Advanced Learners", len(advanced_learners)),
        ("Medium Learners", len(medium_learners)),
        ("Low Performers", len(slow_learners))
    ]
    for idx, (category, count) in enumerate(categories):
        row = summary_table.rows[idx + 1]
        row.cells[0].text = category
        row.cells[1].text = str(count)
        format_cell(row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(row.cells[1], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
    col_widths = [Inches(3), Inches(3)]
    set_table_column_widths(summary_table, col_widths)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.autofit = False
    for row in summary_table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')
            
    for row in summary_table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9)
    prevent_table_row_breaks(summary_table)
    doc.add_paragraph().add_run().add_break()
    
    #######################################  Action taken for weak stduent (14,16)  ##################################################################################
    def create_actions_doc(data):
        if data.get('actionsForWeakStudentsData'):
            doc.add_page_break()
            timetable_heading = doc.add_heading(level=1)
            timetable_run = timetable_heading.add_run('14. Actions taken for weak students')
            timetable_run.font.name = 'Carlito'
            timetable_run.font.size = Pt(16)
            timetable_run.font.color.rgb = RGBColor(28, 132, 196)
            timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
            
            for action in data['actionsForWeakStudentsData']:
                para = doc.add_paragraph()
                para.alignment = WD_ALIGN_PARAGRAPH.LEFT
                para.paragraph_format.left_indent = Inches(1)
                para.paragraph_format.first_line_indent =  Pt(0)
                bullet_run = para.add_run("• ")
                bullet_run.font.size = Pt(12)
                action_run = para.add_run(action)
                action_run.font.size = Pt(12)

    create_actions_doc(data)
    #################################### 15,23 Styudent Learning classification ###################################################################
    detailed_heading = doc.add_heading('15,23. Student Learning Classification for Partial Semester', level=2)
    detailed_heading.runs[0].font.size = Pt(14)
    doc.add_paragraph()
    
    total_students = len(student_data)
    student_table = doc.add_table(rows=total_students + 1, cols=2)
    student_table.autofit = False
    
    header_cells = student_table.rows[0].cells
    header_cells[0].text = "Student Name"
    header_cells[1].text = "Category"
    format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    format_cell(header_cells[1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    set_table_column_widths(student_table, [Inches(3), Inches(3)])
    
    all_students = advanced_learners + medium_learners + slow_learners
    for idx, student in enumerate(all_students):
        row = student_table.rows[idx + 1]
        name = student.get("Student Name", "")
        unique_id = student.get("Unique Id.")
        if unique_id in advanced_ids:
            category = "Advanced Learner"
            color = "C6E0B4"  # green
        elif unique_id in slow_ids:
            category = "Slow Learner"
            color = "FFEB9C"  # yellow
        else:
            category = "Medium Learner"
            color = "F2F2F2"  # grey

        row.cells[0].text = name
        row.cells[1].text = category
        format_cell(row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(row.cells[1], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        for cell in row.cells:
            tc_pr = cell._tc.get_or_add_tcPr()
            shading = OxmlElement('w:shd')
            shading.set(qn('w:val'), 'clear')
            shading.set(qn('w:color'), 'auto')
            shading.set(qn('w:fill'), color)
            existing_shading = tc_pr.find(qn('w:shd'))
            if existing_shading is not None:
                tc_pr.remove(existing_shading)
            tc_pr.append(shading)
    
    student_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    student_table.autofit = False
    for row in student_table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')
    for row in student_table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9)
    prevent_table_row_breaks(student_table)
    doc.add_paragraph()
    
create_learner_categorization_partial_sem(doc, data)

######################## Marks and details of all assessments 18,20 #############################

if data.get('studentData'):
    
    marks_heading = doc.add_heading(level=1)
    marks_run = marks_heading.add_run('18, 20 Detail of Marks in all components up to the End Semester')
    marks_run.font.name = 'Carlito'
    marks_run.font.size = Pt(16)
    marks_run.font.color.rgb = RGBColor(28, 132, 196)
    marks_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    first_student = student_data[0]
    doc.add_paragraph()

    student_info_keys = list(first_student.keys())[:3]
    
    assessment_keys = [key for key in data['studentData']['maxMarks'].keys() 
                       if not key.lower().startswith('total')]

    grading_column = None
    for key in all_keys:
        if 'grade' in key.lower() or 'grading' in key.lower():
            grading_column = key
            break
    
    marks_headers = student_info_keys + assessment_keys
    if grading_column and grading_column not in marks_headers:
        marks_headers.append(grading_column)
    
    table = doc.add_table(rows=1, cols=len(marks_headers))
    
    header_cells = table.rows[0].cells
    
    for i, header_text in enumerate(marks_headers):
        header_cells[i].text = header_text
        
        if header_text in data['studentData']['maxMarks']:
            max_mark = data['studentData']['maxMarks'][header_text]
            header_cells[i].add_paragraph(f"Out of ({max_mark})")
            
        for paragraph in header_cells[i].paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.size = Pt(9)
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    for student in student_data:
        row_cells = table.add_row().cells
        
        for i, header in enumerate(marks_headers):
            value = student.get(header, '')
            row_cells[i].text = str(value)
        
        for cell in row_cells:
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                run.font.size = Pt(9)
    
    total_width = Inches(7.0)
    
    id_cols_count = len(student_info_keys)
    id_cols_total = 0.4 * total_width  
    id_col_width = id_cols_total / id_cols_count if id_cols_count > 0 else 0
    id_widths = [id_col_width] * id_cols_count
    
    assessment_count = len(assessment_keys)
    assessment_total = 0.5 * total_width
    assessment_width = assessment_total / assessment_count if assessment_count > 0 else 0
    assessment_widths = [assessment_width] * assessment_count
    
    grade_width = []
    if grading_column in marks_headers:
        grade_width = [0.1 * total_width]
    
    widths = id_widths + assessment_widths + grade_width
    
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(widths):
                cell.width = widths[idx]
    
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 3, '000000')
            set_cell_border(cell, 'bottom', 3, '000000')
            set_cell_border(cell, 'left', 3, '000000')
            set_cell_border(cell, 'right', 3, '000000')
    
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)
    
    doc.add_page_break()
    attendance_heading = doc.add_heading(level=1)
    attendance_run = attendance_heading.add_run('19. Attendance Report')
    attendance_run.font.name = 'Carlito'
    attendance_run.font.size = Pt(16)
    attendance_run.font.color.rgb = RGBColor(28, 132, 196)
    attendance_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    student_data = data['studentData']['data']
    
    all_keys = list(first_student.keys())
    
    student_info_keys = all_keys[:3]
    
    attendance_column = None
    for key in all_keys:
        if 'attendance' in key.lower():
            attendance_column = key
            break
    
    if not attendance_column:
        assessment_keys = list(data['studentData']['maxMarks'].keys())
        for key in reversed(all_keys):
            if key not in assessment_keys and key not in ['grade', 'grading', 'Grade', 'Grading']:
                attendance_column = key
                break
    
    attendance_headers = student_info_keys.copy()
    if attendance_column and attendance_column not in attendance_headers:
        attendance_headers.append(attendance_column)

    table = doc.add_table(rows=1, cols=len(attendance_headers))

    header_cells = table.rows[0].cells
    for i, header_text in enumerate(attendance_headers):
        header_cells[i].text = header_text
        paragraph = header_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header_text)
        run.bold = True
        run.font.size = Pt(9)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for student in student_data:
        row_cells = table.add_row().cells
        
        for i, header in enumerate(attendance_headers):
            value = student.get(header, '')
            row_cells[i].text = str(value)
        
        for cell in row_cells:
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                run.font.size = Pt(9)

    cell_width = Inches(7.0) / len(attendance_headers)
    widths = [cell_width] * len(attendance_headers)

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
            set_cell_border(cell, 'top', 3, '000000')
            set_cell_border(cell, 'bottom', 3, '000000')
            set_cell_border(cell, 'left', 3, '000000')
            set_cell_border(cell, 'right', 3, '000000')

    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)
        
    doc.add_page_break()
    
################################################################  Attainment Table #########################


def create_co_attainment_analysis(doc, data):
    """Generate CO attainment analysis tables with support for multi-page tables and charts"""
    if not all(key in data for key in ['coWeightages', 'studentData', 'coAttainmentCriteria', 'copoMappingData']):
        return  

    # Add section heading with page break
    doc.add_page_break()
    heading = doc.add_heading(level=1)
    run = heading.add_run('22. CO Attainment Analysis')
    run.font.name = 'Carlito'
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(28, 132, 196)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    doc.add_paragraph()

    result = calculate_co_attainment(data)
    cos = list(data.get('coWeightages', {}).keys())

    summary_heading = doc.add_heading('CO Attainment Summary', level=2)
    summary_heading.runs[0].font.size = Pt(14)
    doc.add_paragraph()
    
    summary_table = doc.add_table(rows=6, cols=len(cos) + 1)
    doc.add_paragraph()
    
    header_cells = summary_table.rows[0].cells
    header_cells[0].text = "Course Outcomes"
    
    for i, co in enumerate(cos):
        header_cells[i + 1].text = co
        format_cell(header_cells[i + 1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    
    format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.LEFT)
    
    row_labels = ["Weights", "No. of students who scored at the highest attainment level (3)", 
                 "Percentage of students who scored at the highest attainment level (3)", "Attainment Level"]
    
    for row_idx, label in enumerate(row_labels):
        row = summary_table.rows[row_idx + 1]
        row.cells[0].text = label
        format_cell(row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.LEFT)
        
        for col_idx, co in enumerate(cos):
            cell = row.cells[col_idx + 1]
            
            if row_idx == 0:  # Weights
                cell.text = result["attainment_summary"]["weights"].get(co, "0.00%")
            elif row_idx == 1:  # Students scored 3
                cell.text = str(result["attainment_summary"]["students_scored3"].get(co, 0))
            elif row_idx == 2:  # Percentage scored 3
                cell.text = result["attainment_summary"]["percentage_scored3"].get(co, "0%")
            elif row_idx == 3:  # Attainment Level
                cell.text = str(result["attainment_summary"]["attainment_level"].get(co, 0))
            
            format_cell(cell, bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    
    overall_row = summary_table.rows[5]
    overall_row.cells[0].text = "Overall Course Attainment"
    format_cell(overall_row.cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.LEFT)
    
    overall_row.cells[1].text = f"{result['attainment_summary']['overall_attainment']:.4f}"
    
    for i in range(2, len(cos) + 1):
        try:
            overall_row.cells[1].merge(overall_row.cells[i])
        except:
            pass
    
    format_cell(overall_row.cells[1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    
    for row in summary_table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')
    
    col_widths = [Inches(2)] + [Inches(1)] * len(cos)
    set_table_column_widths(summary_table, col_widths)
    
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    summary_table.autofit = False
    
    for row in summary_table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9) 
    
    prevent_table_row_breaks(summary_table)
    doc.add_paragraph()
    doc.add_paragraph()
    
    add_percentage_scored3_chart(doc, result, cos)
    doc.add_paragraph()
    
    all_pos = set()
    for co, po_mappings in data.get('copoMappingData', {}).get('mappingData', {}).items():
        all_pos.update(po_mappings.keys())
    
    pos = sorted(list(all_pos), key=lambda x: (
        'PSO' in x, 
        int(''.join(filter(str.isdigit, x or '0'))) if any(c.isdigit() for c in x) else 0
    ))
    
    if pos:
        doc.add_page_break()
        program_heading = doc.add_heading('Program Attainment', level=2)
        program_heading.runs[0].font.size = Pt(14)
        doc.add_paragraph()
        
        program_table = doc.add_table(rows=2, cols=len(pos) + 1)
        
        header_cells = program_table.rows[0].cells
        header_cells[0].text = "Program Outcomes"
        
        for i, po in enumerate(pos):
            header_cells[i + 1].text = po
            format_cell(header_cells[i + 1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
        format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.LEFT)
        
        data_row = program_table.rows[1]
        data_row.cells[0].text = "Program Attainment"
        format_cell(data_row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.LEFT)
        
        for col_idx, po in enumerate(pos):
            data_row.cells[col_idx + 1].text = result["program_attainment"].get(po, "0.00")
            format_cell(data_row.cells[col_idx + 1], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
        for row in program_table.rows:
            for cell in row.cells:
                set_cell_border(cell, 'top', 4, '000000')
                set_cell_border(cell, 'bottom', 4, '000000')
                set_cell_border(cell, 'left', 4, '000000')
                set_cell_border(cell, 'right', 4, '000000')
        
        program_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        prevent_table_row_breaks(program_table)
        doc.add_paragraph()
        doc.add_paragraph()
        
        add_program_attainment_chart(doc, result, pos)
        doc.add_paragraph()
    if result["student_performance"]:
        doc.add_page_break()
        student_heading = doc.add_heading('Student-wise CO Achievement', level=2)
        student_heading.runs[0].font.size = Pt(14)
        doc.add_paragraph()
        
        rows_count = len(result["student_performance"]) + 2 
        student_table = doc.add_table(rows=rows_count, cols=len(cos) + 1)
        
        header_cells = student_table.rows[0].cells
        header_cells[0].text = "NAME"
        
        for i, co in enumerate(cos):
            header_cells[i + 1].text = f"{co} Score"
            format_cell(header_cells[i + 1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
        format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
       
        for row_idx, student in enumerate(result["student_performance"]):
            row = student_table.rows[row_idx + 1]
            row.cells[0].text = student["rollNumber"]
            format_cell(row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.LEFT)
            
            for col_idx, co in enumerate(cos):
                cell = row.cells[col_idx + 1]
                cell.text = str(student["coScores"].get(co, ""))
                format_cell(cell, bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
        
        avg_row = student_table.rows[rows_count - 1]
        avg_row.cells[0].text = "Average"
        format_cell(avg_row.cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.LEFT)
        
        for col_idx, co in enumerate(cos):
            cell = avg_row.cells[col_idx + 1]
            cell.text = result["averages"].get(co, "0.00")
            format_cell(cell, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
        set_table_column_widths(student_table, [Inches(2.0)] + [Inches(0.9)] * len(cos))
        
        for row in student_table.rows:
            for cell in row.cells:
                set_cell_border(cell, 'top', 4, '000000')
                set_cell_border(cell, 'bottom', 4, '000000')
                set_cell_border(cell, 'left', 4, '000000')
                set_cell_border(cell, 'right', 4, '000000')
        
        student_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        doc.add_paragraph()
        doc.add_paragraph()
        
        add_course_attainment_chart(doc, result, cos)
        doc.add_paragraph()

def add_percentage_scored3_chart(doc, result, cos):
    """Create a horizontal bar chart showing percentage of students who scored ≥ 3 for each CO"""
    plt.figure(figsize=(8, 4))
    
    percentages = [float(result["attainment_summary"]["percentage_scored3"].get(co, "0%").replace("%", "")) for co in cos]
    
    y_pos = np.arange(len(cos))
    plt.barh(y_pos, percentages, color=(49/255, 85/255, 163/255, 0.6)) 
    
    plt.yticks(y_pos, cos)
    plt.xlabel('Percentage (%)')
    plt.title('Percentage of students who scored at the highest attainment level (3)')
    plt.xlim(0, 100)
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    
    for i, v in enumerate(percentages):
        plt.text(v + 1, i, f"{v:.2f}%", va='center')
    
    image_stream = io.BytesIO()
    plt.tight_layout()
    plt.savefig(image_stream, format='png', dpi=100)
    image_stream.seek(0)
    doc.add_picture(image_stream, width=Inches(6))
    plt.close()
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

def add_program_attainment_chart(doc, result, pos):
    """Create a horizontal bar chart showing program attainment for each PO"""
    plt.figure(figsize=(8, 5))
    
    attainments = [float(result["program_attainment"].get(po, "0.00")) for po in pos]
    
    y_pos = np.arange(len(pos))
    plt.barh(y_pos, attainments, color=(49/255, 85/255, 163/255, 0.6)) 
    
    plt.yticks(y_pos, pos)
    plt.xlabel('Attainment')
    plt.title('Program Attainment')
    plt.xlim(0, 3)
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    
    for i, v in enumerate(attainments):
        plt.text(v + 0.1, i, f"{v:.2f}", va='center')
    
    image_stream = io.BytesIO()
    plt.tight_layout()
    plt.savefig(image_stream, format='png', dpi=100)
    image_stream.seek(0)
    doc.add_picture(image_stream, width=Inches(6))
    plt.close()
    
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

def add_course_attainment_chart(doc, result, cos):
    """Create a horizontal bar chart showing CO attainment with target line"""
    plt.figure(figsize=(8, 4))
    
    attainments = [float(result["averages"].get(co, "0.00")) for co in cos]
    
    y_pos = np.arange(len(cos))
    plt.barh(y_pos, attainments, color=(49/255, 85/255, 163/255, 0.6), label='Attainment')
    
    plt.axvline(x=3, color=(237/255, 125/255, 49/255, 0.6), linestyle='-', linewidth=2, label='Required')
    
    plt.yticks(y_pos, cos)
    plt.xlabel('Attainment Score')
    plt.title('Course Outcome Attainment')
    plt.xlim(0, 3.5)
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    plt.legend(loc='lower right')
    
    for i, v in enumerate(attainments):
        plt.text(v + 0.1, i, f"{v:.2f}", va='center')
    
    image_stream = io.BytesIO()
    plt.tight_layout()
    plt.savefig(image_stream, format='png', dpi=100)
    image_stream.seek(0)
    doc.add_picture(image_stream, width=Inches(6))
    plt.close()
    
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

def calculate_co_attainment(data):
    """Calculate CO attainment based on student data and weightages"""
    co_weightages = data.get('coWeightages', {})
    student_data = data.get('studentData', {})
    co_attainment_criteria = data.get('coAttainmentCriteria', {})
    copo_mapping_data = data.get('copoMappingData', {})
    target_attainment = data.get('targetAttainment', {})
    
    student_performance = []
    averages = {}
    program_attainment = {}
    attainment_summary = {
        "weights": {},
        "students_scored3": {},
        "percentage_scored3": {},
        "attainment_level": {},
        "overall_attainment": 0
    }
    
    cos = list(co_weightages.keys())
    
    if student_data and 'maxMarks' in student_data and 'data' in student_data:

        assessment_components = [(comp, max_mark) for comp, max_mark in student_data['maxMarks'].items() 
                                if 'Total' not in comp]
        
    
        for student in student_data['data']:
            student_result = {
                "id": student.get("Unique Id."),
                "rollNumber": student.get("Student Name", ""),
                "coScores": {}
            }
            
            for co in cos:
                weighted_score = 0
                total_weight = 0
                
                for component, max_mark in assessment_components:
                    component_key = component.lower()
                    
                    co_component = None
                    for key in co_weightages.get(co, {}):
                        if component.lower().split('(')[0].strip() in key.lower():
                            co_component = key
                            break
                    
                    if co_component:
                        student_score = float(student.get(component, 0))
                        max_mark = float(max_mark if max_mark else 0)
                        co_weight = float(co_weightages[co].get(co_component, 0))
                        
                        weighted_score += (student_score * (co_weight / 100))
                        total_weight += (max_mark * (co_weight / 100))
                
                partial = float(co_attainment_criteria.get(co, {}).get('partial', 0))
                full = float(co_attainment_criteria.get(co, {}).get('full', 0))
                
                percentage = (weighted_score / total_weight) * 100 if total_weight > 0 else 0
                
                if percentage >= full:
                    student_result['coScores'][co] = 3
                elif percentage >= partial:
                    student_result['coScores'][co] = 2
                else:
                    student_result['coScores'][co] = 1
            
            student_performance.append(student_result)
    
    attainment_summary["weights"] = calculate_co_weights(co_weightages, student_data)
    
    for co in cos:
        scores = [student['coScores'].get(co, 0) for student in student_performance]
        avg = sum(scores) / len(scores) if scores else 0
        averages[co] = f"{avg:.2f}"
        
        scored3_count = sum(1 for score in scores if score >= 3)
        attainment_summary["students_scored3"][co] = scored3_count
        
        percentage_scored3 = (scored3_count / len(scores)) * 100 if scores else 0
        attainment_summary["percentage_scored3"][co] = f"{percentage_scored3:.2f}%"
        
        if target_attainment and co in target_attainment:
            full = float(target_attainment[co].get('full', 0))
            partial = float(target_attainment[co].get('partial', 0))
            
            if percentage_scored3 >= full:
                attainment_summary["attainment_level"][co] = 3
            elif percentage_scored3 >= partial:
                attainment_summary["attainment_level"][co] = 2
            else:
                attainment_summary["attainment_level"][co] = 1
        else:
            if co_attainment_criteria and co in co_attainment_criteria:
                full = float(co_attainment_criteria[co].get('full', 0))
                partial = float(co_attainment_criteria[co].get('partial', 0))
                
                if percentage_scored3 >= full:
                    attainment_summary["attainment_level"][co] = 3
                elif percentage_scored3 >= partial:
                    attainment_summary["attainment_level"][co] = 2
                else:
                    attainment_summary["attainment_level"][co] = 1
            else:
                attainment_summary["attainment_level"][co] = 1
    
    attainment_values = list(attainment_summary["attainment_level"].values())
    attainment_summary["overall_attainment"] = sum(attainment_values) / len(attainment_values) if attainment_values else 0
    
    program_attainment = calculate_program_attainment(copo_mapping_data, averages)
    
    return {
        "student_performance": student_performance,
        "averages": averages,
        "program_attainment": program_attainment,
        "attainment_summary": attainment_summary
    }

def calculate_co_weights(co_weightages, student_data):
    """Calculate CO weights based on assessment components"""
    cos = list(co_weightages.keys())
    weights = {}
    
    if not student_data or 'maxMarks' not in student_data:
        return {co: "0.00%" for co in cos}
    
    assessment_components = [(comp, mark) for comp, mark in student_data['maxMarks'].items() 
                            if 'Total' not in comp]
    total_max_marks = sum(float(mark or 0) for _, mark in assessment_components)
    
    for co in cos:
        co_weighted_sum = 0
        
        for component, max_mark in assessment_components:
            # Match component to co_weightages keys (case-insensitive)
            co_component = None
            for key in co_weightages.get(co, {}):
                if component.lower().split('(')[0].strip() in key.lower():
                    co_component = key
                    break
            
            if co_component:
                co_weight = float(co_weightages[co].get(co_component, 0))
                co_weighted_sum += (float(max_mark or 0) * (co_weight / 100))
        
        # Calculate percentage weight
        weight_percentage = (co_weighted_sum / total_max_marks * 100) if total_max_marks > 0 else 0
        weights[co] = f"{weight_percentage:.2f}%"
    
    return weights

def calculate_program_attainment(copo_mapping_data, averages):
    """Calculate program attainment based on CO-PO mapping and CO averages"""
    program_attainments = {}
    weight_sums = {}
    
    all_pos = set()
    for co, po_mappings in copo_mapping_data.get('mappingData', {}).items():
        all_pos.update(po_mappings.keys())
    
    for po in all_pos:
        program_attainments[po] = 0
        weight_sums[po] = 0
    
    for co, po_mappings in copo_mapping_data.get('mappingData', {}).items():
        for po, mapping_value in po_mappings.items():
            mapping_value = float(mapping_value) if mapping_value and mapping_value.strip() else 0
            co_average = float(averages.get(co, 0))
            
            program_attainments[po] += mapping_value * co_average
            weight_sums[po] += mapping_value
    
    for po in program_attainments:
        if weight_sums[po] > 0:
            program_attainments[po] = f"{program_attainments[po] / weight_sums[po]:.2f}"
        else:
            program_attainments[po] = "0.00"
    
    return program_attainments


def set_cell_border(cell, border_type, border_size, border_color):
    """Set cell border properties"""
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



create_co_attainment_analysis(doc, data)

#########################################################################################################################

def create_learner_categorization(doc, data):
    doc.add_page_break()
    heading = doc.add_heading(level=1)
    run = heading.add_run('13. Student Learning Categories')
    run.font.name = 'Carlito'
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(28, 132, 196)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    doc.add_paragraph()
    
    student_data = data.get("studentData", {}).get("data", [])
    learner_categories = data.get("learnerCategories", [])
    
    advanced_ids = {student["id"] for student in learner_categories[0]} if len(learner_categories) > 0 else set()
    slow_ids = {student["id"] for student in learner_categories[1]} if len(learner_categories) > 1 else set()
    
    
    advanced_learners = []
    slow_learners = []
    medium_learners = []
    for student in student_data:
        unique_id = student.get("Unique Id.")
        if unique_id in advanced_ids:
            advanced_learners.append(student)
        elif unique_id in slow_ids:
            slow_learners.append(student)
        else:
            medium_learners.append(student)
            
    summary_heading = doc.add_heading('Learner Categories Summary', level=2)
    summary_heading.runs[0].font.size = Pt(14)
    doc.add_paragraph()
    
    summary_table = doc.add_table(rows=4, cols=2)
    summary_table.autofit = False
    
    header_cells = summary_table.rows[0].cells
    header_cells[0].text = "Learner Category"
    header_cells[1].text = "Number of Students"
    format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    format_cell(header_cells[1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    
    categories = [
        ("Advanced Learners", len(advanced_learners)),
        ("Medium Learners", len(medium_learners)),
        ("Slow Learners", len(slow_learners))
    ]
    for idx, (category, count) in enumerate(categories):
        row = summary_table.rows[idx + 1]
        row.cells[0].text = category
        row.cells[1].text = str(count)
        format_cell(row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(row.cells[1], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
    col_widths = [Inches(3), Inches(3)]
    set_table_column_widths(summary_table, col_widths)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.autofit = False
    for row in summary_table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')
    for row in summary_table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9)
    prevent_table_row_breaks(summary_table)
    doc.add_paragraph().add_run().add_break()
    
    detailed_heading = doc.add_heading('Student Learning Classification', level=2)
    detailed_heading.runs[0].font.size = Pt(14)
    doc.add_paragraph()
    
    total_students = len(student_data)
    student_table = doc.add_table(rows=total_students + 1, cols=2)
    student_table.autofit = False
    
    header_cells = student_table.rows[0].cells
    header_cells[0].text = "Student Name"
    header_cells[1].text = "Category"
    format_cell(header_cells[0], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    format_cell(header_cells[1], bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    col_widths = [Inches(3), Inches(3)]
    set_table_column_widths(student_table, col_widths)
    
    all_students = advanced_learners + medium_learners + slow_learners
    for idx, student in enumerate(all_students):
        row = student_table.rows[idx + 1]
        name = student.get("Student Name", "")
        unique_id = student.get("Unique Id.")
        if unique_id in advanced_ids:
            category = "Advanced Learner"
            color = "C6E0B4"  # green
        elif unique_id in slow_ids:
            category = "Slow Learner"
            color = "FFEB9C"  # yellow
        else:
            category = "Medium Learner"
            color = "F2F2F2"  # grey

        row.cells[0].text = name
        row.cells[1].text = category
        format_cell(row.cells[0], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(row.cells[1], bold=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        
        for cell in row.cells:
            tc_pr = cell._tc.get_or_add_tcPr()
            shading = OxmlElement('w:shd')
            shading.set(qn('w:val'), 'clear')
            shading.set(qn('w:color'), 'auto')
            shading.set(qn('w:fill'), color)
            existing_shading = tc_pr.find(qn('w:shd'))
            if existing_shading is not None:
                tc_pr.remove(existing_shading)
            tc_pr.append(shading)
    
    student_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    student_table.autofit = False
    for row in student_table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')
    for row in student_table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9)
    prevent_table_row_breaks(student_table)
    doc.add_paragraph()
    
create_learner_categorization(doc, data)



########################################################################################################################

# Feedback Data Section
def create_feedback_section(doc, data):
    if data.get('feedbackData'):
        doc.add_page_break()
        feedback_heading = doc.add_heading(level=1)
        feedback_run = feedback_heading.add_run('25. Student Feedback')
        feedback_run.font.name = 'Carlito'
        feedback_run.font.size = Pt(16)
        feedback_run.font.color.rgb = RGBColor(28, 132, 196)
        feedback_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        if data['feedbackData'].get('quantitativeFeedback'):
            quant_heading = doc.add_paragraph()
            quant_heading_run = quant_heading.add_run('Quantitative Feedback:')
            quant_heading_run.bold = True
            quant_heading_run.font.size = Pt(12)
            quant_heading.paragraph_format.left_indent = Inches(0.7)
            
            quant_para = doc.add_paragraph()
            quant_para.paragraph_format.left_indent = Inches(0.7)
            quant_para.paragraph_format.right_indent = Inches(0.5)
            quant_run = quant_para.add_run(f"Average Rating: {data['feedbackData']['quantitativeFeedback']}/5")
            quant_run.font.size = Pt(12)
        
        if data['feedbackData'].get('qualitativeFeedback'):
            doc.add_paragraph()  # Add space
            qual_heading = doc.add_paragraph()
            qual_heading_run = qual_heading.add_run('Qualitative Feedback:')
            qual_heading_run.bold = True
            qual_heading_run.font.size = Pt(12)
            qual_heading.paragraph_format.left_indent = Inches(0.7)
            
            qual_para = doc.add_paragraph()
            qual_para.paragraph_format.left_indent = Inches(0.7)
            qual_para.paragraph_format.right_indent = Inches(0.5)
            qual_para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            qual_run = qual_para.add_run(data['feedbackData']['qualitativeFeedback'])
            qual_run.font.size = Pt(12)

def create_faculty_review_section(doc, data):
    if data.get('facultyCourseReview'):
        doc.add_page_break()
        review_heading = doc.add_heading(level=1)
        review_run = review_heading.add_run('26. Faculty Course Review')
        review_run.font.name = 'Carlito'
        review_run.font.size = Pt(16)
        review_run.font.color.rgb = RGBColor(28, 132, 196)
        review_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        review_para = doc.add_paragraph()
        review_para.paragraph_format.left_indent = Inches(0.7)
        review_para.paragraph_format.right_indent = Inches(0.5)
        review_para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        review_run = review_para.add_run(data['facultyCourseReview'])
        review_run.font.size = Pt(12)

create_feedback_section(doc, data)
create_faculty_review_section(doc, data)

#######################################################################################################################

unique_suffix = uuid.uuid4().hex
output_doc = './download/' + data['filename'][:-4] + "_" + unique_suffix + '.docx'
doc.save(output_doc)
print("Document updated and saved:", output_doc)

lock_path = "./download/conversion.lock"
lock = FileLock(lock_path, timeout=60)  
try:
    with lock:
        print("Acquired lock for conversion.")
        try:
            convert(output_doc)
        except Exception as e:
            print("Conversion error:", e)
            sys.exit(1)
        print("Conversion completed for:", output_doc)
except Timeout:
    print("Could not acquire lock for conversion. Another process may be converting.")
    sys.exit(1)

pdf_path = output_doc.replace('.docx', '.pdf')

try:
    os.remove(output_doc)
    print("Removed temporary DOCX:", output_doc)
except Exception as e:
    print("Error removing DOCX file:", e)

if data.get('assignmentPDF'):
    pdf_list = [pdf_path, "./data/assignments/" + data['assignmentPDF']]
else:
    pdf_list = [pdf_path]

merger = PdfMerger()
for pdf in pdf_list:
    print("Appending PDF:", pdf)
    merger.append(pdf)

final_pdf_path = "./download/" + data['filename']
merger.write(final_pdf_path)
merger.close()
print("Final PDF generated:", final_pdf_path)

for pdf in pdf_list:
    if pdf != final_pdf_path and pdf.startswith("./download/") and os.path.exists(pdf):
        try:
            os.remove(pdf)
            print("Removed temporary PDF:", pdf)
        except Exception as e:
            print("Error removing temporary PDF file:", e)

if os.path.exists(lock_path):
    try:
        os.remove(lock_path)
        print("Removed lock file:", lock_path)
    except Exception as e:
        print("Error removing lock file:", e)