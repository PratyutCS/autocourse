
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