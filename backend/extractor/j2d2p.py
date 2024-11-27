import json
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
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

header = ""

# code for adding sessions and other data
def rep(doc, key):
    for paragraph in doc.paragraphs:
        placeholder = f'{{{{{key}}}}}'
        if placeholder in paragraph.text:
                value = data.get(key, "")
                paragraph.text = paragraph.text.replace(placeholder, value)

if data.get('Program'):
    rep(doc,"Program")

if data.get('Session'):
    rep(doc,"Session")

if data.get('course_name'):
    rep(doc,"course_name")
    header = header+data.get("course_name", "")+" ("

if data.get('course_code'):
    rep(doc,"course_code")
    header = header+data.get("course_code", "")+") Sem: "

if data.get('Module/Semester'):
    rep(doc,"Module/Semester")
    header = header+data.get("Module/Semester", "")

#######################################################################################################################

#code for adding header
section = doc.sections[0]
section.different_first_page_header_footer = True

# First page header
first_page_header = section.first_page_header
first_page_paragraph = first_page_header.paragraphs[0] if first_page_header.paragraphs else first_page_header.add_paragraph()
first_page_paragraph.text = header
first_page_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT  # Right-aligned header for the first page
first_page_paragraph.paragraph_format.right_indent = Inches(0.5)  # 0.5-inch margin from the right

# Header for the rest of the pages
default_header = section.header
default_paragraph = default_header.paragraphs[0] if default_header.paragraphs else default_header.add_paragraph()
default_paragraph.text = header
default_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT  # Right-aligned header for other pages
default_paragraph.paragraph_format.right_indent = Inches(0.5)  # 0.5-inch margin from the right

########################################################################################################################

# Course Description and its objectives
if data.get('course_description'):
    # Add page break only if the document is not empty or already on a new page
    if doc.paragraphs and doc.paragraphs[-1].text.strip():
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

##################################################################################################################

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

    if data['copoMappingData'].get('tableMode') == 'image':
        image_path = data['copoMappingData'].get('imagePath', '')
        if image_path:
            doc.add_paragraph()
            doc.add_picture("."+image_path, width=Inches(6.0))  # Adjust width as needed
    else:
        if data['copoMappingData'].get('mappingData'):
            doc.add_paragraph()
            course_outcomes_heading = doc.add_paragraph()
            course_outcomes_run = course_outcomes_heading.add_run('CO/PO Mapping:')
            course_outcomes_run.bold = True
            course_outcomes_run.font.size = Pt(12)
            course_outcomes_heading.paragraph_format.left_indent = Inches(0.7)
            course_outcomes_heading.paragraph_format.right_indent = Inches(0.5)
            course_outcomes_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

            co_po_mapping = data['copoMappingData']['mappingData']

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

#################################################################################################################

# Course Syllabus Table
if data.get('Course Syllabus'):
    doc.add_page_break()
    syllabus_heading = doc.add_heading(level=1)
    syllabus_run = syllabus_heading.add_run('8. Course Syllabus')
    syllabus_run.font.name = 'Carlito'
    syllabus_run.font.size = Pt(16)
    syllabus_run.font.color.rgb = RGBColor(28, 132, 196)
    syllabus_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Create table
    table = doc.add_table(rows=1, cols=4)  # 4 columns for srNo, content, co, sessions
    
    # Set header cells
    hdr_cells = table.rows[0].cells
    headers = ['Sr. No.', 'Content', 'CO', 'Sessions']
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        # Make headers bold
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)

    # Add data rows
    for item in data['Course Syllabus']:
        row_cells = table.add_row().cells
        row_cells[0].text = str(item.get('srNo', ''))
        row_cells[1].text = str(item.get('content', ''))
        row_cells[2].text = str(item.get('co', ''))
        row_cells[3].text = str(item.get('sessions', ''))
        
        # Set font size for data cells
        for cell in row_cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths
    widths = [Inches(0.8), Inches(3.5), Inches(0.8), Inches(0.8)]
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = widths[idx]

    # Add borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Set table alignment to center
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

#############################################################################################################

def create_learning_resources_doc(data):
    # Add Learning Resources heading
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('9. Learning Resources')
    timetable_run.font.name = 'Carlito'
    timetable_run.font.size = Pt(16)
    timetable_run.font.color.rgb = RGBColor(28, 132, 196)
    timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    # Add "Text Books:" subheading
    textbooks_para = doc.add_paragraph()
    textbooks_run = textbooks_para.add_run("Text Books:")
    textbooks_run.bold = True
    textbooks_run.font.size = Pt(12)
    
    # Add textbooks with checkmarks
    if data.get('textBooks'):
        for book in data['textBooks']:
            para = doc.add_paragraph()
            check = para.add_run("✓ ")
            check.bold = True
            check.font.size = Pt(12)
            book_text = para.add_run(book)
            book_text.font.size = Pt(12)
    
    doc.add_paragraph()  # Add spacing
    
    # Add "Reference Links:" subheading
    ref_para = doc.add_paragraph()
    ref_run = ref_para.add_run("Reference Links:")
    ref_run.bold = True
    ref_run.font.size = Pt(12)
    
    # Add reference links with manual bullet points
    if data.get('referenceLinks'):
        for link in data['referenceLinks']:
            para = doc.add_paragraph()
            # Add bullet point manually
            bullet = para.add_run("• ")
            bullet.font.size = Pt(12)
            # Add link
            link_run = para.add_run(link)
            link_run.font.size = Pt(12)
            link_run.font.color.rgb = RGBColor(0, 0, 255)  # Blue color for links
            link_run.underline = True

create_learning_resources_doc(data["Learning Resources"])

############################################################################################################

if data.get('weeklyTimetableData'):
    # Add a page break and heading for Weekly Timetable
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('10. Weekly Timetable')
    timetable_run.font.name = 'Carlito'
    timetable_run.font.size = Pt(16)
    timetable_run.font.color.rgb = RGBColor(28, 132, 196)
    timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Get time slots from any day (they're the same for all days)
    time_slots = list(data['weeklyTimetableData']['Monday'].keys())
    days = list(data['weeklyTimetableData'].keys())

    # Create a table with days as columns and time slots as rows
    # Add 1 to rows for the header
    table = doc.add_table(rows=len(time_slots) + 1, cols=len(days) + 1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Add header row with days
    header_cells = table.rows[0].cells
    header_cells[0].text = 'Time'
    for i, day in enumerate(days):
        header_cells[i + 1].text = day
        # Style header cells
        paragraph = header_cells[i + 1].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(day)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Style the "Time" header cell
    time_paragraph = header_cells[0].paragraphs[0]
    time_run = time_paragraph.runs[0] if time_paragraph.runs else time_paragraph.add_run('Time')
    time_run.bold = True
    time_run.font.size = Pt(10)
    time_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate time slots and availability
    for i, time_slot in enumerate(time_slots):
        row_cells = table.rows[i + 1].cells
        # Add time slot
        row_cells[0].text = time_slot
        
        # Add availability for each day
        for j, day in enumerate(days):
            is_available = data['weeklyTimetableData'][day][time_slot]
            cell = row_cells[j + 1]
            cell.text = data['course_name'] + " (" + data['course_code']+")" if is_available else ''
            
            # Style cells
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                run.font.size = Pt(10)

    # Set column widths
    column_widths = [Inches(1.5)] + [Inches(1.2)] * len(days)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

############################################################################################################

if data.get('studentListData'):
    # Add a page break and heading for the Student List
    doc.add_page_break()
    student_list_heading = doc.add_heading(level=1)
    student_list_run = student_list_heading.add_run('11. Student List')
    student_list_run.font.name = 'Carlito'
    student_list_run.font.size = Pt(16)
    student_list_run.font.color.rgb = RGBColor(28, 132, 196)
    student_list_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Extract the content for the student list
    student_list_content = data['studentListData']

    # Dynamically generate headers from the first dictionary in the content
    headers = list(student_list_content[0].keys())

    # Create a table with the number of columns based on headers
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Populate header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        # Style header cells
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate rows with student list content
    for entry in student_list_content:
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(entry.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths (adjustable based on the content)
    column_widths = [Inches(2.0)] + [Inches(1.5)] * (len(headers) - 1)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)


#############################################################################################################

if data.get('internalAssessmentData') and data['internalAssessmentData'].get('components'):
    # Add a page break and heading for Internal Assessment Data
    doc.add_page_break()
    assessment_heading = doc.add_heading(level=1)
    assessment_run = assessment_heading.add_run('12. Internal Assessment Data')
    assessment_run.font.name = 'Carlito'
    assessment_run.font.size = Pt(16)
    assessment_run.font.color.rgb = RGBColor(28, 132, 196)
    assessment_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Extract the components dictionary
    components = data['internalAssessmentData']['components']

    # Generate headers dynamically from the first component
    headers = list(next(iter(components.values())).keys())

    # Create a table with the number of columns based on headers
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Populate header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header.capitalize()  # Capitalize for better formatting
        # Style header cells
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate rows with component data
    for component_id, component_data in components.items():
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(component_data.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths (adjustable based on content)
    column_widths = [Inches(1.5)] * len(headers)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

#############################################################################################################

if data.get('weakStudentsData'):
    # Add a page break and heading for Weak Students Data
    doc.add_page_break()
    heading = doc.add_heading(level=1)
    heading_run = heading.add_run('13. Weak Students Data')
    heading_run.font.name = 'Carlito'
    heading_run.font.size = Pt(16)
    heading_run.font.color.rgb = RGBColor(28, 132, 196)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Extract and filter the content for weak students who are accepted
    weak_students_data = [student for student in data['weakStudentsData'] if student['status'] == 'Accepted']

    # Define the headers (excluding 'status')
    headers = ['uniqueId', 'studentName', 'totalMarks', 'grade']

    # Create a table with the number of columns based on headers
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Populate header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        # Style header cells
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate rows with weak students data
    for entry in weak_students_data:
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(entry.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths (auto-adjustable based on the content)
    column_widths = [Inches(2.0)] + [Inches(1.5)] * (len(headers) - 1)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

############################################################################################################################################

def create_actions_doc(data):
    # Add heading with bullet points
    if data.get('actionsForWeakStudentsData'):
        # Add the main heading
        doc.add_page_break()
        timetable_heading = doc.add_heading(level=1)
        timetable_run = timetable_heading.add_run('14. Actions taken for weak students')
        timetable_run.font.name = 'Carlito'
        timetable_run.font.size = Pt(16)
        timetable_run.font.color.rgb = RGBColor(28, 132, 196)
        timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        # Add actions with bullet points
        for action in data['actionsForWeakStudentsData']:
            para = doc.add_paragraph()
            # Add bullet point
            bullet = para.add_run("• ")
            bullet.font.size = Pt(12)
            # Add action text
            action_text = para.add_run(action)
            action_text.font.size = Pt(12)

create_actions_doc(data)


#############################################################################################################

if data.get('marksDetailsData'):
    # Add a page break and heading for Marks Details
    doc.add_page_break()
    marks_heading = doc.add_heading(level=1)
    marks_run = marks_heading.add_run('15. Marks Details')
    marks_run.font.name = 'Carlito'
    marks_run.font.size = Pt(16)
    marks_run.font.color.rgb = RGBColor(28, 132, 196)
    marks_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Extract the content for the marks details
    marks_content = data['marksDetailsData']

    # Dynamically generate headers from the first dictionary in the content
    headers = list(marks_content[0].keys())

    # Create a table with the number of columns based on headers
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Populate header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        # Style header cells
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate rows with marks content
    for entry in marks_content:
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(entry.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths (auto-adjustable based on the content)
    column_widths = [Inches(2.0)] + [Inches(1.5)] * (len(headers) - 1)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

#############################################################################################################

if data.get('assignmentsTaken'):
    # Add a page break and heading for Weekly Timetable
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('16. assignmentsTaken')
    timetable_run.font.name = 'Carlito'
    timetable_run.font.size = Pt(16)
    timetable_run.font.color.rgb = RGBColor(28, 132, 196)
    timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Extract the content for the timetable
    timetable_content = data['assignmentsTaken']['content']

    # Dynamically generate headers from the first dictionary in the content
    headers = list(timetable_content[0].keys())

    # Create a table with the number of columns based on headers
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Populate header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        # Style header cells
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate rows with timetable content
    for entry in timetable_content:
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(entry.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths (auto-adjustable based on the content)
    column_widths = [Inches(2.0)] + [Inches(1.5)] * (len(headers) - 1)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)

#############################################################################################################

if data.get('attendanceReportData'):
    # Add a page break and heading for Attendance Report
    doc.add_page_break()
    timetable_heading = doc.add_heading(level=1)
    timetable_run = timetable_heading.add_run('17. Attendance Report')
    timetable_run.font.name = 'Carlito'
    timetable_run.font.size = Pt(16)
    timetable_run.font.color.rgb = RGBColor(28, 132, 196)
    timetable_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()

    # Extract the content for the attendance report
    attendance_content = data['attendanceReportData']

    # Dynamically generate headers from the first dictionary in the content
    headers = list(attendance_content[0].keys())

    # Create a table with the number of columns based on headers
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Populate header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        # Style header cells
        paragraph = hdr_cells[i].paragraphs[0]
        run = paragraph.runs[0] if paragraph.runs else paragraph.add_run(header)
        run.bold = True
        run.font.size = Pt(10)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Populate rows with attendance content
    for entry in attendance_content:
        row_cells = table.add_row().cells
        for i, key in enumerate(headers):
            row_cells[i].text = str(entry.get(key, ''))
            # Style cells
            for paragraph in row_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    # Set column widths (auto-adjustable based on the content)
    column_widths = [Inches(2.0)] + [Inches(1.5)] * (len(headers) - 1)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx < len(column_widths):
                cell.width = column_widths[idx]

    # Apply borders to cells
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

    # Apply borders to all cells
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, 'top', 4, '000000')
            set_cell_border(cell, 'bottom', 4, '000000')
            set_cell_border(cell, 'left', 4, '000000')
            set_cell_border(cell, 'right', 4, '000000')

    # Prevent table rows from splitting across pages
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)


###############################################################################################################################################




#SAVING
doc.save('./download/'+data['filename'][:-4]+'.docx')

print("Document updated and saved.")

convert('./download/'+data['filename'][:-4]+'.docx')
os.remove('./download/'+data['filename'][:-4]+'.docx')